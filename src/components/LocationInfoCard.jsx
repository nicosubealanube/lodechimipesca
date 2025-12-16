
import React from 'react'

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
                    <li>
                        <strong>Dirección:</strong>{' '}
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'underline', color: 'inherit' }}
                        >
                            {details.address}
                        </a>
                    </li>
                    <li><strong>Estacionamiento:</strong> {details.parking}</li>
                    <li><strong>Baños:</strong> {details.bathrooms}</li>
                    <li><strong>Horario:</strong> {details.hours}</li>
                    <li><strong>Carnada:</strong> {details.bait}</li>
                    <li><strong>Observaciones:</strong> {details.notes}</li>
                </ul>
            </div>
        </div>
    )
}

export default LocationInfoCard
