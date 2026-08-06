import React, { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';

export default function FishingReport() {
    const [latestVideo, setLatestVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    const CHANNEL_ID = 'UCdYmruuENCWt4wS74nh8FgQ';
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
    const liveUrl = `https://www.youtube.com/channel/${CHANNEL_ID}/live`;

    const checkArgentinaLive = () => {
        try {
            // Permitir forzar el estado "En Vivo" agregando ?testlive en la URL para desarrollo/pruebas
            if (typeof window !== 'undefined' && window.location.search.includes('testlive')) {
                return true;
            }
            
            const now = new Date();
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
            const isWednesday = weekday.includes('we');
            const isLiveHour = hour === 22; // Between 22:00 and 22:59 (live broadcast hour)
            
            return isWednesday && isLiveHour;
        } catch (e) {
            console.error("Timezone formatting error, falling back to local time:", e);
            const now = new Date();
            return now.getDay() === 3 && now.getHours() === 22; // 3 = Wednesday
        }
    };

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();

                if (data.items) {
                    // Find the latest video with "El pique al dia" in the title
                    const video = data.items.find(item =>
                        item.title.toLowerCase().includes('el pique al dia') ||
                        item.title.toLowerCase().includes('el pique al día')
                    );
                    setLatestVideo(video);
                }
            } catch (error) {
                console.error("Error fetching fishing report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();

        // Initial check for live status
        setIsLive(checkArgentinaLive());

        // Check every 30 seconds to update live status dynamically
        const interval = setInterval(() => {
            setIsLive(checkArgentinaLive());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading || !latestVideo) return null;

    return (
        <div 
            className="fishing-report-card"
            style={{
                borderLeft: isLive ? '4px solid #ef4444' : 'none',
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="location-title" style={{ borderBottom: 'none', margin: 0, padding: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary-color)', textAlign: 'left' }}>
                        Podes ver acá el Pique al día, de Wilmar Merino
                    </h3>
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
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <a 
                        href="https://www.instagram.com/wilmarmerino/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Instagram Wilmar Merino"
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
                href={isLive ? liveUrl : latestVideo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link-row"
            >
                <div className="channel-avatar">
                    <img src="https://yt3.googleusercontent.com/u3Bz-6gwf1b6OnmGyeHRYHoYZfOF0OoZEGGKXldRGLMmup0Zvns-TZXVuIdMxo8CV96MqeSWkA=s900-c-k-c0x00ffffff-no-rj" alt="Wilmar Merino" />
                </div>
                <div className="video-info">
                    <span className="video-title">{isLive ? "Wilmar Merino — Transmisión en Vivo" : latestVideo.title}</span>
                    <span className="watch-now-text" style={{ color: isLive ? '#ef4444' : 'var(--primary-color)', fontWeight: isLive ? '800' : 'normal' }}>
                        {isLive ? "🔴 ¡AL AIRE! Ver transmisión en vivo ▶" : "Ver video ahora ▶"}
                    </span>
                </div>
            </a>
        </div>
    );
}
