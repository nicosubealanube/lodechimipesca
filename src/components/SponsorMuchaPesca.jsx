import React, { useState, useEffect } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import muchaPescaLogo from '../assets/mucha_pesca.jpg';

export default function SponsorMuchaPesca() {
    const [isLive, setIsLive] = useState(false);

    const channelUrl = "https://www.youtube.com/@muchapescatv";
    const liveUrl = "https://www.youtube.com/@muchapescatv/live";
    const facebookUrl = "https://www.facebook.com/MuchaPescaI?rdid=vPet2xgW1lYxgr7a&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F14pn2cUnW2A%2F";
    const instagramUrl = "https://www.instagram.com/mucha.pesca/";

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
            
            // "wed" stands for Wednesday in en-US
            const isWednesday = weekday.includes('wed');
            const isLiveHour = hour >= 20 && hour < 22; // Between 20:00 and 21:59 (live broadcast hours)
            
            return isWednesday && isLiveHour;
        } catch (e) {
            console.error("Timezone formatting error, falling back to local time:", e);
            const now = new Date();
            return now.getDay() === 3 && now.getHours() >= 20 && now.getHours() < 22;
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
                borderLeft: isLive ? '4px solid #ef4444' : '4px solid #000000',
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
                        aria-label="Facebook Mucha Pesca"
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
                        aria-label="Instagram Mucha Pesca"
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
                <img 
                    src={muchaPescaLogo} 
                    alt="Mucha Pesca Logo" 
                    width="100" 
                    height="100" 
                    style={{ borderRadius: '50%', flexShrink: 0, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))' }}
                />
                <div className="video-info" style={{ gap: '2px' }}>
                    <span className="video-title" style={{ fontWeight: '800', color: '#000000', fontSize: '1rem' }}>
                        Mucha Pesca TV
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        Radio Amplitud, AM 660
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        todos los miércoles de 20hs a 22hs
                    </span>
                    
                    {isLive ? (
                        <span className="watch-now-text" style={{ color: '#ef4444', fontWeight: '800', marginTop: '4px', fontSize: '0.8rem' }}>
                            🔴 ¡AL AIRE! Toca para mirar en vivo ▶
                        </span>
                    ) : (
                        <span className="watch-now-text" style={{ color: 'var(--primary-color)', fontWeight: '600', marginTop: '4px', fontSize: '0.8rem' }}>
                            Mirá los programas grabados ▶
                        </span>
                    )}
                </div>
            </a>
        </div>
    );
}
