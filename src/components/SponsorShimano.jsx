import React from 'react';
import { Instagram } from 'lucide-react';
import shimanoLogo from '../assets/shimano_logo.png';

export default function SponsorShimano() {
    return (
        <div className="fishing-report-card" style={{ margin: '-8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="location-title" style={{ margin: 0, padding: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: 'none', opacity: 0.8 }}>
                    Sponsor Oficial
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a 
                        href="https://www.instagram.com/shimanofishingargentina" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Instagram Shimano"
                        style={{ color: 'inherit', transition: 'opacity 0.2s', opacity: 0.7, padding: '8px', margin: '-8px -8px -8px 0' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                        <Instagram size={26} />
                    </a>
                </div>
            </div>

            <a
                href="https://fish.shimano.com/es-AR"
                target="_blank"
                rel="noopener noreferrer"
                className="video-link-row"
            >
                <div style={{ width: '120px', height: '76px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                        src={shimanoLogo} 
                        alt="Shimano" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                </div>
                <div className="video-info">
                    <span className="video-title">Shimano Fishing</span>
                    <span className="watch-now-text">Tecnología y precisión japonesa para tus jornadas de pesca. Equipos que marcan la diferencia. ▶</span>
                </div>
            </a>
        </div>
    );
}
