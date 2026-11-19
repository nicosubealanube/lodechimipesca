import { getDominantWindDirection } from './fishingLogic';

/**
 * Utility to group 24-hour weather data into 4 major daily blocks with average conditions and fishing quality.
 */

function getBlockWeatherCategory(blockHours, blockId) {
    const codes = blockHours
        .map((h) => h.weatherCode)
        .filter((c) => c !== null && c !== undefined);

    const isNightBlock = blockId === 'early' || blockId === 'night';
    if (codes.length === 0) return isNightBlock ? 'clear_night' : 'clear_day';

    // Prioritize hazardous / wet conditions so fishermen immediately notice rain or storms
    if (codes.some((c) => c >= 95 && c <= 99)) return 'storm';
    if (codes.some((c) => (c >= 51 && c <= 67) || (c >= 80 && c <= 82))) return 'rain';
    if (codes.some((c) => c >= 71 && c <= 77)) return 'rain';
    if (codes.some((c) => c >= 45 && c <= 48)) return 'fog';

    // Otherwise check cloud cover frequency
    const cloudyCount = codes.filter((c) => c === 3).length;
    const partlyCount = codes.filter((c) => c === 1 || c === 2).length;
    const clearCount = codes.filter((c) => c === 0).length;

    if (cloudyCount >= clearCount && cloudyCount >= partlyCount && cloudyCount > 0) {
        return 'cloudy';
    }
    if (partlyCount > clearCount) {
        return isNightBlock ? 'cloudy' : 'partly_cloudy';
    }
    return isNightBlock ? 'clear_night' : 'clear_day';
}

export function getDayBlocks(data) {
    if (!data || !data.time || data.time.length === 0) return [];

    const blocksConfig = [
        { id: 'early', label: 'Madrugada', icon: '🌌', startHour: 0, endHour: 6, range: '00:00 a 06:00 hs' },
        { id: 'morning', label: 'Mañana', icon: '🌅', startHour: 6, endHour: 12, range: '06:00 a 12:00 hs' },
        { id: 'afternoon', label: 'Tarde', icon: '☀️', startHour: 12, endHour: 18, range: '12:00 a 18:00 hs' },
        { id: 'night', label: 'Noche', icon: '🌙', startHour: 18, endHour: 24, range: '18:00 a 00:00 hs' }
    ];

    const hasWaves = data.wave_height && data.wave_height.length > 0;

    return blocksConfig.map(config => {
        // Filter hours belonging to this block
        const blockHours = [];
        data.time.forEach((t, idx) => {
            const date = new Date(t);
            const hour = date.getHours();
            let belongs = false;

            if (config.startHour < config.endHour) {
                belongs = hour >= config.startHour && hour < config.endHour;
            } else {
                // Night block wraps around (hour >= 20 OR hour < 6)
                belongs = hour >= config.startHour || hour < config.endHour;
            }

            if (belongs) {
                blockHours.push({
                    time: t,
                    index: idx,
                    hourNum: hour,
                    temp: data.temperature_2m[idx],
                    wind: data.wind_speed_10m[idx],
                    windDir: data.wind_direction_10m ? data.wind_direction_10m[idx] : 0,
                    pressure: data.surface_pressure[idx],
                    weatherCode: data.weather_code ? data.weather_code[idx] : null,
                    isDay: data.is_day ? data.is_day[idx] : 1,
                    waveHeight: hasWaves ? data.wave_height[idx] : null
                });
            }
        });

        // Safeguard if a block is empty
        if (blockHours.length === 0) {
            return null;
        }

        // Calculate averages for this specific block
        const temps = blockHours.map(h => h.temp);
        const winds = blockHours.map(h => h.wind);
        const pressures = blockHours.map(h => h.pressure);
        const waves = hasWaves ? blockHours.map(h => h.waveHeight) : [];

        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length;
        const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
        const avgWave = hasWaves ? waves.reduce((a, b) => a + b, 0) / waves.length : 0;

        // Apply simplified getFishingPrediction scoring system to this block
        let blockScore = 0;

        // Wind factor
        if (avgWind < 10) blockScore += 3;
        else if (avgWind < 20) blockScore += 2;
        else if (avgWind < 30) blockScore += 1;

        // Pressure factor
        if (avgPressure >= 1010 && avgPressure <= 1020) blockScore += 2;
        else if (avgPressure >= 1000 && avgPressure <= 1025) blockScore += 1;

        // Wave factor
        if (hasWaves) {
            if (avgWave < 0.3) blockScore += 2;
            else if (avgWave < 0.6) blockScore += 1;
        } else {
            blockScore += 1;
        }

        // Temperature factor
        if (avgTemp >= 15 && avgTemp <= 28) blockScore += 1;

        // Wind speed description
        let windDesc = '';
        if (avgWind < 10) windDesc = 'Calma';
        else if (avgWind < 18) windDesc = 'Moderado';
        else windDesc = 'Fuerte';

        // Categorize block condition and styling class
        let condition = 'Regular';
        let conditionClass = 'neutral'; // success=Ideal, good=Bueno, neutral=Regular, danger=Difícil

        const isSevere = avgWind > 17 && avgWave > 0.4 && avgPressure < 1013;
        const isExcellent = avgWave < 0.3 && avgWind < 12 && avgPressure > 1016;

        if (isSevere) {
            condition = 'Difícil';
            conditionClass = 'danger';
        } else if (isExcellent || blockScore >= 7) {
            condition = 'Ideal';
            conditionClass = 'success';
        } else if (blockScore >= 5) {
            condition = 'Bueno';
            conditionClass = 'good';
        } else if (blockScore >= 3) {
            condition = 'Regular';
            conditionClass = 'neutral';
        } else {
            condition = 'Difícil';
            conditionClass = 'danger';
        }

        const dominantWindDir = getDominantWindDirection(blockHours.map(h => h.windDir));
        const weatherCategory = getBlockWeatherCategory(blockHours, config.id);

        return {
            ...config,
            tempStr: `${Math.round(avgTemp)}°C`,
            windStr: `🍃 ${Math.round(avgWind)} km/h (${windDesc})`,
            avgTemp: Math.round(avgTemp),
            avgWind: Math.round(avgWind),
            avgPressure: Math.round(avgPressure),
            dominantWindDir,
            weatherCategory,
            windDesc,
            condition,
            conditionClass,
            hours: blockHours
        };
    }).filter(block => block !== null);
}
