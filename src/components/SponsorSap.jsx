import React, { useState, useEffect } from 'react';
import { Facebook, Instagram } from 'lucide-react';

const SapLogo = () => (
    <svg viewBox="0 0 100 100" width="100" height="100" style={{ flexShrink: 0, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))' }}>
        {/* Black circle background */}
        <circle cx="50" cy="50" r="48" fill="#000000" />
        
        {/* Bold peach SAP text */}
        <text 
            x="50" 
            y="49" 
            fill="#f28b57" 
            fontFamily="'Arial Black', Impact, sans-serif" 
            fontWeight="900" 
            fontSize="30" 
            textAnchor="middle"
        >
            SAP
        </text>
        
        {/* Silhouette of crowd overlapping the text */}
        <path 
            d="M15,53 C18,50 19,51 21,48 C23,44 24,46 25,50 C27,53 29,49 30,46 C31,43 32,45 33,51 C34,53 36,48 37,45 C38,42 39,44 40,50 C41,52 43,49 44,44 C45,41 46,43 48,51 C49,53 51,48 52,46 C53,43 54,45 56,52 C57,54 59,49 60,45 C61,42 62,44 63,50 C64,52 66,48 67,46 C68,43 69,45 71,52 C72,54 74,49 75,44 C76,41 77,43 79,51 C80,53 82,48 84,52 L84,62 L15,62 Z" 
            fill="#000000" 
        />
        
        {/* Peach DIGITAL text at the bottom */}
        <text 
            x="50" 
            y="66" 
            fill="#f28b57" 
            fontFamily="'Arial Black', Arial, sans-serif" 
            fontWeight="900" 
            fontSize="7" 
            letterSpacing="2.5" 
            textAnchor="middle"
        >
            DIGITAL
        </text>
    </svg>
);

export default function SponsorSap() {
    const [isLive, setIsLive] = useState(false);

    const channelUrl = "https://www.youtube.com/@s.a.p-digital";
    const liveUrl = "https://www.youtube.com/@s.a.p-digital/live";
    const facebookUrl = "https://www.facebook.com/SapRadioPAYO";
    const instagramUrl = "https://www.instagram.com/s.a.p_digital";

    const checkArgentinaLive = () => {
        try {
            // Permitir forzar el estado "En Vivo" agregando ?testlive en la URL para desarrollo/pruebas
            if (typeof window !== 'undefined' && window.location.search.includes('testlive')) {
                return true;
            }

            const now = new Date();
            // Get Argentina time details using Intl.DateTimeFormat (language-independent en-US locale)
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Argentina/Buenos_Aires',
                weekday: 'short',
                hour: 'numeric',
                hour12: false
            });
            
            const parts = formatter.formatToParts(now);
            let weekday = '';
            let hour = 0;
            
            parts.forEach(part => {
                if (part.type === 'weekday') weekday = part.value.toLowerCase();
                if (part.type === 'hour') hour = parseInt(part.value, 10);
            });
            
            // "tue" stands for Tuesday in en-US
            const isTuesday = weekday.includes('tu');
            const isLiveHour = hour === 19; // Between 19:00 and 19:59 (live broadcast hour)
            
            return isTuesday && isLiveHour;
        } catch (e) {
            console.error("Timezone formatting error, falling back to local time:", e);
            const now = new Date();
            return now.getDay() === 2 && now.getHours() === 19;
        }
    };

    useEffect(() => {
        // Initial check
        setIsLive(checkArgentinaLive());

        // Check every 30 seconds to update live status dynamically
        const interval = setInterval(() => {
            setIsLive(checkArgentinaLive());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="fishing-report-card" 
            style={{ 
                borderLeft: isLive ? '4px solid #ef4444' : '4px solid #f28b57',
                boxShadow: isLive 
                    ? '0 4px 15px rgba(239, 68, 68, 0.2), inset 0 0 10px rgba(239, 68, 68, 0.05)' 
                    : '0 4px 6px -1px rgba(0,0,0,0.1), inset 0 0 10px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                position: 'relative'
            }}
        >
            {/* Inject keyframes for live indicator pulse */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes livePulse {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
                @keyframes liveBadgePulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '16px', minHeight: '34px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isLive && (
                        <span 
                            style={{ 
                                backgroundColor: '#ef4444', 
                                color: '#ffffff', 
                                fontSize: '0.65rem', 
                                fontWeight: '900', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                animation: 'liveBadgePulse 1.5s infinite',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}
                        >
                            <span style={{ width: '5px', height: '5px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'inline-block', animation: 'livePulse 1s infinite' }} />
                            En Vivo
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a 
                        href={facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Facebook SAP Radio"
                        style={{ color: 'inherit', transition: 'color 0.2s, opacity 0.2s', opacity: 0.7, padding: '8px', margin: '-8px 0' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = 1;
                            e.currentTarget.style.color = '#1877f2';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = 0.7;
                            e.currentTarget.style.color = 'inherit';
                        }}
                    >
                        <Facebook size={24} />
                    </a>
                    <a 
                        href={instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Instagram SAP Radio"
                        style={{ color: 'inherit', transition: 'color 0.2s, opacity 0.2s', opacity: 0.7, padding: '8px', margin: '-8px -8px -8px 0' }}
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
                </div>
            </div>

            <a
                href={isLive ? liveUrl : channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link-row"
                style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'center', 
                    textDecoration: 'none'
                }}
            >
                <SapLogo />
                <div className="video-info" style={{ gap: '2px' }}>
                    <span className="video-title" style={{ fontWeight: '800', color: '#d35400', fontSize: '1rem' }}>
                        SAP — Salimos a Pescar
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        Radio Contacto AM 1460
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        todos los martes de 19hs a 20hs
                    </span>
                    
                    {isLive ? (
                        <span className="watch-now-text" style={{ color: '#ef4444', fontWeight: '800', marginTop: '4px', fontSize: '0.8rem' }}>
                            🔴 ¡AL AIRE! Toca para escuchar en vivo ▶
                        </span>
                    ) : (
                        <span className="watch-now-text" style={{ color: 'var(--primary-color)', fontWeight: '600', marginTop: '4px', fontSize: '0.8rem' }}>
                            Escuchá los programas grabados ▶
                        </span>
                    )}
                </div>
            </a>
        </div>
    );
}
