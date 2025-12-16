import { useState } from 'react'
import Header from './components/Header'
import WeatherCard from './components/WeatherCard'
import Footer from './components/Footer'
import LocationInfoCard from './components/LocationInfoCard'
import { getFishingPrediction } from './utils/fishingLogic'

import coheloImage from './assets/cohelo_san_fernando.png'
import costaneraImage from './assets/costanera_norte.jpg'
import monumentoImage from './assets/monumento_colon.png'
import relojImage from './assets/reloj_tigre.png'
import pejerreyImage from './assets/pejerrey_club.png'
import paranaImage from './assets/parana_vte_lopez.png'
import parqueImage from './assets/parque_ninos.jpg'
import asocArgPescaImage from './assets/asoc_arg_pesca.png'
import muelleMartinezImage from './assets/muelle_martinez.png'
import costaneraZarateImage from './assets/costanera_zarate.png'

const LOCATIONS = [
    {
        name: 'Asoc. Arg. de Pesca - CABA',
        lat: -34.596830,
        lon: -58.362605,
        details: {
            image: asocArgPescaImage,
            address: 'Av. Int. Hernan M. Giralt 22, CABA',
            parking: 'Si',
            bathrooms: 'Si',
            hours: '24hs',
            bait: '-',
            notes: 'Muelle privado.'
        }
    },
    {
        name: 'Cohelo - San Fernando',
        lat: -34.437601,
        lon: -58.537828,
        details: {
            image: coheloImage,
            address: 'Del Arca 400, San Fernando',
            parking: 'Gratuito',
            bathrooms: 'Si',
            hours: '8hs a 00hs',
            bait: 'Puesto fijo al ingresar',
            notes: 'Pueden pedir permiso de pesca. Tiene juegos de plaza.'
        }
    },

    {
        name: 'Costanera de Zarate - Zarate',
        lat: -34.10466,
        lon: -59.00514,
        details: {
            image: costaneraZarateImage,
            address: 'Costanera Luis Rocha 1859, Zárate',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: '-',
            notes: 'Se puede llegar en tren desde la estacion Villa Ballester.'
        }
    },
    {
        name: 'Costanera Norte - Ribs al Rio',
        lat: -34.5444,
        lon: -58.4320,
        details: {
            image: costaneraImage,
            address: 'Av. Costanera Rafael Obligado 6920, CABA',
            parking: 'Gratuito',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'Puesto LodeChimiPesca',
            notes: 'Estacionar a 45° para evitar multas'
        }
    },
    {
        name: 'El Reloj - Tigre',
        lat: -34.407726,
        lon: -58.591651,
        details: {
            image: relojImage,
            address: 'Caupolican 195, Rincon de Milberg',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'Vendedores Ambulantes',
            notes: '-'
        }
    },
    {
        name: 'Mon. a Colon - Aeroparque',
        lat: -34.556746,
        lon: -58.409459,
        details: {
            image: monumentoImage,
            address: 'Av. Costanera Rafael Obligado 80, CABA',
            parking: 'No',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'Vendedores Ambulantes',
            notes: 'Pueden cruzar al Aeroparque para usar los baños.'
        }
    },
    {
        name: 'Muelle de Martinez - Martinez',
        lat: -34.485164,
        lon: -58.481300,
        details: {
            image: muelleMartinezImage,
            address: 'Sebastián Elcano 2400, Martínez',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'No hay vendedores',
            notes: 'Se puede ir por la noche pero no está iluminado.'
        }
    },
    {
        name: 'Parana y el Rio - Vte Lopez',
        lat: -34.490045,
        lon: -58.480329,
        details: {
            image: paranaImage,
            address: 'Paraná 1, La Lucila',
            parking: 'Si',
            bathrooms: 'Si',
            hours: '24hs',
            bait: 'Vendedores Ambulantes',
            notes: '-'
        }
    },
    {
        name: 'Parque de los Niños - Nuñez',
        lat: -34.529533,
        lon: -58.455541,
        details: {
            image: parqueImage,
            address: 'Av. Int. Cantilo y Av. Gral. Paz, CABA',
            parking: 'Si',
            bathrooms: 'Si',
            hours: 'de 8hs a 19hs',
            bait: 'Vendedores Ambulantes',
            notes: 'Baño público en el ingreso al frente del estacionamiento.'
        }
    },
    {
        name: 'Pejerrey Club - Quilmes',
        lat: -34.710321,
        lon: -58.223348,
        details: {
            image: pejerreyImage,
            address: 'Av. Isidoro Iriarte 1790, Quilmes',
            parking: 'Si',
            bathrooms: 'Si',
            hours: '24hs',
            bait: 'Vendedor Ambulante en la entrada.',
            notes: 'Muelle privado, cobra entrada de $8.000 el día.'
        }
    },
]

const getFormattedDate = (offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    const options = { weekday: 'long', day: 'numeric' }
    return date.toLocaleDateString('es-AR', options)
}

const DATES = [
    { label: `Hoy ${getFormattedDate(0)}`, value: 0 },
    { label: `Mañana ${getFormattedDate(1)}`, value: 1 },
    { label: `Pasado Mañana ${getFormattedDate(2)}`, value: 2 },
]

function App() {
    const [location, setLocation] = useState(null)
    const [dateOffset, setDateOffset] = useState(DATES[0].value)
    const [weatherData, setWeatherData] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchWeather = async () => {
        if (!location) {
            alert("Por favor selecciona una ubicación.")
            return
        }

        setLoading(true)
        try {
            // Open-Meteo API (Weather & Marine)
            const [weatherResponse, marineResponse] = await Promise.all([
                fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,is_day&forecast_days=3&timezone=auto`
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

            const currentHour = new Date().getHours()
            // If it's today (offset 0), start from current hour, else start from 00:00
            const hourOffset = dateOffset === 0 ? currentHour : 0

            const startIndex = (dateOffset * 24) + hourOffset
            const endIndex = (dateOffset + 1) * 24 // Always end at the end of the selected day (24h block end)

            const hourlyData = {
                time: weatherData.hourly.time.slice(startIndex, endIndex),
                temperature_2m: weatherData.hourly.temperature_2m.slice(startIndex, endIndex),
                surface_pressure: weatherData.hourly.surface_pressure.slice(startIndex, endIndex),
                wind_speed_10m: weatherData.hourly.wind_speed_10m.slice(startIndex, endIndex),
                wind_direction_10m: weatherData.hourly.wind_direction_10m.slice(startIndex, endIndex),
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
                            value={location ? location.name : ""}
                            onChange={(e) => setLocation(LOCATIONS.find(l => l.name === e.target.value))}
                        >
                            <option value="" disabled>Seleccione un lugar...</option>
                            {LOCATIONS.map(loc => (
                                <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    {location && location.details && (
                        <LocationInfoCard location={location} />
                    )}

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
