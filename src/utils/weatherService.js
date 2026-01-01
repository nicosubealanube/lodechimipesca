export const fetchWeatherWithFallback = async (lat, lon) => {
    // 1. Try Open-Meteo with 4s timeout
    try {
        console.log("Attempting to fetch from Open-Meteo...")
        const data = await fetchOpenMeteoWithTimeout(lat, lon, 4000)
        console.log("Open-Meteo success")
        return data
    } catch (error) {
        console.warn("Open-Meteo failed or timed out:", error)
        console.log("Falling back to MET Norway...")
    }

    // 2. Fallback to MET Norway
    try {
        const data = await fetchMetNorway(lat, lon)
        console.log("MET Norway success")
        return data
    } catch (error) {
        console.error("MET Norway also failed:", error)
        throw new Error("Unable to fetch weather data from any source.")
    }
}

// --- OPEN-METEO IMPLEMENTATION ---

const fetchOpenMeteoWithTimeout = async (lat, lon, timeoutMs) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const [weatherResponse, marineResponse] = await Promise.all([
            fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,is_day&forecast_days=3&timezone=auto`,
                { signal: controller.signal }
            ),
            fetch(
                `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height&forecast_days=3&timezone=auto`,
                { signal: controller.signal }
            )
        ])

        if (!weatherResponse.ok) throw new Error(`Open-Meteo Weather error: ${weatherResponse.status}`)
        // Marine API might fail for non-marine locations, we can optionalize it or treat as error. 
        // For now, if marine fails, we proceed without it if possible, but Promise.all will reject.
        // Let's stick to the user's current logic: both must succeed, or we fail.
        if (!marineResponse.ok) throw new Error(`Open-Meteo Marine error: ${marineResponse.status}`)

        const weatherData = await weatherResponse.json()
        const marineData = await marineResponse.json()

        return mapOpenMeteoData(weatherData, marineData)
    } finally {
        clearTimeout(timeoutId)
    }
}

const mapOpenMeteoData = (weatherData, marineData) => {
    return {
        hourly: {
            time: weatherData.hourly.time,
            temperature_2m: weatherData.hourly.temperature_2m,
            surface_pressure: weatherData.hourly.surface_pressure,
            wind_speed_10m: weatherData.hourly.wind_speed_10m,
            wind_direction_10m: weatherData.hourly.wind_direction_10m,
            weather_code: weatherData.hourly.weather_code,
            is_day: weatherData.hourly.is_day,
            wave_height: marineData?.hourly?.wave_height || [],
        },
        source: 'Open-Meteo'
    }
}


// --- MET NORWAY IMPLEMENTATION ---

const fetchMetNorway = async (lat, lon) => {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`

    // MET Norway requires a unique User-Agent
    const headers = {
        'User-Agent': 'fishing-app/1.0 (contact@example.com)'
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
        throw new Error(`MET Norway error: ${response.status}`)
    }

    const data = await response.json()
    return mapMetNorwayData(data)
}

const mapMetNorwayData = (data) => {
    const timeseries = data.properties.timeseries

    // Arrays to populate
    const time = []
    const temperature_2m = []
    const surface_pressure = []
    const wind_speed_10m = []
    const wind_direction_10m = []
    const weather_code = []
    const is_day = [] // We need to calculate this
    const wave_height = [] // Not available often

    timeseries.forEach(point => {
        time.push(point.time)
        const details = point.data.instant.details

        temperature_2m.push(details.air_temperature)
        surface_pressure.push(details.air_pressure_at_sea_level)
        wind_speed_10m.push(details.wind_speed * 3.6) // m/s to km/h check? Open-Meteo defaults to km/h usually. App expects km/h.
        // Wait, Open-Meteo default is km/h. MET Norway is m/s. 
        // 1 m/s = 3.6 km/h.

        wind_direction_10m.push(details.wind_from_direction)

        // Symbol code (next 1 hour or 6 hours or 12 hours)
        const next1h = point.data.next_1_hours
        const next6h = point.data.next_6_hours
        const next12h = point.data.next_12_hours

        const symbolCode = next1h?.summary?.symbol_code || next6h?.summary?.symbol_code || next12h?.summary?.symbol_code || 'cloudy'
        weather_code.push(mapMetSymbolToWmo(symbolCode))

        // Simple is_day calculation based on hour (fallback)
        // Or check if symbol contains 'day' or 'night'
        const isDayValue = symbolCode.includes('day') ? 1 : (symbolCode.includes('night') ? 0 : 1)
        is_day.push(isDayValue)

        wave_height.push(null) // Not provided in compact
    })

    return {
        hourly: {
            time,
            temperature_2m,
            surface_pressure,
            wind_speed_10m,
            wind_direction_10m,
            weather_code,
            is_day,
            wave_height
        },
        source: 'MET Norway'
    }
}

// Map MET Norway descriptive codes to WMO numeric codes (approximate)
const mapMetSymbolToWmo = (symbol) => {
    // Remove day/night suffix
    const base = symbol.split('_')[0]

    const mapping = {
        'clearsky': 0,
        'fair': 1,
        'partlycloudy': 2,
        'cloudy': 3,
        'fog': 45,
        'heavyrain': 65,
        'heavyrainandthunder': 95,
        'heavyrainshowers': 82,
        'heavyrainshowersandthunder': 95,
        'heavysleet': 75,
        'heavysleetandthunder': 95,
        'heavysleetshowers': 86,
        'heavysleetshowersandthunder': 95,
        'heavysnow': 75,
        'heavysnowandthunder': 95,
        'heavysnowshowers': 86,
        'heavysnowshowersandthunder': 95,
        'lightrain': 61,
        'lightrainandthunder': 95,
        'lightrainshowers': 80,
        'lightrainshowersandthunder': 95,
        'lightsleet': 71, // sleet usually mix
        'lightsleetandthunder': 95,
        'lightsleetshowers': 85,
        'lightsnow': 71,
        'lightsnowandthunder': 95,
        'lightsnowshowers': 85,
        'lightssleetshowersandthunder': 95,
        'lightssnowshowersandthunder': 95,
        'rain': 63,
        'rainandthunder': 95,
        'rainshowers': 81,
        'rainshowersandthunder': 95,
        'sleet': 73,
        'sleetandthunder': 95,
        'sleetshowers': 85,
        'sleetshowersandthunder': 95,
        'snow': 73,
        'snowandthunder': 95,
        'snowshowers': 85,
        'snowshowersandthunder': 95
    }

    return mapping[base] !== undefined ? mapping[base] : 3 // Default to cloudy if unknown
}
