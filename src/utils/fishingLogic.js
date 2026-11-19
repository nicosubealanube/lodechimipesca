export function getWindDirectionLabel(degrees) {
    if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return '';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const normalized = ((degrees % 360) + 360) % 360;
    const index = Math.round(normalized / 45) % 8;
    return directions[index];
}

export function getDominantWindDirection(directionsArr) {
    if (!directionsArr || directionsArr.length === 0) return '';
    let sinSum = 0;
    let cosSum = 0;
    directionsArr.forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        sinSum += Math.sin(rad);
        cosSum += Math.cos(rad);
    });
    const avgRad = Math.atan2(sinSum / directionsArr.length, cosSum / directionsArr.length);
    const avgDeg = ((avgRad * 180) / Math.PI + 360) % 360;
    return getWindDirectionLabel(avgDeg);
}

export function getFishingSummary(data) {
    if (!data || !data.temperature_2m || data.temperature_2m.length === 0) {
        return null;
    }

    const temps = data.temperature_2m.filter((v) => v !== null && v !== undefined);
    const winds = data.wind_speed_10m.filter((v) => v !== null && v !== undefined);
    const pressures = data.surface_pressure.filter((v) => v !== null && v !== undefined);
    const rawWaves = Array.isArray(data.wave_height)
        ? data.wave_height.filter((v) => typeof v === 'number' && !Number.isNaN(v))
        : [];
    const hasWaveSeries = rawWaves.length > 0;
    const maxRawWave = hasWaveSeries ? Math.max(...rawWaves) : 0;
    // Open-Meteo Marine API returns all zeros or <0.05m for inland/sheltered river spots;
    // only display the Oleaje metric card when there are meaningful non-zero readings.
    const hasWaves = hasWaveSeries && maxRawWave >= 0.05;

    if (temps.length === 0 || winds.length === 0 || pressures.length === 0) {
        return null;
    }

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length;
    const minWind = Math.min(...winds);
    const maxWind = Math.max(...winds);
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    const minPressure = Math.min(...pressures);
    const maxPressure = Math.max(...pressures);
    const avgWave = hasWaveSeries ? rawWaves.reduce((a, b) => a + b, 0) / rawWaves.length : 0;
    const minWave = hasWaves ? Math.min(...rawWaves) : 0;
    const maxWave = hasWaves ? maxRawWave : 0;
    const dominantWindDir = getDominantWindDirection(
        (data.wind_direction_10m || []).filter((v) => v !== null && v !== undefined)
    );

    let level = 'regular';
    let badge = 'REGULAR';
    let headline = 'Día regular para pescar';
    let subtitle = 'Puede haber pique, con condiciones medias';
    let bannerText = '😐 Día regular. Puede haber pique, pero condiciones medias.';
    let score = 0;

    if (avgWind < 10) score += 3;
    else if (avgWind < 20) score += 2;
    else if (avgWind < 30) score += 1;

    if (avgPressure >= 1010 && avgPressure <= 1020) score += 2;
    else if (avgPressure >= 1000 && avgPressure <= 1025) score += 1;

    if (hasWaveSeries) {
        if (avgWave < 0.3) score += 2;
        else if (avgWave < 0.6) score += 1;
    } else {
        score += 1;
    }

    if (avgTemp >= 15 && avgTemp <= 28) score += 1;

    if (avgWind > 17 && avgWave > 0.4 && avgPressure < 1013) {
        level = 'difficult';
        badge = 'DIFÍCIL';
        headline = 'Condiciones difíciles para pescar';
        subtitle = 'Viento fuerte, oleaje alto y presión baja';
        bannerText = '🚫 Poca actividad de peces y de pesca. Condiciones difíciles (Viento, Oleaje, Presión baja).';
    } else if (avgWave < 0.3 && avgWind < 12 && avgPressure > 1016) {
        level = 'excellent';
        badge = 'EXCELENTE';
        headline = '¡Excelente día para pescar!';
        subtitle = 'Poco viento, río calmo y presión alta';
        bannerText = '🎣 ¡EXCELENTE día! Condiciones inmejorables (Poco viento/oleaje, Presión alta).';
    } else if (score >= 7) {
        level = 'ideal';
        badge = 'IDEAL';
        headline = '¡Día ideal para pescar!';
        subtitle = 'Grandes probabilidades y clima muy favorable';
        bannerText = '🎣 ¡Día IDEAL para pescar! Grandes probabilidades.';
    } else if (score >= 5) {
        level = 'good';
        badge = 'BUENO';
        headline = 'Buen día para salir a pescar';
        subtitle = 'Condiciones favorables a lo largo de la jornada';
        bannerText = '🐟 Buen día para pescar. Condiciones favorables.';
    } else if (score >= 3) {
        level = 'regular';
        badge = 'REGULAR';
        headline = 'Día regular para pescar';
        subtitle = 'Puede haber pique, con condiciones medias';
        bannerText = '😐 Día regular. Puede haber pique, pero condiciones medias.';
    } else {
        level = 'difficult';
        badge = 'COMPLICADO';
        headline = 'Día complicado para pescar';
        subtitle = 'Condiciones climáticas poco ideales';
        bannerText = '⚠️ Día complicado. Condiciones climáticas no ideales.';
    }

    return {
        level,
        badge,
        headline,
        subtitle,
        bannerText,
        score,
        maxScore: 8,
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        avgTemp: Math.round(avgTemp),
        minWind: Math.round(minWind),
        avgWind: Math.round(avgWind),
        maxWind: Math.round(maxWind),
        dominantWindDir,
        minPressure: Math.round(minPressure),
        maxPressure: Math.round(maxPressure),
        avgPressure: Math.round(avgPressure),
        isGoodPressure: avgPressure > 1015,
        hasWaves,
        minWave,
        avgWave,
        maxWave,
    };
}

export function getFishingPrediction(data) {
    const summary = getFishingSummary(data);
    if (!summary) return 'No hay datos suficientes';
    return summary.bannerText;
}
