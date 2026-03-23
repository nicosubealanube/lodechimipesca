import { useState } from 'react'
import Header from './components/Header'
import WeatherCard from './components/WeatherCard'
import Footer from './components/Footer'
import LocationInfoCard from './components/LocationInfoCard'
import FishingReport from './components/FishingReport'
import { getFishingPrediction } from './utils/fishingLogic'
import { fetchWeatherWithFallback } from './utils/weatherService'

import coheloImage from './assets/cohelo_san_fernando.png'
import costaneraImage from './assets/costanera_norte.jpg'
import monumentoImage from './assets/monumento_colon.png'
import relojImage from './assets/reloj_tigre.png'
import pejerreyImage from './assets/pejerrey_club.png'
import paranaImage from './assets/parana_vte_lopez.png'
import parqueImage from './assets/parque_ninos.jpg'
// import asocArgPescaImage from './assets/asoc_arg_pesca.png'
import muelleMartinezImage from './assets/muelle_martinez.png'
import costaneraZarateImage from './assets/costanera_zarate.png'
import islaPaulinoImage from './assets/isla_paulino.png'
import puntaLaraImage from './assets/punta_lara.png'
import clubElAnzueloImage from './assets/club_el_anzuelo.png'
import recreoKeidelImage from './assets/recreo_keidel.png'
import usinaImage from './assets/usina.png'
import salgueroImage from './assets/salguero.png'
import sanisidroImage from './assets/sanisidro.png'
import olivosImage from './assets/olivos.png'
import campanaImage from './assets/campana.jpg'

const LOCATIONS = [

    /*
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
            bait: 'Vendedor en la puerta',
            instagram: '@aapesca',
            instagramUrl: 'https://www.instagram.com/aapesca',
            whatsapp: '111111111',
            whatsappUrl: 'https://wa.me/11111111',
            notes: 'Club privado, se paga abono mensual.'
        }
    },
    */

    {
        name: 'Club de Pescadores Olivos - Olivos',
        lat: -34.504086,
        lon: -58.476206,
        details: {
            image: olivosImage,
            address: 'Juan Bautista Alberdi 102, Olivos',
            parking: 'Libre en el Puerto de Olivos',
            bathrooms: 'Damas, Caballeros y para personas con Discapacidad. Sin ducha.',
            hours: 'Todos los dias, 24hs',
            bait: 'Venta tercerizada, no todos los días.',
            instagram: '@club_de_pescadores_olivos',
            instagramUrl: 'https://www.instagram.com/club_de_pescadores_olivos',
            whatsapp: '15-2701-5875',
            whatsappUrl: 'https://wa.me/5491127015875',
            notes: 'Club privado con muelle de 270 mts. Refugios con baños. Quincho calefaccionado, parrillas, horno pizzero y solárium.'
        }
    },
    {
        name: 'Club El Anzuelo - Zarate',
        lat: -33.906770,
        lon: -58.934338,
        details: {
            image: clubElAnzueloImage,
            address: 'Pje talavera km 112, Zárate',
            parking: 'Gratuito',
            bathrooms: 'Si, con ducha caliente 24hs',
            hours: 'de 7hs a 22hs',
            bait: 'Comprar sobre la ruta antes de llegar',
            instagram: '@clubelanzuelo',
            instagramUrl: 'https://www.instagram.com/clubelanzuelo',
            whatsapp: '+54 9 11 2451‑6871',
            whatsappUrl: 'https://wa.me/5491124516871',
            notes: 'Club exclusivo para socios. Cuenta con Quinchos, heladeras, freezer y parrillas.'
        }
    },
    {
        name: 'Recreo Keidel - Zarate',
        lat: -33.892698,
        lon: -58.913481,
        details: {
            image: recreoKeidelImage,
            address: 'ex Ruta 12 km 110, Zarate',
            parking: 'Si',
            bathrooms: 'Si',
            hours: 'A partir de 6hs para pasar el dia',
            bait: 'Solo envasadas',
            instagram: '@recreokeidel',
            instagramUrl: 'https://www.instagram.com/recreokeidel',
            whatsapp: '3487-470576',
            whatsappUrl: 'https://wa.me/5493487470576',
            notes: 'Camping familiar con pileta, bajada de lanchas, alquiler de cabañas y kayaks. Muelle de pesca de 300mts'
        }
    },
    {
        name: 'Cohelo - San Fernando',
        lat: -34.437601,
        lon: -58.537828,
        details: {
            image: coheloImage,
            address: 'Del Arca 400, San Fernando',
            parking: 'Si',
            bathrooms: 'Si',
            hours: '8hs a 00hs',
            bait: 'Puesto fijo en la entrada',
            notes: 'Pueden pedir permiso de pesca. Tiene juegos de plaza.'
        }
    },
    {
        name: 'Costa Salguero - CABA',
        lat: -34.569207,
        lon: -58.394677,
        details: {
            image: salgueroImage,
            address: 'Av. Costanera Rafael Obligado 1221, CABA',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'Vendedores ambulantes',
            notes: 'Tirando a más de 10mts el fondo es mas arenoso. Puede ser considerado peligroso ir fuera de hora.'
        }
    },
    {
        name: 'Costanera de Campana - Campana',
        lat: -34.155136,
        lon: -58.959322,
        details: {
            image: campanaImage,
            address: 'Paseo Cmte. M. J. Escola, Campana',
            parking: 'Si',
            bathrooms: 'Si',
            hours: '24hs',
            bait: 'Si, en el Campana Boat Club',
            notes: 'Tiene plaza con juegos para chicos, y esta muy iluminado. Mucho enganche. El tren Villa Ballester - Zárate (estación Campana) te deja enfrente.'
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
            bait: 'Vendedores ambulantes',
            notes: 'Se puede llegar en tren desde la estación Villa Ballester.'
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
            bait: 'Vendedores ambulantes',
            notes: 'Estacionar a 45° para evitar multas'
        }
    },
    {
        name: 'Costanera Punta Lara - P. Lara',
        lat: -34.795840,
        lon: -57.993586,
        details: {
            image: puntaLaraImage,
            address: 'Av. Almte. Brown 6898',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'Vendedores ambulantes',
            notes: 'Tiene zonas con enganche, preguntar a los pescadores del lugar.'
        }
    },
    {
        name: 'El Reloj - Tigre',
        lat: -34.407726,
        lon: -58.591651,
        details: {
            image: relojImage,
            address: 'Caupolican 195, Rincón de Milberg',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'Vendedores ambulantes',
            notes: 'Carteles de prohibido pescar, algunos pescan igual'
        }
    },
    {
        name: 'Isla Paulino - Berisso',
        lat: -34.833993,
        lon: -57.881121,
        details: {
            image: islaPaulinoImage,
            address: 'Acceso Isla Santiago',
            parking: 'Si',
            bathrooms: 'No',
            hours: 'Cruces a partir de las 7am',
            bait: 'Si',
            notes: 'Comprar carnada antes de cruzar a la Isla. Motos quedan en la casa del lanchero y autos frente a la casa de carnadas.'
        }
    },
    {
        name: 'La Usina - CABA',
        lat: -34.623449,
        lon: -58.342192,
        details: {
            image: usinaImage,
            address: 'Av. España 3091 1107, CABA',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'No',
            notes: 'El lugar es chico, llegar temprano. Puede ser considerado peligroso ir fuera de hora.'
        }
    },
    {
        name: 'Mon. a Colón - Aeroparque',
        lat: -34.556746,
        lon: -58.409459,
        details: {
            image: monumentoImage,
            address: 'Av. Costanera Rafael Obligado 80, CABA',
            parking: 'No',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'Vendedores ambulantes',
            notes: 'Pueden cruzar a Aeroparque para usar los baños.'
        }
    },
    {
        name: 'Muelle de Martínez - Martínez',
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
            bait: 'Vendedores ambulantes',
            notes: 'Tiene baños al lado de la reserva ecológica'
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
            hours: 'de Martes a Domingo de 8hs a 19hs',
            bait: 'Vendedores ambulantes',
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
            bait: 'Vendedor ambulante en la entrada',
            notes: 'Muelle privado, cobra entrada por día: Adultos $15.000, menores de 16 años y jubilados $7000'
        }
    },
    {
        name: 'Puerto de San Isidro - San Isidro',
        lat: -34.461874,
        lon: -58.505888,
        details: {
            image: sanisidroImage,
            address: 'Cam. de la Ribera Nte. 1075, San Isidro',
            parking: 'Si',
            bathrooms: 'No',
            hours: '24hs',
            bait: 'No hay vendedores',
            notes: 'Si hay bajante de agua es muy playo y merma la pesca.'
        }
    }
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
            const data = await fetchWeatherWithFallback(location.lat, location.lon)

            const weatherData = data
            const marineData = { hourly: { wave_height: data.hourly.wave_height } } // Adapt structure if needed or just use returned data directly

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
                wave_height: weatherData.hourly.wave_height ? weatherData.hourly.wave_height.slice(startIndex, endIndex) : [],
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
                        <WeatherCard data={weatherData} lat={location.lat} lon={location.lon} />
                    </div>
                )}

                <FishingReport />
            </main>
            <Footer />
        </div >
    )
}

export default App
