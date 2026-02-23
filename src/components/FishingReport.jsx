import React, { useState, useEffect } from 'react';

export default function FishingReport() {
    const [latestVideo, setLatestVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    const CHANNEL_ID = 'UCdYmruuENCWt4wS74nh8FgQ';
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

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
    }, []);

    if (loading || !latestVideo) return null;

    return (
        <div className="fishing-report-card">
            <h3 className="location-title" style={{ textAlign: 'left', marginBottom: '16px' }}>
                Podes ver acá el Pique al día, de Wilmar Merino
            </h3>
            <a
                href={latestVideo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link-row"
            >
                <div className="channel-avatar">
                    <img src="https://yt3.googleusercontent.com/u3Bz-6gwf1b6OnmGyeHRYHoYZfOF0OoZEGGKXldRGLMmup0Zvns-TZXVuIdMxo8CV96MqeSWkA=s900-c-k-c0x00ffffff-no-rj" alt="Wilmar Merino" />
                </div>
                <div className="video-info">
                    <span className="video-title">{latestVideo.title}</span>
                    <span className="watch-now-text">Ver video ahora ▶</span>
                </div>
            </a>
        </div>
    );
}
