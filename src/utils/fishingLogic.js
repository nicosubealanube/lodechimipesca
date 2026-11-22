export function getFishingPrediction(data) {
    if (!data || data.temperature_2m.length === 0) return "No hay datos suficientes"

    // Calculate averages
    const avgTemp = data.temperature_2m.reduce((a, b) => a + b, 0) / data.temperature_2m.length
    const avgWind = data.wind_speed_10m.reduce((a, b) => a + b, 0) / data.wind_speed_10m.length
    const avgPressure = data.surface_pressure.reduce((a, b) => a + b, 0) / data.surface_pressure.length
    // Handle case where wave_height might be empty or missing (e.g. land locations if API returns null, though we filtered it)
    const hasWaves = data.wave_height && data.wave_height.length > 0;
    const avgWave = hasWaves ? data.wave_height.reduce((a, b) => a + b, 0) / data.wave_height.length : 0;

    // Specific requested conditions
    // "si el viento esta por arriba de 17km/h, el oleaje esta alto, y la presion atmosferica baja"
    // Definitions: Wind > 17, Waves > 0.4 (River context), Pressure < 1013 (Standard is 1013.25)
    if (avgWind > 17 && avgWave > 0.4 && avgPressure < 1013) {
        return "🚫 Poca actividad de peces y de pesca. Condiciones difíciles (Viento, Oleaje, Presión baja)."
    }

    // "si hay poco oleaje, poco viento y presion atmosferica alta"
    // Definitions: Wind < 12, Waves < 0.3, Pressure > 1016
    if (avgWave < 0.3 && avgWind < 12 && avgPressure > 1016) {
        return "🎣 ¡EXCELENTE día! Condiciones inmejorables (Poco viento/oleaje, Presión alta)."
    }

    // General Scoring System
    let score = 0

    // Wind factor
    if (avgWind < 10) score += 3
    else if (avgWind < 20) score += 2
    else if (avgWind < 30) score += 1

    // Pressure factor
    if (avgPressure >= 1010 && avgPressure <= 1020) score += 2
    else if (avgPressure >= 1000 && avgPressure <= 1025) score += 1

    // Wave factor (if available)
    if (hasWaves) {
        if (avgWave < 0.3) score += 2
        else if (avgWave < 0.6) score += 1
    } else {
        // If no wave data, assume neutral/slight bonus if wind is low
        score += 1
    }

    // Temperature factor (Fish usually like stable, moderate temps)
    if (avgTemp >= 15 && avgTemp <= 28) score += 1

    if (score >= 7) return "🎣 ¡Día IDEAL para pescar! Grandes probabilidades."
    if (score >= 5) return "🐟 Buen día para pescar. Condiciones favorables."
    if (score >= 3) return "😐 Día regular. Puede haber pique, pero condiciones medias."
    return "⚠️ Día complicado. Condiciones climáticas no ideales."
}
