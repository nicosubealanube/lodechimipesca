import React, { useState, useEffect } from 'react'
import { MapPin, Instagram, Facebook, MessageCircle, Phone, ChevronLeft, ChevronRight, User, ChevronDown, ChevronUp } from 'lucide-react'

const LocationInfoCard = ({ location, activeSubLocation, setActiveSubLocation, isFavorite, onToggleFavorite }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)
    const [showGuide, setShowGuide] = useState(false)

    const currentLocation = activeSubLocation || location
    if (!currentLocation || !currentLocation.details) return null

    const { details } = currentLocation
    const allImages = details.additionalImages ? [details.image, ...details.additionalImages] : (details.image ? [details.image] : [])

    const nextImage = () => {
        setCurrentImageIndex(prev => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
        setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)
    }

    // Swipe handers
    const minSwipeDistance = 50 

    const onTouchStartHandler = (e) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMoveHandler = (e) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        if (distance > minSwipeDistance) {
            nextImage()
        } else if (distance < -minSwipeDistance) {
            prevImage()
        }
    }

    return (
        <div className="location-card">
            {allImages.length > 0 && (
                <div 
                    className="location-carousel-container"
                    onTouchStart={onTouchStartHandler}
                    onTouchMove={onTouchMoveHandler}
                    onTouchEnd={onTouchEndHandler}
                >
                    <div 
                        className="location-carousel-track" 
                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                        {allImages.map((img, idx) => {
                            const isBanda = typeof img === 'string' && img.includes('banda')
                            return (
                                <div key={idx} className="location-image-slide">
                                    <img 
                                        src={img} 
                                        alt={`${currentLocation.name} ${idx + 1}`} 
                                        className="location-image"
                                        style={isBanda ? { objectPosition: 'center bottom' } : {}}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    
                    {allImages.length > 1 && (
                        <>
                            <button className="carousel-btn prev-btn" onClick={prevImage} aria-label="Anterior imagen">
                                <ChevronLeft size={24} />
                            </button>
                            <button className="carousel-btn next-btn" onClick={nextImage} aria-label="Siguiente imagen">
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>
            )}
            
            <div className="location-details">
                <div className="location-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '2px solid var(--glass-border)', paddingBottom: '8px' }}>
                    <h3 className="location-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                        {currentLocation.name !== location.name 
                            ? 'Sede Ibicuy' 
                            : (location.subLocation ? 'Sede Olivos' : 'Información del Lugar')}
                    </h3>
                    {location.subLocation && currentLocation.name === location.name && (
                        <button className="primary-button" style={{ padding: '8px 12px', fontSize: '0.85rem', marginTop: 0 }} onClick={() => { setActiveSubLocation(location.subLocation); setCurrentImageIndex(0); }}>
                            Ver Sede Ibicuy
                        </button>
                    )}
                    {location.subLocation && currentLocation.name !== location.name && (
                        <button className="primary-button" style={{ padding: '8px 12px', fontSize: '0.85rem', marginTop: 0 }} onClick={() => { setActiveSubLocation(null); setCurrentImageIndex(0); }}>
                            Volver a Sede Olivos
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <button 
                        className={`favorite-toggle-btn ${isFavorite ? 'is-favorite' : ''}`}
                        onClick={onToggleFavorite}
                    >
                        {isFavorite ? '⭐ Quitar de Favoritos' : '⭐ Guardar en Favoritos'}
                    </button>
                </div>
                <ul className="location-info-list">
                    <li className="info-item-with-link">
                        <strong>Dirección:</strong>{' '}
                        <a
                            href={details.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="info-link"
                        >
                            <MapPin size={16} className="info-icon" />
                            <span className="info-link-text">{details.address}</span>
                        </a>
                    </li>
                    <li><strong>Estacionamiento:</strong> {details.parking}</li>
                    <li><strong>Baños:</strong> {details.bathrooms}</li>
                    <li><strong>Horario:</strong> {details.hours}</li>
                    <li><strong>Carnada:</strong> {details.bait}</li>
                    {details.recommendedGuide && (
                        <li className="info-item-with-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }} onClick={() => setShowGuide(!showGuide)}>
                                <strong>Guía Recomendado:</strong>
                                <div className="info-link" style={{ textDecoration: 'none', marginLeft: '8px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <User size={16} className="info-icon" style={{ marginRight: '4px' }} />
                                        <span className="info-link-text" style={{ textDecoration: 'underline' }}>{details.recommendedGuide.name}</span>
                                        <span style={{ marginLeft: '4px' }}>✅</span>
                                    </span>
                                    {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>
                            {showGuide && (
                                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--glass-bg, rgba(255,255,255,0.05))', borderRadius: '8px', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))', display: 'flex', alignItems: 'center', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
                                    <img src={details.recommendedGuide.image} alt={details.recommendedGuide.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <a href={details.recommendedGuide.instagramUrl} target="_blank" rel="noopener noreferrer" className="info-link" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
                                            <Instagram size={16} className="info-icon" style={{ marginRight: '4px' }} />
                                            <span className="info-link-text">{details.recommendedGuide.instagram}</span>
                                        </a>
                                        <a href={`${details.recommendedGuide.whatsappUrl}?text=${encodeURIComponent('Hola ' + details.recommendedGuide.name + ', vengo de la app de ChimiPesca y queria hacerte una consulta:')}`} target="_blank" rel="noopener noreferrer" className="info-link" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
                                            <MessageCircle size={16} className="info-icon" style={{ marginRight: '4px' }} />
                                            <span className="info-link-text">{details.recommendedGuide.whatsapp}</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </li>
                    )}
                    {details.instagram && (
                        <li className="info-item-with-link">
                            <strong>Instagram:</strong>{' '}
                            <a
                                href={details.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="info-link"
                            >
                                <Instagram size={16} className="info-icon" />
                                <span className="info-link-text">{details.instagram}</span>
                            </a>
                        </li>
                    )}
                    {details.facebook && (
                        <li className="info-item-with-link">
                            <strong>Facebook:</strong>{' '}
                            <a
                                href={details.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="info-link"
                            >
                                <Facebook size={16} className="info-icon" />
                                <span className="info-link-text">{details.facebook}</span>
                            </a>
                        </li>
                    )}
                    {details.whatsapp && (
                        <li className="info-item-with-link">
                            <strong>Administración:</strong>{' '}
                            <a
                                href={`${details.whatsappUrl}?text=${encodeURIComponent('Hola, vengo de la app de ChimiPesca y queria hacerte una consulta:')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="info-link"
                            >
                                <MessageCircle size={16} className="info-icon" />
                                <span className="info-link-text">{details.whatsapp}</span>
                            </a>
                        </li>
                    )}
                    {details.phone && (
                        <li className="info-item-with-link">
                            <strong>Administración:</strong>{' '}
                            <a
                                href={details.phoneUrl}
                                className="info-link"
                            >
                                <Phone size={16} className="info-icon" />
                                <span className="info-link-text">{details.phone}</span>
                            </a>
                        </li>
                    )}
                    <li><strong>Observaciones:</strong> {details.notes}</li>
                </ul>
            </div>
        </div>
    )
}

export default LocationInfoCard
