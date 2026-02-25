import React from 'react'
import { MapPin, Instagram, MessageCircle } from 'lucide-react'

const LocationInfoCard = ({ location }) => {
    if (!location || !location.details) return null

    const { details } = location

    return (
        <div className="location-card">
            {details.image && (
                <div className="location-image-container">
                    <img src={details.image} alt={location.name} className="location-image" />
                </div>
            )}
            <div className="location-details">
                <h3 className="location-title">Información del Lugar</h3>
                <ul className="location-info-list">
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>Dirección:</strong>{' '}
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'underline', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <MapPin size={16} />
                            {details.address}
                        </a>
                    </li>
                    <li><strong>Estacionamiento:</strong> {details.parking}</li>
                    <li><strong>Baños:</strong> {details.bathrooms}</li>
                    <li><strong>Horario:</strong> {details.hours}</li>
                    <li><strong>Carnada:</strong> {details.bait}</li>
                    {details.instagram && (
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong>Instagram:</strong>{' '}
                            <a
                                href={details.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'underline', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Instagram size={16} />
                                {details.instagram}
                            </a>
                        </li>
                    )}
                    {details.whatsapp && (
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong>Administración:</strong>{' '}
                            <a
                                href={`${details.whatsappUrl}?text=${encodeURIComponent('Hola, vengo de la app de ChimiPesca y queria hacerte una consulta:')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'underline', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <MessageCircle size={16} />
                                {details.whatsapp}
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
