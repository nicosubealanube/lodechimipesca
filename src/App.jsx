import { useState } from 'react'
import Header from './components/Header'
import WeatherCard from './components/WeatherCard'
import Footer from './components/Footer'
import { getFishingPrediction } from './utils/fishingLogic'

const LOCATIONS = [
    { name: 'Cohelo - San Fernando', lat: -34.437601, lon: -58.537828 },
    { name: 'Costanera de Campana', lat: -34.1687, lon: -58.9591 },
    { name: 'Costanera de Zarate', lat: -34.0958, lon: -59.0242 },
    { name: 'Costanera Norte - Ribs al Rio', lat: -34.5444, lon: -58.4320 },
    { name: 'El Reloj - Tigre', lat: -34.407726, lon: -58.591651 },
    { name: 'Mon. a Colon - Aeroparque', lat: -34.556746, lon: -58.409459 },
    { name: 'Parana y el Rio - Vte Lopez', lat: -34.5228, lon: -58.4778 },
    { name: 'Parque de los Niños - Nuñez', lat: -34.526634, lon: -58.457030 },
    { name: 'Pejerrey Club Quilmes', lat: -34.7242, lon: -58.2608 },
]

const getFormattedDate = (offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    const options = { day: 'numeric', month: 'long' }
    return date.toLocaleDateString('es-AR', options)
}

const DATES = [
    { label: `Hoy ${getFormattedDate(0)}`, value: 0 },
    { label: `Mañana ${getFormattedDate(1)}`, value: 1 },
    { label: `Pasado Mañana ${getFormattedDate(2)}`, value: 2 },
]

function App() {
    const [location, setLocation] = useState(LOCATIONS[0])
    const [dateOffset, setDateOffset] = useState(DATES[0].value)
    const [weatherData, setWeatherData] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchWeather = async () => {
        setLoading(true)
        try {
            // Open-Meteo API (Weather & Marine)
            const [weatherResponse, marineResponse] = await Promise.all([
                fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,surface_pressure,wind_speed_10m,weather_code,is_day&forecast_days=3&timezone=auto`
                ),
                fetch(
                    `https://marine-api.open-meteo.com/v1/marine?latitude=${location.lat}&longitude=${location.lon}&hourly=wave_height&forecast_days=3&timezone=auto`
                )
            ])

            const weatherData = await weatherResponse.json()
            const marineData = await marineResponse.json()

            // Filter data for the selected day
            // Open-Meteo returns hourly data for all requested days in a single array
            // We need to slice the 24 hours corresponding to the selected day
            const startIndex = dateOffset * 24
            const endIndex = startIndex + 24

            const hourlyData = {
                time: weatherData.hourly.time.slice(startIndex, endIndex),
                temperature_2m: weatherData.hourly.temperature_2m.slice(startIndex, endIndex),
                surface_pressure: weatherData.hourly.surface_pressure.slice(startIndex, endIndex),
                wind_speed_10m: weatherData.hourly.wind_speed_10m.slice(startIndex, endIndex),
                weather_code: weatherData.hourly.weather_code.slice(startIndex, endIndex),
                is_day: weatherData.hourly.is_day.slice(startIndex, endIndex),
                wave_height: marineData.hourly.wave_height ? marineData.hourly.wave_height.slice(startIndex, endIndex) : [],
            }

            setWeatherData(hourlyData)
        } catch (error) {
            console.error("Error fetching weather:", error)
            alert("Error al obtener el clima. Por favor intente nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-container">
            <Header />

            <main className="main-content">
                <div className="controls">
                    <div className="control-group">
                        <label>¿Dónde vas a pescar?</label>
                        <select
                            value={location.name}
                            onChange={(e) => setLocation(LOCATIONS.find(l => l.name === e.target.value))}
                        >
                            {LOCATIONS.map(loc => (
                                <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>¿Cuándo vas a pescar?</label>
                        <select
                            value={dateOffset}
                            onChange={(e) => setDateOffset(Number(e.target.value))}
                        >
                            {DATES.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    <button className="primary-button" onClick={fetchWeather} disabled={loading}>
                        {loading ? 'Cargando...' : 'Clima y Pronóstico de Pesca'}
                    </button>
                </div>

                {weatherData && (
                    <div className="results-section">
                        <div className="prediction-banner">
                            {getFishingPrediction(weatherData)}
                        </div>
                        <WeatherCard data={weatherData} />
                    </div>
                )}
            </main>
            <Footer />
        </div >
    )
}

export default App
