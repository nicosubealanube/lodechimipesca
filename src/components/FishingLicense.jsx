import React from 'react';
import licenciaImage from '../assets/licencia_chimi_pesca_horizontal.png';

export default function FishingLicense() {
    return (
        <div className="fishing-report-card">
            <a
                href="https://www.gba.gob.ar/desarrollo_agrario/pesca/articulos/obtenga_su_licencia_de_pesca_deportiva"
                target="_blank"
                rel="noopener noreferrer"
                className="video-link-row"
            >
                <div style={{ width: '120px', height: '76px', flexShrink: 0, overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--glass-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <img src={licenciaImage} alt="Licencia de Pesca" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="video-info">
                    <span className="video-title">Obtenga su permiso de pesca de Buenos Aires</span>
                    <span className="watch-now-text">Sacar permiso ahora ▶</span>
                </div>
            </a>
        </div>
    );
}

