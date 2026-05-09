import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import payoLogo from '../assets/payo_logo.png';

export default function SponsorPayo() {
    return (
        <div className="fishing-report-card" style={{ margin: '-8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="location-title" style={{ margin: 0, padding: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: 'none', opacity: 0.8 }}>
                    Productos Oficiales
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a 
                        href="https://www.facebook.com/payoargentina" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Facebook Payo Argentina"
                        style={{ color: 'inherit', transition: 'opacity 0.2s', opacity: 0.7, padding: '8px', margin: '-8px 0' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                        <Facebook size={26} />
                    </a>
                    <a 
                        href="https://www.instagram.com/payo_argentina/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Instagram Payo Argentina"
                        style={{ color: 'inherit', transition: 'opacity 0.2s', opacity: 0.7, padding: '8px', margin: '-8px -8px -8px 0' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                        <Instagram size={26} />
                    </a>
                </div>
            </div>

            <a
                href="https://payoargentina.com"
                target="_blank"
                rel="noopener noreferrer"
                className="video-link-row"
            >
                <div style={{ width: '120px', height: '76px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                        src={payoLogo} 
                        alt="Payo Argentina" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0) opacity(0.8)' }} 
                    />
                </div>
                <div className="video-info">
                    <span className="video-title">Indumentaria y Artículos de Pesca</span>
                    <span className="watch-now-text">Disfruta del aire libre... Payo te protege. ▶</span>
                </div>
            </a>
        </div>
    );
}
