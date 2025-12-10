import React from 'react'

const getWeatherIcon = (code, isDay) => {
    if (code === 0) return isDay === 1 ? '☀️' : '🌙'
    if (code >= 1 && code <= 3) return isDay === 1 ? '⛅' : '☁️'
    if (code >= 45 && code <= 48) return '🌫️'
    if (code >= 51 && code <= 67) return '🌧️'
    if (code >= 71 && code <= 77) return '🌨️'
    if (code >= 80 && code <= 82) return '🌦️'
    if (code >= 95 && code <= 99) return '⛈️'
    return '🌡️'
}

export default function WeatherCard({ data }) {
    if (!data) return null

    return (
        <div className="weather-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Evolución del día</h3>
            <div className="hourly-scroll">
                {data.time.map((t, index) => {
                    const date = new Date(t)
                    const hours = date.getHours().toString().padStart(2, '0') + ':00'
                    const windSpeed = Math.round(data.wind_speed_10m[index])
                    const pressure = Math.round(data.surface_pressure[index])
                    const weatherCode = data.weather_code ? data.weather_code[index] : null
                    const isDay = data.is_day ? data.is_day[index] : 1

                    const isHighWind = windSpeed >= 19
                    const isGoodPressure = pressure > 1015

                    const tideHeight = data.tide_height ? data.tide_height[index] : null
                    const prevTide = index > 0 && data.tide_height ? data.tide_height[index - 1] : tideHeight
                    const tideTrend = tideHeight > prevTide ? '↑' : '↓'

                    const waveHeight = data.wave_height ? data.wave_height[index] : null

                    return (
                        <div key={t} className={`hour-item ${isHighWind ? 'warning' : ''} ${isGoodPressure ? 'good-pressure-bg' : ''}`}>
                            <div className="time-col">
                                <span className="time">{hours}</span>
                            </div>

                            <div className="temp-col">
                                <span className="temp">{Math.round(data.temperature_2m[index])}°</span>
                                {weatherCode !== null && <span className="weather-icon">{getWeatherIcon(weatherCode, isDay)}</span>}
                            </div>

                            <div className="details">
                                <div className="detail-item">
                                    {isHighWind && <span className="wind-alert-icon">⚠️</span>}
                                    💨 {windSpeed} km/h
                                    {isHighWind && <div className="detail-warning-text">Viento Fuerte</div>}
                                </div>
                                <div className="detail-item">
                                    hPa {pressure}
                                    {isGoodPressure && <span className="pressure-icon">✅</span>}
                                    {isGoodPressure && <div className="detail-good-text">Buena Presión</div>}
                                </div>
                                {waveHeight !== null && (
                                    <div className="detail-item">
                                        🌊 {waveHeight.toFixed(1)} m
                                        <div className="detail-good-text" style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>Olas</div>
                                    </div>
                                )}
                                {tideHeight !== null && (
                                    <div className="detail-item">
                                        🌊 {tideHeight.toFixed(1)} m {tideTrend}
                                        <div className="detail-good-text" style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>Marea</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
