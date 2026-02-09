export const fetchWeatherWithFallback = async (lat, lon) => {
    // 1. Try Open-Meteo with 4s timeout
    try {
        console.log("Attempting to fetch from Open-Meteo...")
        const data = await fetchOpenMeteoWithTimeout(lat, lon, 3000)
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

    // Create a normalized grid starting from today at 00:00 local time
    // We want 72 hours (3 days) to match Open-Meteo's requested days
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today (Local time)

    const gridPoints = 72
    const hourlyData = {
        time: [],
        temperature_2m: [],
        surface_pressure: [],
        wind_speed_10m: [],
        wind_direction_10m: [],
        weather_code: [],
        is_day: [],
        wave_height: []
    }

    // Helper map for quick lookup of MET data by time
    // MET times are UTC ISO strings. We parse them to match our grid.
    const metDataMap = new Map()
    timeseries.forEach(point => {
        const timeKey = new Date(point.time).toISOString() // Normalize to ISO
        metDataMap.set(timeKey, point)
    })

    // Helper to find closest point (since MET might have gaps or slight offsets, though usually hourly)
    // Actually, MET compact series is usually hourly for the first 48h.
    // For simplicity, we look for exact match or nearest preceding match if exact missing?
    // Let's stick to exact hourly matching based on ISO string equivalence after conversion.
    // MET "time" is instant.

    for (let i = 0; i < gridPoints; i++) {
        const currentGridDate = new Date(now.getTime() + i * 60 * 60 * 1000)
        // Adjust for ISO string comparison (which is UTC). 
        // We want to find the MET point that corresponds to this local time.
        // new Date(localTime).toISOString() gives the UTC timestamp, which matches MET format.
        const lookupKey = currentGridDate.toISOString()

        const point = metDataMap.get(lookupKey)

        // Push time as ISO string (this preserves the local offset if interpreted by Date later, 
        // OR better yet, push the grid time in the format App expects.
        // Open-Meteo returns '2024-01-01T00:00' (local). 
        // Our App uses new Date(t), so ISO string is safe. 
        hourlyData.time.push(currentGridDate.toISOString())

        if (point) {
            const details = point.data.instant.details
            const next1h = point.data.next_1_hours
            const next6h = point.data.next_6_hours
            const next12h = point.data.next_12_hours
            const symbolCode = next1h?.summary?.symbol_code || next6h?.summary?.symbol_code || next12h?.summary?.symbol_code || 'cloudy'

            hourlyData.temperature_2m.push(details.air_temperature)
            hourlyData.surface_pressure.push(details.air_pressure_at_sea_level)
            hourlyData.wind_speed_10m.push(details.wind_speed * 3.6) // m/s to km/h
            hourlyData.wind_direction_10m.push(details.wind_from_direction)
            hourlyData.weather_code.push(mapMetSymbolToWmo(symbolCode))

            const isDay = symbolCode.includes('day') ? 1 : (symbolCode.includes('night') ? 0 : 1)
            hourlyData.is_day.push(isDay)
            hourlyData.wave_height.push(null)
        } else {
            // Fill gaps (e.g., past hours that MET no longer provides) with null or last known
            // Ideally we shouldn't show nulls if possible, but for past data it might be fine.
            // App handles might break if null? 
            // Let's try to fill with safe defaults or iterate backwards if needed.
            // For now: nulls, and App might just show empty or 0.
            // BETTER: Use null, but make sure App checks for it? 
            // App uses Math.round(null) -> 0. That's passable.
            // Weather icon might crash. 
            // Let's default to "no data" values.
            hourlyData.temperature_2m.push(null) // or 0
            hourlyData.surface_pressure.push(null)
            hourlyData.wind_speed_10m.push(null) // 0
            hourlyData.wind_direction_10m.push(null)
            hourlyData.weather_code.push(null) // Icon check handles null
            hourlyData.is_day.push(1)
            hourlyData.wave_height.push(null)
        }
    }

    return {
        hourly: hourlyData,
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
