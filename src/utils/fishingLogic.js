export function getFishingPrediction(data) {
    if (!data || data.temperature_2m.length === 0) return "No hay datos suficientes"

    // Calculate averages
    const avgTemp = data.temperature_2m.reduce((a, b) => a + b, 0) / data.temperature_2m.length
    const avgWind = data.wind_speed_10m.reduce((a, b) => a + b, 0) / data.wind_speed_10m.length
    const avgPressure = data.surface_pressure.reduce((a, b) => a + b, 0) / data.surface_pressure.length

    // Simple logic for demonstration
    // Ideal: Low wind (< 15km/h), Moderate pressure (1010-1020 hPa), Moderate temp (15-25 C)

    let score = 0

    // Wind factor (most important)
    if (avgWind < 10) score += 3
    else if (avgWind < 20) score += 2
    else if (avgWind < 30) score += 1

    // Pressure factor
    if (avgPressure >= 1010 && avgPressure <= 1020) score += 2
    else if (avgPressure >= 1000 && avgPressure <= 1025) score += 1

    // Temperature factor
    if (avgTemp >= 15 && avgTemp <= 25) score += 1

    if (score >= 5) return "🎣 ¡Día IDEAL para pescar! Condiciones excelentes."
    if (score >= 3) return "🐟 Buen día para pescar. Condiciones aceptables."
    return "⚠️ Día complicado. Mucho viento o presión inestable."
}
