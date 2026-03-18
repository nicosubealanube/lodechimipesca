import React, { useState, useEffect } from 'react';

const tideCache = {};

export const fetchTideData = async (lat, lon) => {
    const key = `${lat}_${lon}`;
    if (tideCache[key]) return tideCache[key];

    tideCache[key] = fetch(`/.netlify/functions/get-tides?lat=${lat}&lon=${lon}`)
        .then(async res => {
            if (!res.ok) throw new Error("API error");
            return res.json();
        })
        .catch(err => {
            delete tideCache[key]; // clear failing cache
            throw err;
        });

    return tideCache[key];
};

export default function TideInfo({ lat, lon, timeIso }) {
    const [tideData, setTideData] = useState(null);
    const [tideTimes, setTideTimes] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        fetchTideData(lat, lon)
            .then(data => {
                if (mounted && data?.hourly?.sea_level_height_msl && data?.hourly?.time) {
                    setTideData(data.hourly.sea_level_height_msl);
                    setTideTimes(data.hourly.time);
                }
            })
            .catch(err => {
                console.error("Tide fetch error:", err);
                if (mounted) setError(true);
            });
            
        return () => { mounted = false; };
    }, [lat, lon]);

    if (error || !tideData || !tideTimes) return null;

    const targetTime = new Date(timeIso).getTime();
    const targetIndex = tideTimes.findIndex(t => new Date(t).getTime() === targetTime);
    if (targetIndex === -1) return null;

    const currentHeight = tideData[targetIndex];
    if (currentHeight === undefined || currentHeight === null) return null;

    const prevHeight = targetIndex > 0 ? tideData[targetIndex - 1] : currentHeight;
    const nextHeight = targetIndex < tideData.length - 1 ? tideData[targetIndex + 1] : currentHeight;

    let statusText = '';
    let isUp = true;

    // Detect peaks using local maxima/minima
    if (currentHeight > prevHeight && currentHeight >= nextHeight) {
        statusText = 'Alta';
        isUp = true;
    } else if (currentHeight < prevHeight && currentHeight <= nextHeight) {
        statusText = 'Baja';
        isUp = false;
    } else if (currentHeight >= prevHeight) {
        statusText = 'Subiendo';
        isUp = true;
    } else {
        statusText = 'Bajando';
        isUp = false;
    }
    
    return (
        <div className="detail-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1 }}>{isUp ? '↑' : '↓'}</span>
                <span>{currentHeight.toFixed(2)} m</span>
            </div>
            <div className="detail-good-text" style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.85rem' }}>
                Marea: {statusText}
            </div>
        </div>
    );
}
