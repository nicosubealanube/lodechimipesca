import React, { useState, useEffect } from 'react'
import TideInfo from './TideInfo'
import {
    Sun, Moon, Cloud, CloudRain, CloudLightning,
    CloudSnow, CloudDrizzle, CloudFog, Wind,
    Thermometer, Waves, Droplets, MoveUp, ChevronDown,
    Clock, Compass
} from 'lucide-react'
import { getDayBlocks } from '../utils/fishingTrends'

const getWeatherIcon = (code, isDay) => {
    const props = { size: 24, strokeWidth: 2 }

    if (code === 0) return isDay === 1 ? <Sun {...props} color="#FDB813" /> : <Moon {...props} color="#64748b" />
    if (code >= 1 && code <= 3) return isDay === 1 ? <Cloud {...props} color="#9ca3af" /> : <Cloud {...props} color="#64748b" />
    if (code >= 45 && code <= 48) return <CloudFog {...props} color="#64748b" />
    if (code >= 51 && code <= 67) return <CloudRain {...props} color="#0ea5e9" />
    if (code >= 71 && code <= 77) return <CloudSnow {...props} color="#0ea5e9" />
    if (code >= 80 && code <= 82) return <CloudDrizzle {...props} color="#38bdf8" />
    if (code >= 95 && code <= 99) return <CloudLightning {...props} color="#eab308" />
    return <Thermometer {...props} color="#ef4444" />
}

const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

export default function WeatherCard({ data, lat, lon }) {
    if (!data) return null

    const [showSummary, setShowSummary] = useState(false)
    const [expandedBlockId, setExpandedBlockId] = useState(null)
    
    useEffect(() => {
        setShowSummary(false)
        setExpandedBlockId(null)
    }, [data])
    const blocks = getDayBlocks(data)

    const toggleBlock = (blockId) => {
        setExpandedBlockId(prev => prev === blockId ? null : blockId)
    }

    return (
        <div className="weather-card">
            {/* Toggle Button Container */}
            <div className="weather-toggle-container">
                <button
                    className={`weather-toggle-btn ${showSummary ? 'active' : ''}`}
                    onClick={() => setShowSummary(!showSummary)}
                    aria-label={showSummary ? "Ver detalle hora por hora" : "Ver resumen por bloques"}
                >
                    {showSummary ? <Clock size={16} /> : <Compass size={16} />}
                    <span>{showSummary ? 'Ver Detalle Hora a Hora' : 'Ver Resumen por Bloques'}</span>
                </button>
            </div>

            {showSummary ? (
                /* Option B: Daily Blocks Accordion View */
                <div className="blocks-accordion-container animate-fade-in">
                    {blocks.map(block => {
                        const isExpanded = expandedBlockId === block.id

                        return (
                            <div 
                                key={block.id} 
                                className={`block-card ${isExpanded ? 'expanded' : ''}`}
                            >
                                {/* Accordion header card row */}
                                <div 
                                    className="block-header" 
                                    onClick={() => toggleBlock(block.id)}
                                >
                                    <div className="block-info">
                                        <span className="block-icon" role="img" aria-label={block.label}>
                                            {block.icon}
                                        </span>
                                        <div className="block-title-container">
                                            <span className="block-title-text">{block.label}</span>
                                            <span className="block-range">{block.range}</span>
                                        </div>
                                    </div>

                                    <div className="block-metrics">
                                        <span className="block-temp">{block.tempStr}</span>
                                        <span className="block-wind">{block.windStr}</span>
                                        <span className={`block-badge ${block.conditionClass}`}>
                                            {block.condition}
                                        </span>
                                    </div>

                                    <div className="block-chevron">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>

                                {/* Accordion expanded content */}
                                {isExpanded && (
                                    <div className="block-hours-wrapper">
                                        {block.hours.map(hour => {
                                            const date = new Date(hour.time)
                                            const hoursStr = date.getHours().toString().padStart(2, '0') + ':00'
                                            const windSpeed = Math.round(hour.wind)
                                            const windDirectionDeg = hour.windDir
                                            const pressure = Math.round(hour.pressure)
                                            const weatherCode = hour.weatherCode
                                            const isDay = hour.isDay

                                            const isHighWind = windSpeed >= 19
                                            const isGoodPressure = pressure > 1015

                                            const tideHeight = data.tide_height ? data.tide_height[hour.index] : null
                                            const prevTide = hour.index > 0 && data.tide_height ? data.tide_height[hour.index - 1] : tideHeight
                                            const tideTrend = tideHeight > prevTide ? '↑' : '↓'

                                            const waveHeight = hour.waveHeight

                                            return (
                                                <div 
                                                    key={hour.time} 
                                                    className={`hour-item ${isHighWind ? 'warning' : ''} ${isGoodPressure ? 'good-pressure-bg' : ''}`}
                                                >
                                                    <div className="temp-col">
                                                        <span className="temp">{Math.round(hour.temp)}°</span>
                                                        {weatherCode !== null && (
                                                            <span className="weather-icon">
                                                                {getWeatherIcon(weatherCode, isDay)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="time-col">
                                                        <span className="time">{hoursStr}</span>
                                                    </div>

                                                    <div className="details">
                                                        <div className="detail-item">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                {isHighWind && <span className="wind-alert-icon">⚠️</span>}
                                                                <Wind size={16} />
                                                                <span>{windSpeed} km/h</span>
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.85rem' }}>
                                                                <MoveUp size={14} style={{ transform: `rotate(${windDirectionDeg}deg)` }} />
                                                                <span>{getWindDirection(windDirectionDeg)}</span>
                                                            </div>

                                                            {isHighWind && <div className="detail-warning-text">Viento Fuerte</div>}
                                                        </div>
                                                        
                                                        <div className="detail-item">
                                                            hPa {pressure}
                                                            {isGoodPressure && <span className="pressure-icon">✅</span>}
                                                            {isGoodPressure && <div className="detail-good-text">Buena Presión</div>}
                                                        </div>
                                                        
                                                        {waveHeight !== null && (
                                                            <div className="detail-item">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Waves size={16} />
                                                                    <span>{waveHeight.toFixed(1)} m</span>
                                                                </div>
                                                                <div className="detail-good-text" style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>Olas</div>
                                                            </div>
                                                        )}
                                                        
                                                        <TideInfo lat={lat} lon={lon} timeIso={hour.time} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* Option A: Original 24h Hourly Scroll View (Default) */
                <div className="animate-fade-in">
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Evolución del día</h3>
                    <div className="hourly-scroll">
                        {data.time.map((t, index) => {
                            const date = new Date(t)
                            const hours = date.getHours().toString().padStart(2, '0') + ':00'
                            const windSpeed = Math.round(data.wind_speed_10m[index])
                            const windDirectionDeg = data.wind_direction_10m ? data.wind_direction_10m[index] : 0
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
                                    <div className="temp-col">
                                        <span className="temp">{Math.round(data.temperature_2m[index])}°</span>
                                        {weatherCode !== null && <span className="weather-icon">{getWeatherIcon(weatherCode, isDay)}</span>}
                                    </div>

                                    <div className="time-col">
                                        <span className="time">{hours}</span>
                                    </div>

                                    <div className="details">
                                        <div className="detail-item">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {isHighWind && <span className="wind-alert-icon">⚠️</span>}
                                                <Wind size={16} />
                                                <span>{windSpeed} km/h</span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.85rem' }}>
                                                <MoveUp size={14} style={{ transform: `rotate(${windDirectionDeg}deg)` }} />
                                                <span>{getWindDirection(windDirectionDeg)}</span>
                                            </div>

                                            {isHighWind && <div className="detail-warning-text">Viento Fuerte</div>}
                                        </div>
                                        <div className="detail-item">
                                            hPa {pressure}
                                            {isGoodPressure && <span className="pressure-icon">✅</span>}
                                            {isGoodPressure && <div className="detail-good-text">Buena Presión</div>}
                                        </div>
                                        {waveHeight !== null && (
                                            <div className="detail-item">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Waves size={16} />
                                                    <span>{waveHeight.toFixed(1)} m</span>
                                                </div>
                                                <div className="detail-good-text" style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>Olas</div>
                                            </div>
                                        )}
                                        <TideInfo lat={lat} lon={lon} timeIso={t} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
