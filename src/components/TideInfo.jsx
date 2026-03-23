import React, { useState, useEffect } from 'react';

const tideCache = {};

export const fetchTideData = async (lat, lon) => {
    const key = `${lat}_${lon}`;
    if (tideCache[key]) return tideCache[key];

    tideCache[key] = fetch(`https://lodechimipesca.netlify.app/.netlify/functions/get-tides?lat=${lat}&lon=${lon}`)
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

    // Shift the requested time forward by 3 hours to fetch delayed Open Meteo data
    // because global models lack the Rio de la Plata 3h estuary penetration delay.
    const TIME_SHIFT_MS = 3 * 60 * 60 * 1000;
    const targetTime = new Date(timeIso).getTime() + TIME_SHIFT_MS;
    const targetIndex = tideTimes.findIndex(t => new Date(t).getTime() === targetTime);
    if (targetIndex === -1) return null;

    // Adjust Mean Sea Level (0.0) to Lowest Astronomical Tide (LAT) positive scale
    const DATUM_OFFSET = 1.29;

    const rawCurrentHeight = tideData[targetIndex];
    if (rawCurrentHeight === undefined || rawCurrentHeight === null) return null;

    const currentHeight = rawCurrentHeight + DATUM_OFFSET;

    const rawPrevHeight = targetIndex > 0 ? tideData[targetIndex - 1] : rawCurrentHeight;
    const prevHeight = rawPrevHeight + DATUM_OFFSET;

    const rawNextHeight = targetIndex < tideData.length - 1 ? tideData[targetIndex + 1] : rawCurrentHeight;
    const nextHeight = rawNextHeight + DATUM_OFFSET;

    let statusText = '';
    let isUp = true;

    // Detect peaks using a robust +/- 5 hours window to filter out estuarian noise and meteorological tides
    let isLocalMax = true;
    let isLocalMin = true;

    for (let i = Math.max(0, targetIndex - 5); i <= Math.min(tideData.length - 1, targetIndex + 5); i++) {
        if (i !== targetIndex) {
            if (tideData[i] > rawCurrentHeight) isLocalMax = false;
            if (tideData[i] < rawCurrentHeight) isLocalMin = false;
        }
    }

    if (isLocalMax) {
        statusText = 'Alta';
        isUp = true;
    } else if (isLocalMin) {
        statusText = 'Baja';
        isUp = false;
    } else if (rawCurrentHeight >= tideData[Math.max(0, targetIndex - 1)]) {
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
