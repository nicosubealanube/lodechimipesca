import React from 'react';
import { Instagram, Mail } from 'lucide-react';

const FeriaLogo = () => (
    <svg viewBox="0 0 100 100" width="100" height="100" style={{ flexShrink: 0, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}>
        <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        <text x="50" y="24" fill="#0b3c5d" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="9" textAnchor="middle">Feria</text>
        <text x="50" y="33" fill="#0b3c5d" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" textAnchor="middle">Internacional</text>
        <text x="50" y="52" fill="#d25400" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16.5" letterSpacing="-0.5" textAnchor="middle">CAZA,</text>
        <text x="50" y="69" fill="#d25400" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16.5" letterSpacing="-0.5" textAnchor="middle">PESCA y</text>
        <text x="50" y="83" fill="#5ba626" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="11" letterSpacing="0.2" textAnchor="middle">OUTDOORS</text>
    </svg>
);

export default function FeriaCazaPesca() {
    const instagramUrl = "https://www.instagram.com/feriacazaypesca";
    const emailUrl = "mailto:cazaypesca@rsanti.com.ar";

    return (
        <div className="fishing-report-card" style={{ borderLeft: '4px solid #5ba626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                <h3 className="location-title" style={{ borderBottom: 'none', margin: 0, padding: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary-color)', textAlign: 'left' }}>
                    Próximo Evento del 8 al 17 de Agosto
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a 
                        href={instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Instagram Feria Caza y Pesca"
                        style={{ color: 'inherit', transition: 'color 0.2s, opacity 0.2s', opacity: 0.7, padding: '8px', margin: '-8px 0' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = 1;
                            e.currentTarget.style.color = '#e1306c';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = 0.7;
                            e.currentTarget.style.color = 'inherit';
                        }}
                    >
                        <Instagram size={24} />
                    </a>
                    <a 
                        href={emailUrl}
                        aria-label="Email de Contacto Feria Caza y Pesca"
                        style={{ color: 'inherit', transition: 'color 0.2s, opacity 0.2s', opacity: 0.7, padding: '8px', margin: '-8px -8px -8px 0' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = 1;
                            e.currentTarget.style.color = '#d35400';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = 0.7;
                            e.currentTarget.style.color = 'inherit';
                        }}
                    >
                        <Mail size={24} />
                    </a>
                </div>
            </div>

            <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link-row"
                style={{ display: 'flex', gap: '16px', alignItems: 'center', textDecoration: 'none' }}
            >
                <FeriaLogo />
                <div className="video-info">
                    <span className="video-title" style={{ fontWeight: '700' }}>
                        Feria Internacional de Caza, Pesca y Outdoors
                    </span>
                    <span className="watch-now-text" style={{ color: '#5ba626' }}>
                        ¡Toca aquí para ver toda la información! ▶
                    </span>
                </div>
            </a>
        </div>
    );
}
