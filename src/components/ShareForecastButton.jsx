import React, { useState, useEffect } from 'react';
import { Share2, Download, X, Check } from 'lucide-react';
import snakeLogo from '../assets/snake_logo.png';
import {
    generateForecastCard,
    shareForecastImage,
    downloadForecastImage,
} from '../utils/shareCardGenerator';

const SNAKE_INSTAGRAM_URL = 'https://www.instagram.com/snakefishing_ok?obrf=a2E5ZGRubTk4Z3U2';

export default function ShareForecastButton({ locationName, dateOffset, weatherData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [cardResult, setCardResult] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Close modal on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    // Reset generated card when forecast data changes
    useEffect(() => {
        setCardResult(null);
        setStatusMsg(null);
        setErrorMsg(null);
    }, [locationName, dateOffset, weatherData]);

    const handleOpenPreview = async () => {
        setIsOpen(true);
        setStatusMsg(null);
        setErrorMsg(null);
        setGenerating(true);

        try {
            const generated = await generateForecastCard({
                locationName,
                dateOffset,
                weatherData,
            });
            setCardResult(generated);
        } catch (err) {
            console.error('Error generating forecast card:', err);
            setErrorMsg('No se pudo generar la tarjeta del pronóstico.');
        } finally {
            setGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!cardResult) return;
        setStatusMsg(null);

        const res = await shareForecastImage({
            ...cardResult,
            locationName,
            dateOffset,
        });

        if (res.method === 'download') {
            setStatusMsg('Imagen descargada. ¡Ya podés adjuntarla en WhatsApp!');
        } else if (res.method === 'native' || res.method === 'webshare') {
            setStatusMsg('¡Pronóstico compartido!');
        }
    };

    const handleDownload = () => {
        if (!cardResult) return;
        downloadForecastImage(cardResult);
        setStatusMsg('Imagen guardada en tus descargas.');
    };

    return (
        <>
            <button
                type="button"
                className="share-forecast-btn"
                onClick={handleOpenPreview}
                aria-label="Compartir tarjeta de pronóstico"
            >
                <span className="share-btn-main">
                    <Share2 size={18} />
                    <span>Compartir pronóstico</span>
                </span>
                <span className="share-btn-snake-badge">
                    <img
                        src={snakeLogo}
                        alt="SNAKE"
                        className="share-btn-snake-logo"
                    />
                </span>
            </button>

            {isOpen && (
                <div
                    className="share-modal-overlay"
                    onClick={() => setIsOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Vista previa del pronóstico para compartir"
                >
                    <div
                        className="share-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="share-modal-close-floating"
                            onClick={() => setIsOpen(false)}
                            aria-label="Cerrar"
                        >
                            <X size={20} />
                        </button>

                        <div className="share-modal-preview">
                            {generating && (
                                <div className="share-modal-loading">
                                    Generando imagen...
                                </div>
                            )}
                            {errorMsg && !generating && (
                                <div className="share-modal-error">{errorMsg}</div>
                            )}
                            {cardResult && !generating && (
                                <div className="share-preview-frame">
                                    <img
                                        src={cardResult.dataUrl}
                                        alt={`Pronóstico de pesca para ${locationName}`}
                                        className="share-preview-img"
                                    />
                                    <a
                                        href={SNAKE_INSTAGRAM_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-preview-sponsor-hotspot"
                                        aria-label="Visitar Instagram de SNAKE (@snakefishing_ok)"
                                        title="Abrir @snakefishing_ok en Instagram"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="share-modal-footer">
                            {statusMsg && (
                                <div className="share-status-toast">
                                    <Check size={16} />
                                    <span>{statusMsg}</span>
                                </div>
                            )}

                            <div className="share-modal-actions">
                                <button
                                    type="button"
                                    className="share-action-primary"
                                    onClick={handleShare}
                                    disabled={generating || !cardResult}
                                >
                                    <Share2 size={18} />
                                    <span>Enviar por WhatsApp / Redes</span>
                                </button>
                                <button
                                    type="button"
                                    className="share-action-secondary"
                                    onClick={handleDownload}
                                    disabled={generating || !cardResult}
                                    title="Guardar imagen PNG"
                                >
                                    <Download size={18} />
                                    <span>Guardar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
