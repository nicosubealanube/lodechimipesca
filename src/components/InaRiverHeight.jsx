import React, { useState, useEffect } from 'react';
import { Anchor, ExternalLink, Info, RefreshCw, X, ZoomIn } from 'lucide-react';

const INA_STATIONS = {
    'Club El Anzuelo - Zarate': {
        stationName: 'Zárate',
        isReference: false,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_Zarate.png'
    },
    'Recreo Keidel - Zarate': {
        stationName: 'Zárate',
        isReference: false,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_Zarate.png'
    },
    'Costanera de Zarate - Zarate': {
        stationName: 'Zárate',
        isReference: false,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_Zarate.png'
    },
    'Costanera de Campana - Campana': {
        stationName: 'Campana',
        isReference: false,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_Campana.png'
    },
    'Cohelo - San Fernando': {
        stationName: 'San Fernando',
        isReference: false,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Puerto de San Isidro - San Isidro': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Muelle de Martínez - Martínez': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Parana y el Rio - Vte Lopez': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Club de Pescadores Olivos - Olivos': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Parque de los Niños - Nuñez': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Costanera Norte - Ribs al Rio': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Mon. a Colón - Aeroparque': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Costa Salguero - CABA': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'La Usina - CABA': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'Asoc. Argentina de Pesca - CABA': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    },
    'El Reloj - Tigre': {
        stationName: 'San Fernando',
        isReference: true,
        imgUrl: 'https://alerta.ina.gob.ar/ina/42-RIODELAPLATA/productos/Prono_SanFernando.png'
    }
};

export default function InaRiverHeight({ locationName }) {
    const station = INA_STATIONS[locationName];
    const [imageError, setImageError] = useState(false);
    const [cacheBuster, setCacheBuster] = useState(Date.now());
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Reset error state and refresh image with cache buster when location changes
    useEffect(() => {
        setImageError(false);
        setCacheBuster(Date.now());
    }, [locationName]);

    // If the selected location has no mapped INA station, we don't render the card
    if (!station) return null;

    const handleRefresh = () => {
        setCacheBuster(Date.now());
        setImageError(false);
    };

    return (
        <>
            <div className="location-card ina-card">
                <div className="ina-card-header animate-fade-in">
                    <div className="ina-header-title">
                        <Anchor size={20} className="ina-anchor-icon" />
                        <h3>Pronóstico de Altura del Río (INA)</h3>
                    </div>
                    <button 
                        onClick={handleRefresh} 
                        className="ina-refresh-btn" 
                        title="Actualizar gráfico"
                        aria-label="Actualizar gráfico del río"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="ina-card-body">
                    <div className="ina-station-info">
                        <span className="station-badge">Estación Oficial del INA</span>
                        <h4 className="station-name">
                            {station.stationName} 
                            {station.isReference && <span className="reference-label"> (Referencia cercana)</span>}
                        </h4>
                        <p className="update-note">Este gráfico se actualiza de forma automática cada 3 horas.</p>
                    </div>

                    <div 
                        className="ina-image-container cropped"
                        onClick={() => !imageError && setIsLightboxOpen(true)}
                        style={{ cursor: !imageError ? 'zoom-in' : 'default' }}
                        title={!imageError ? "Hacer clic para ampliar" : ""}
                    >
                        {!imageError ? (
                            <>
                                <img 
                                    src={`${station.imgUrl}?cb=${cacheBuster}`} 
                                    alt={`Gráfico de pronóstico de altura del río para ${station.stationName}`} 
                                    className="ina-forecast-image zoom-effect"
                                    onError={() => setImageError(true)}
                                />
                                <div className="ina-zoom-overlay">
                                    <ZoomIn size={18} className="zoom-icon" />
                                    <span>Tocar para ampliar</span>
                                </div>
                            </>
                        ) : (
                            <div className="ina-image-error">
                                <Info size={32} className="error-icon" />
                                <p>No se pudo cargar el gráfico oficial en este momento.</p>
                                <p className="error-tip">El servidor del INA puede estar en mantenimiento temporal.</p>
                            </div>
                        )}
                    </div>

                    <div className="ina-read-guide">
                        <h5>¿Cómo leer este gráfico? (Guía fácil)</h5>
                        <ul>
                            <li>
                                <span className="guide-bullet blue-bullet"></span>
                                <div>
                                    <strong>Línea azul continua:</strong> Altura medida real del río en las últimas 24 horas.
                                </div>
                            </li>
                            <li>
                                <span className="guide-bullet red-bullet"></span>
                                <div>
                                    <strong>Línea roja punteada:</strong> Altura pronosticada para los próximos 4 días.
                                </div>
                            </li>
                            <li>
                                <span className="guide-bullet peak-bullet"></span>
                                <div>
                                    <strong>Picos Altos (Crestas):</strong> Muestran la hora y altura de la <strong>Crecida / Pleamar</strong>.
                                </div>
                            </li>
                            <li>
                                <span className="guide-bullet valley-bullet"></span>
                                <div>
                                    <strong>Picos Bajos (Valles):</strong> Muestran la hora y altura de la <strong>Bajante / Bajamar</strong>.
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="ina-card-footer">
                        <a 
                            href="https://www.ina.gob.ar/delta/index.php?seccion=12" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="primary-button ina-db-button"
                        >
                            <span>Ver en Web Oficial del INA</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal for Fullscreen Chart */}
            {isLightboxOpen && (
                <div 
                    className="ina-lightbox-overlay" 
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button 
                        className="ina-lightbox-close" 
                        onClick={() => setIsLightboxOpen(false)}
                        aria-label="Cerrar pantalla completa"
                    >
                        <X size={28} />
                    </button>
                    
                    <div className="ina-lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={`${station.imgUrl}?cb=${cacheBuster}`} 
                            alt={`Gráfico completo de pronóstico para ${station.stationName}`} 
                            className="ina-lightbox-image"
                        />
                        <div className="ina-lightbox-tip">
                            <Info size={14} />
                            <span>Girá tu celular de costado para ver el gráfico más grande</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
