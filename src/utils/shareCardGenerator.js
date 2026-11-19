import { Capacitor, registerPlugin } from '@capacitor/core';
import snakeLogoUrl from '../assets/snake_logo.png';
import { getFishingSummary } from './fishingLogic';
import { getDayBlocks } from './fishingTrends';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const LEVEL_THEMES = {
    excellent: {
        gradStart: '#047857',
        gradEnd: '#10B981',
        accent: '#059669',
    },
    ideal: {
        gradStart: '#059669',
        gradEnd: '#10B981',
        accent: '#059669',
    },
    good: {
        gradStart: '#0369A1',
        gradEnd: '#0099DB',
        accent: '#0284C7',
    },
    regular: {
        gradStart: '#B45309',
        gradEnd: '#F59E0B',
        accent: '#D97706',
    },
    difficult: {
        gradStart: '#B91C1C',
        gradEnd: '#EF4444',
        accent: '#DC2626',
    },
};

const BLOCK_BADGE_THEMES = {
    success: { bg: '#DCFCE7', text: '#047857', strip: '#10B981' },
    good: { bg: '#E0F2FE', text: '#0369A1', strip: '#0EA5E9' },
    neutral: { bg: '#FEF3C7', text: '#B45309', strip: '#F59E0B' },
    danger: { bg: '#FEE2E2', text: '#B91C1C', strip: '#EF4444' },
};

function loadImage(src) {
    return new Promise((resolve) => {
        if (!src) {
            resolve(null);
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function drawRoundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function wrapText(ctx, text, maxWidth, maxLines = 2) {
    const words = String(text || '').split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        if (ctx.measureText(testLine).width <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                lines.push(words[i]);
                currentLine = '';
            }
            if (lines.length === maxLines - 1) {
                const rest = [currentLine, ...words.slice(i + 1)].filter(Boolean).join(' ');
                let truncated = rest;
                while (truncated.length > 3 && ctx.measureText(`${truncated}…`).width > maxWidth) {
                    truncated = truncated.slice(0, -1);
                }
                lines.push(truncated !== rest ? `${truncated}…` : rest);
                return lines;
            }
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

function formatFullDateLabel(dateOffset) {
    const date = new Date();
    date.setDate(date.getDate() + (Number(dateOffset) || 0));
    const formatted = date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    if (dateOffset === 0) return `Hoy • ${capitalized}`;
    if (dateOffset === 1) return `Mañana • ${capitalized}`;
    return capitalized;
}

function drawCalendarIcon(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawRoundedRect(ctx, x, y + size * 0.15, size, size * 0.85, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.42);
    ctx.lineTo(x + size, y + size * 0.42);
    ctx.moveTo(x + size * 0.28, y);
    ctx.lineTo(x + size * 0.28, y + size * 0.24);
    ctx.moveTo(x + size * 0.72, y);
    ctx.lineTo(x + size * 0.72, y + size * 0.24);
    ctx.stroke();
    ctx.restore();
}

function drawThermometerIcon(ctx, cx, cy, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11);
    ctx.lineTo(cx, cy + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 7, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 11, 3.8, Math.PI, 0);
    ctx.moveTo(cx - 3.8, cy - 11);
    ctx.lineTo(cx - 3.8, cy + 2);
    ctx.moveTo(cx + 3.8, cy - 11);
    ctx.lineTo(cx + 3.8, cy + 2);
    ctx.stroke();
    ctx.restore();
}

function drawWindIcon(ctx, cx, cy, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 5);
    ctx.lineTo(cx + 6, cy - 5);
    ctx.arc(cx + 6, cy - 9, 4, Math.PI / 2, -Math.PI / 2, true);
    ctx.moveTo(cx - 12, cy + 1);
    ctx.lineTo(cx + 11, cy + 1);
    ctx.moveTo(cx - 12, cy + 7);
    ctx.lineTo(cx + 3, cy + 7);
    ctx.arc(cx + 3, cy + 10.5, 3.5, -Math.PI / 2, Math.PI / 2, false);
    ctx.stroke();
    ctx.restore();
}

function drawGaugeIcon(ctx, cx, cy, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 11, Math.PI * 0.8, Math.PI * 0.2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 2);
    ctx.lineTo(cx + 6, cy - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawWaveIcon(ctx, cx, cy, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    for (const offsetY of [-4, 4]) {
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy + offsetY);
        ctx.bezierCurveTo(cx - 7, cy + offsetY - 5, cx - 3, cy + offsetY + 5, cx, cy + offsetY);
        ctx.bezierCurveTo(cx + 3, cy + offsetY - 5, cx + 7, cy + offsetY + 5, cx + 12, cy + offsetY);
        ctx.stroke();
    }
    ctx.restore();
}

function drawBlockTimeIcon(ctx, blockId, cx, cy) {
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (blockId === 'early' || blockId === 'night') {
        const color = blockId === 'early' ? '#6366F1' : '#334155';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0.35 * Math.PI, 1.75 * Math.PI, false);
        ctx.arc(cx + 5, cy - 3, 9, 1.65 * Math.PI, 0.45 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        if (blockId === 'early') {
            ctx.beginPath();
            ctx.arc(cx + 10, cy - 9, 2.2, 0, Math.PI * 2);
            ctx.arc(cx + 13, cy - 2, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (blockId === 'morning') {
        ctx.strokeStyle = '#F59E0B';
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(cx, cy + 4, 8, Math.PI, 0, false);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 13, cy + 5);
        ctx.lineTo(cx + 13, cy + 5);
        ctx.moveTo(cx, cy - 11);
        ctx.lineTo(cx, cy - 7);
        ctx.moveTo(cx - 9, cy - 6);
        ctx.lineTo(cx - 6.5, cy - 3.5);
        ctx.moveTo(cx + 9, cy - 6);
        ctx.lineTo(cx + 6.5, cy - 3.5);
        ctx.stroke();
    } else {
        ctx.strokeStyle = '#F59E0B';
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * 10.5, cy + Math.sin(angle) * 10.5);
            ctx.lineTo(cx + Math.cos(angle) * 13.5, cy + Math.sin(angle) * 13.5);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawCloudShape(ctx, cx, cy, scale, fillColor) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(-6, 2, 6.5, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(0, -3, 7.5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.arc(7, 2, 5.8, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawWeatherConditionIcon(ctx, category, cx, cy) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (category === 'clear_day') {
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * 9.5, cy + Math.sin(a) * 9.5);
            ctx.lineTo(cx + Math.cos(a) * 12.8, cy + Math.sin(a) * 12.8);
            ctx.stroke();
        }
    } else if (category === 'clear_night') {
        ctx.fillStyle = '#6366F1';
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0.35 * Math.PI, 1.75 * Math.PI, false);
        ctx.arc(cx + 4.5, cy - 2.5, 8.2, 1.65 * Math.PI, 0.45 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
    } else if (category === 'partly_cloudy') {
        // Sun peeking from top-right
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + 5, cy - 5, 5.5, 0, Math.PI * 2);
        ctx.fill();
        for (const deg of [-70, -25, 20]) {
            const a = (deg * Math.PI) / 180;
            ctx.beginPath();
            ctx.moveTo(cx + 5 + Math.cos(a) * 7.5, cy - 5 + Math.sin(a) * 7.5);
            ctx.lineTo(cx + 5 + Math.cos(a) * 10, cy - 5 + Math.sin(a) * 10);
            ctx.stroke();
        }
        drawCloudShape(ctx, cx - 2, cy + 3, 0.95, '#94A3B8');
    } else if (category === 'rain') {
        drawCloudShape(ctx, cx, cy - 3, 1.0, '#0284C7');
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.6;
        for (const ox of [-6, 0, 6]) {
            ctx.beginPath();
            ctx.moveTo(cx + ox, cy + 6);
            ctx.lineTo(cx + ox - 2.5, cy + 12.5);
            ctx.stroke();
        }
    } else if (category === 'storm') {
        drawCloudShape(ctx, cx, cy - 4, 1.0, '#475569');
        ctx.fillStyle = '#EAB308';
        ctx.beginPath();
        ctx.moveTo(cx + 1, cy + 3);
        ctx.lineTo(cx - 4.5, cy + 9.5);
        ctx.lineTo(cx - 0.5, cy + 9.5);
        ctx.lineTo(cx - 2.5, cy + 15.5);
        ctx.lineTo(cx + 5, cy + 8);
        ctx.lineTo(cx + 0.8, cy + 8);
        ctx.closePath();
        ctx.fill();
    } else if (category === 'fog') {
        drawCloudShape(ctx, cx, cy - 3, 0.95, '#94A3B8');
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(cx - 9, cy + 7);
        ctx.lineTo(cx + 9, cy + 7);
        ctx.moveTo(cx - 6, cy + 11.5);
        ctx.lineTo(cx + 6, cy + 11.5);
        ctx.stroke();
    } else {
        // cloudy
        drawCloudShape(ctx, cx, cy + 1, 1.05, '#64748B');
    }
    ctx.restore();
}

function drawInstagramIcon(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.6;
    drawRoundedRect(ctx, x, y, size, size, size * 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.23, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size * 0.76, y + size * 0.24, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

/**
 * Generates a sporty light 1080x1350 forecast card PNG with ChimiPesca + Powered by SNAKE branding.
 * Returns { dataUrl, blob, filename }.
 */
export async function generateForecastCard({ locationName, dateOffset, weatherData }) {
    const summary = getFishingSummary(weatherData);
    if (!summary) {
        throw new Error('No hay datos meteorológicos suficientes para generar la tarjeta.');
    }

    const blocks = getDayBlocks(weatherData);
    const [chimiLogo, snakeLogo] = await Promise.all([
        loadImage('/logo-chimi.jpg'),
        loadImage(snakeLogoUrl),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');

    // 1. Clean sporty light background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bgGrad.addColorStop(0, '#F8FAFC');
    bgGrad.addColorStop(0.55, '#F1F7FC');
    bgGrad.addColorStop(1, '#E8F3FB');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Subtle athletic diagonal speed stripes in top-right corner
    ctx.save();
    ctx.fillStyle = 'rgba(0, 153, 219, 0.055)';
    ctx.beginPath();
    ctx.moveTo(760, 0);
    ctx.lineTo(940, 0);
    ctx.lineTo(790, 320);
    ctx.lineTo(610, 320);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 153, 219, 0.035)';
    ctx.beginPath();
    ctx.moveTo(960, 0);
    ctx.lineTo(1080, 0);
    ctx.lineTo(1080, 210);
    ctx.lineTo(830, 320);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Top athletic cyan stripe
    const topBarGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    topBarGrad.addColorStop(0, '#0077B6');
    topBarGrad.addColorStop(0.5, '#0099DB');
    topBarGrad.addColorStop(1, '#38BDF8');
    ctx.fillStyle = topBarGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, 14);

    const MARGIN_X = 38;
    const CONTENT_W = CARD_WIDTH - MARGIN_X * 2;

    // 2. HEADER: Prominent ChimiPesca circular emblem + location + date
    const logoR = 86;
    const logoCx = MARGIN_X + logoR + 2;
    const logoCy = 132;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.arc(logoCx, logoCy, logoR + 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    if (chimiLogo) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoCx, logoCy, logoR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        // Crop inner 84% of logo-chimi.jpg to remove square wood corners cleanly
        const cropRatio = 0.085;
        const sx = chimiLogo.width * cropRatio;
        const sy = chimiLogo.height * cropRatio;
        const sw = chimiLogo.width * (1 - cropRatio * 2);
        const sh = chimiLogo.height * (1 - cropRatio * 2);
        ctx.drawImage(chimiLogo, sx, sy, sw, sh, logoCx - logoR, logoCy - logoR, logoR * 2, logoR * 2);
        ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(logoCx, logoCy, logoR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#0099DB';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();

    // Header texts (enlarged for effortless mobile legibility)
    const headerTextX = logoCx + logoR + 26;
    const headerMaxW = CARD_WIDTH - headerTextX - MARGIN_X;

    // Kicker pill
    const kickerText = 'PRONÓSTICO DE PESCA  •  CHIMIPESCA';
    ctx.font = `800 20px ${FONT_FAMILY}`;
    const kickerW = Math.min(headerMaxW, ctx.measureText(kickerText).width + 32);
    drawRoundedRect(ctx, headerTextX, 50, kickerW, 36, 18);
    ctx.fillStyle = '#E0F2FE';
    ctx.fill();
    ctx.fillStyle = '#0284C7';
    ctx.textBaseline = 'middle';
    ctx.fillText(kickerText, headerTextX + 16, 68.5, kickerW - 32);

    // Location name (auto-fits up to 2 lines cleanly)
    let titleFontSize = 42;
    ctx.font = `900 ${titleFontSize}px ${FONT_FAMILY}`;
    let titleLines = wrapText(ctx, locationName, headerMaxW, 2);
    if (titleLines.length > 1) {
        titleFontSize = 36;
        ctx.font = `900 ${titleFontSize}px ${FONT_FAMILY}`;
        titleLines = wrapText(ctx, locationName, headerMaxW, 2);
    }

    ctx.fillStyle = '#0F172A';
    ctx.textBaseline = 'top';
    titleLines.forEach((line, idx) => {
        ctx.fillText(line, headerTextX, 98 + idx * (titleFontSize + 5));
    });

    // Date line
    const dateY = titleLines.length > 1 ? 186 : 160;
    drawCalendarIcon(ctx, headerTextX, dateY + 2, 24, '#0099DB');
    ctx.font = `700 27px ${FONT_FAMILY}`;
    ctx.fillStyle = '#334155';
    ctx.textBaseline = 'top';
    ctx.fillText(formatFullDateLabel(dateOffset), headerTextX + 34, dateY, headerMaxW - 34);

    // 3. VERDICT HERO BANNER
    const heroY = 240;
    const heroH = 148;
    const theme = LEVEL_THEMES[summary.level] || LEVEL_THEMES.good;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    drawRoundedRect(ctx, MARGIN_X, heroY, CONTENT_W, heroH, 26);
    const heroGrad = ctx.createLinearGradient(MARGIN_X, heroY, MARGIN_X + CONTENT_W, heroY + heroH);
    heroGrad.addColorStop(0, theme.gradStart);
    heroGrad.addColorStop(1, theme.gradEnd);
    ctx.fillStyle = heroGrad;
    ctx.fill();
    ctx.restore();

    // Subtle athletic slash inside hero banner
    ctx.save();
    drawRoundedRect(ctx, MARGIN_X, heroY, CONTENT_W, heroH, 26);
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.beginPath();
    ctx.moveTo(MARGIN_X + 700, heroY);
    ctx.lineTo(MARGIN_X + 890, heroY);
    ctx.lineTo(MARGIN_X + 790, heroY + heroH);
    ctx.lineTo(MARGIN_X + 600, heroY + heroH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Hero right status badge (clean, large & readable on mobile)
    const badgeW = 210;
    const badgeH = 82;
    const badgeX = MARGIN_X + CONTENT_W - badgeW - 28;
    const badgeY = heroY + (heroH - badgeH) / 2;

    // Hero left text
    const heroTextMaxW = badgeX - (MARGIN_X + 34) - 22;
    ctx.textBaseline = 'top';
    ctx.font = `800 20px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillText('CONDICIÓN GENERAL DEL DÍA', MARGIN_X + 34, heroY + 20, heroTextMaxW);

    ctx.font = `900 41px ${FONT_FAMILY}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(summary.headline, MARGIN_X + 34, heroY + 49, heroTextMaxW);

    ctx.font = `600 24px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fillText(summary.subtitle, MARGIN_X + 34, heroY + 102, heroTextMaxW);

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 32px ${FONT_FAMILY}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(summary.badge, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1, badgeW - 18);
    ctx.textAlign = 'left';

    // 4. KEY DAILY METRICS ROW (Min – Max extremes, sized for mobile screens)
    const metricsY = 410;
    const metricsH = 176;

    const formatRange = (minVal, maxVal, unit = '') => {
        if (minVal === maxVal) return `${maxVal}${unit}`;
        return `${minVal}–${maxVal}${unit}`;
    };

    const metrics = [
        {
            label: 'TEMPERATURA',
            value: summary.minTemp === summary.maxTemp
                ? `${summary.maxTemp}°C`
                : `${summary.minTemp}° – ${summary.maxTemp}°`,
            sub: 'Mín – Máx del día',
            subColor: '#64748B',
            iconBg: '#FFF7ED',
            iconColor: '#EA580C',
            drawIcon: drawThermometerIcon,
        },
        {
            label: 'VIENTO',
            value: `${formatRange(summary.minWind, summary.maxWind)} km/h`,
            sub: summary.dominantWindDir
                ? `Mín – Máx • Dir. ${summary.dominantWindDir}`
                : 'Mín – Máx del día',
            subColor: summary.maxWind >= 19 ? '#DC2626' : '#64748B',
            iconBg: summary.maxWind >= 19 ? '#FEF2F2' : '#E0F2FE',
            iconColor: summary.maxWind >= 19 ? '#DC2626' : '#0284C7',
            drawIcon: drawWindIcon,
        },
        {
            label: 'PRESIÓN (hPa)',
            value: formatRange(summary.minPressure, summary.maxPressure),
            sub: summary.isGoodPressure ? 'Mín – Máx • Buena' : 'Mín – Máx del día',
            subColor: summary.isGoodPressure ? '#059669' : '#64748B',
            iconBg: summary.isGoodPressure ? '#ECFDF5' : '#F1F5F9',
            iconColor: summary.isGoodPressure ? '#059669' : '#475569',
            drawIcon: drawGaugeIcon,
        },
    ];

    if (summary.hasWaves) {
        const minWStr = summary.minWave.toFixed(1);
        const maxWStr = summary.maxWave.toFixed(1);
        const waveRangeVal = minWStr === maxWStr ? `${maxWStr} m` : `${minWStr}–${maxWStr} m`;
        const waveDesc = summary.maxWave < 0.3 ? 'Calmo' : summary.maxWave < 0.6 ? 'Moderado' : 'Alto';
        metrics.push({
            label: 'OLEAJE',
            value: waveRangeVal,
            sub: `Mín – Máx • ${waveDesc}`,
            subColor: summary.maxWave >= 0.5 ? '#D97706' : '#0284C7',
            iconBg: '#E0F2FE',
            iconColor: '#0099DB',
            drawIcon: drawWaveIcon,
        });
    }

    const metricGap = 16;
    const metricW = (CONTENT_W - metricGap * (metrics.length - 1)) / metrics.length;

    metrics.forEach((m, idx) => {
        const mx = MARGIN_X + idx * (metricW + metricGap);

        ctx.save();
        ctx.shadowColor = 'rgba(15, 23, 42, 0.06)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;
        drawRoundedRect(ctx, mx, metricsY, metricW, metricsH, 22);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();

        drawRoundedRect(ctx, mx, metricsY, metricW, metricsH, 22);
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon circle
        const icx = mx + 36;
        const icy = metricsY + 38;
        ctx.beginPath();
        ctx.arc(icx, icy, 21, 0, Math.PI * 2);
        ctx.fillStyle = m.iconBg;
        ctx.fill();
        m.drawIcon(ctx, icx, icy, m.iconColor);

        // Label (larger for phone legibility)
        ctx.textBaseline = 'middle';
        ctx.font = `800 19px ${FONT_FAMILY}`;
        ctx.fillStyle = '#475569';
        ctx.fillText(m.label, mx + 66, icy, metricW - 78);

        // Big value
        const valFontSize = metrics.length === 4 ? 36 : 42;
        ctx.textBaseline = 'top';
        ctx.font = `900 ${valFontSize}px ${FONT_FAMILY}`;
        ctx.fillStyle = '#0F172A';
        ctx.fillText(m.value, mx + 20, metricsY + 72, metricW - 36);

        // Subtext
        ctx.font = `700 21px ${FONT_FAMILY}`;
        ctx.fillStyle = m.subColor;
        ctx.fillText(m.sub, mx + 20, metricsY + 128, metricW - 36);
    });

    // 5. DAILY BLOCKS BREAKDOWN CARD
    const blocksCardY = 608;
    const blocksCardH = 468;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.06)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    drawRoundedRect(ctx, MARGIN_X, blocksCardY, CONTENT_W, blocksCardH, 26);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    drawRoundedRect(ctx, MARGIN_X, blocksCardY, CONTENT_W, blocksCardH, 26);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Card section header
    drawRoundedRect(ctx, MARGIN_X + 24, blocksCardY + 24, 7, 28, 4);
    ctx.fillStyle = '#0099DB';
    ctx.fill();

    ctx.textBaseline = 'middle';
    ctx.font = `800 24px ${FONT_FAMILY}`;
    ctx.fillStyle = '#0F172A';
    ctx.fillText('RESUMEN POR FRANJA HORARIA', MARGIN_X + 42, blocksCardY + 38);

    ctx.textAlign = 'right';
    ctx.font = `700 20px ${FONT_FAMILY}`;
    ctx.fillStyle = '#64748B';
    ctx.fillText('Clima y Temp  •  Viento  •  Presión', MARGIN_X + CONTENT_W - 24, blocksCardY + 38);
    ctx.textAlign = 'left';

    // Thin divider
    ctx.beginPath();
    ctx.moveTo(MARGIN_X + 24, blocksCardY + 68);
    ctx.lineTo(MARGIN_X + CONTENT_W - 24, blocksCardY + 68);
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Render block rows cleanly centered in available vertical space
    const rowsStartY = blocksCardY + 82;
    const rowsAvailH = blocksCardH - 98;
    const rowGap = 12;
    const visibleBlocks = blocks.slice(0, 4);
    const rowH = Math.min(86, (rowsAvailH - rowGap * (Math.max(visibleBlocks.length, 1) - 1)) / Math.max(visibleBlocks.length, 1));
    const totalRowsH = visibleBlocks.length * rowH + Math.max(visibleBlocks.length - 1, 0) * rowGap;
    const verticalOffset = rowsStartY + (rowsAvailH - totalRowsH) / 2;

    visibleBlocks.forEach((block, idx) => {
        const ry = verticalOffset + idx * (rowH + rowGap);
        const rx = MARGIN_X + 18;
        const rw = CONTENT_W - 36;
        const bTheme = BLOCK_BADGE_THEMES[block.conditionClass] || BLOCK_BADGE_THEMES.neutral;

        drawRoundedRect(ctx, rx, ry, rw, rowH, 16);
        ctx.fillStyle = '#F8FAFC';
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Left status accent strip
        drawRoundedRect(ctx, rx + 8, ry + 12, 8, rowH - 24, 4);
        ctx.fillStyle = bTheme.strip;
        ctx.fill();

        // Time-of-day vector icon
        drawBlockTimeIcon(ctx, block.id, rx + 42, ry + rowH / 2);

        // Block name & range (larger for crisp phone readability)
        ctx.textBaseline = 'top';
        ctx.font = `800 26px ${FONT_FAMILY}`;
        ctx.fillStyle = '#0F172A';
        ctx.fillText(block.label, rx + 70, ry + rowH / 2 - 27);

        ctx.font = `600 20px ${FONT_FAMILY}`;
        ctx.fillStyle = '#64748B';
        ctx.fillText(block.range.replace(' hs', ''), rx + 70, ry + rowH / 2 + 5);

        // Aligned numeric columns
        ctx.textBaseline = 'middle';
        const rowMidY = ry + rowH / 2;

        // Weather icon next to temperature (scaled 1.25x for mobile clarity)
        ctx.save();
        ctx.translate(rx + 276, rowMidY);
        ctx.scale(1.25, 1.25);
        drawWeatherConditionIcon(ctx, block.weatherCategory, 0, 0);
        ctx.restore();

        // Temp column
        ctx.font = `900 29px ${FONT_FAMILY}`;
        ctx.fillStyle = '#0F172A';
        ctx.fillText(`${block.avgTemp}°C`, rx + 310, rowMidY);

        // Wind column
        const windLabel = `${block.avgWind} km/h${block.dominantWindDir ? ` ${block.dominantWindDir}` : ''}`;
        ctx.font = `800 24px ${FONT_FAMILY}`;
        ctx.fillStyle = block.avgWind >= 19 ? '#DC2626' : '#334155';
        ctx.fillText(windLabel, rx + 422, rowMidY, 200);

        // Pressure column
        ctx.font = `700 23px ${FONT_FAMILY}`;
        ctx.fillStyle = block.avgPressure > 1015 ? '#059669' : '#475569';
        ctx.fillText(`${block.avgPressure} hPa`, rx + 640, rowMidY, 145);

        // Condition status pill
        const pillW = 148;
        const pillH = 48;
        const pillX = rx + rw - pillW - 14;
        const pillY = rowMidY - pillH / 2;

        drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 24);
        ctx.fillStyle = bTheme.bg;
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.font = `900 21px ${FONT_FAMILY}`;
        ctx.fillStyle = bTheme.text;
        ctx.fillText(block.condition.toUpperCase(), pillX + pillW / 2, rowMidY + 1, pillW - 14);
        ctx.textAlign = 'left';
    });

    // 6. SPONSOR FOOTER: POWERED BY SNAKE
    const footerY = 1100;
    const footerH = 198;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 153, 219, 0.14)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    drawRoundedRect(ctx, MARGIN_X, footerY, CONTENT_W, footerH, 26);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    // Crisp cyan border + left accent bar
    ctx.save();
    drawRoundedRect(ctx, MARGIN_X, footerY, CONTENT_W, footerH, 26);
    ctx.clip();
    ctx.fillStyle = '#0099DB';
    ctx.fillRect(MARGIN_X, footerY, 12, footerH);
    ctx.restore();

    drawRoundedRect(ctx, MARGIN_X, footerY, CONTENT_W, footerH, 26);
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left block: "POWERED BY" + SNAKE Logo
    const sponsorLeftX = MARGIN_X + 44;
    ctx.textBaseline = 'top';
    ctx.font = `800 18px ${FONT_FAMILY}`;
    ctx.fillStyle = '#64748B';
    ctx.fillText('POWERED BY SNAKE', sponsorLeftX, footerY + 24);

    if (snakeLogo) {
        const targetW = 360;
        const aspect = snakeLogo.height / snakeLogo.width;
        const targetH = Math.min(120, targetW * aspect);
        const drawW = targetH / aspect;
        ctx.drawImage(snakeLogo, sponsorLeftX - 4, footerY + 54, drawW, targetH);
    } else {
        ctx.font = `900 54px ${FONT_FAMILY}`;
        ctx.fillStyle = '#0099DB';
        ctx.fillText('SNAKE', sponsorLeftX, footerY + 62);
    }

    // Vertical divider
    const dividerX = MARGIN_X + 510;
    ctx.beginPath();
    ctx.moveTo(dividerX, footerY + 34);
    ctx.lineTo(dividerX, footerY + footerH - 34);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right block: Instagram handle & ChimiPesca credit
    const rightInfoX = dividerX + 36;
    drawInstagramIcon(ctx, rightInfoX, footerY + 44, 32, '#0099DB');

    ctx.textBaseline = 'middle';
    ctx.font = `800 30px ${FONT_FAMILY}`;
    ctx.fillStyle = '#0099DB';
    ctx.fillText('@snakefishing_ok', rightInfoX + 44, footerY + 61);

    ctx.textBaseline = 'top';
    ctx.font = `700 22px ${FONT_FAMILY}`;
    ctx.fillStyle = '#334155';
    ctx.fillText('Equipamiento de Pesca Deportiva', rightInfoX, footerY + 96);

    ctx.font = `600 19px ${FONT_FAMILY}`;
    ctx.fillStyle = '#64748B';
    ctx.fillText('Compartido desde App ChimiPesca', rightInfoX, footerY + 138);

    // Subtle bottom micro caption
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 16px ${FONT_FAMILY}`;
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('ChimiPesca  •  Pronóstico orientativo para salidas de pesca', CARD_WIDTH / 2, 1326);
    ctx.textAlign = 'left';

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const safeSlug = String(locationName || 'pronostico')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);

    return {
        dataUrl,
        blob,
        filename: `chimipesca-${safeSlug}.png`,
    };
}

/**
 * Triggers direct download of the generated forecast image.
 */
export function downloadForecastImage({ dataUrl, filename }) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename || 'pronostico-chimipesca.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Shares the generated PNG image natively on Android (Capacitor Share + Filesystem),
 * via Web Share API Level 2 on mobile browsers, or falls back to downloading the PNG.
 * Returns { method: 'native' | 'webshare' | 'download' | 'cancelled' }.
 */
export async function shareForecastImage({ dataUrl, blob, filename, locationName, dateOffset }) {
    const dateText = formatFullDateLabel(dateOffset);
    const shareText = `🎣 Pronóstico en ${locationName} (${dateText}) — ChimiPesca\nPowered by SNAKE 👉 https://instagram.com/snakefishing_ok`;

    // 1. Native Capacitor Android/iOS (if @capacitor/share & @capacitor/filesystem are installed)
    if (
        Capacitor.isNativePlatform() &&
        Capacitor.isPluginAvailable('Share') &&
        Capacitor.isPluginAvailable('Filesystem')
    ) {
        try {
            const Filesystem = registerPlugin('Filesystem');
            const Share = registerPlugin('Share');
            const base64Data = dataUrl.split(',')[1];
            const written = await Filesystem.writeFile({
                path: filename,
                data: base64Data,
                directory: 'CACHE',
            });

            await Share.share({
                title: `Pronóstico ${locationName} - ChimiPesca`,
                text: shareText,
                files: [written.uri],
                dialogTitle: 'Compartir pronóstico de pesca',
            });
            return { method: 'native' };
        } catch (err) {
            if (err?.message?.toLowerCase().includes('cancel')) {
                return { method: 'cancelled' };
            }
            console.warn('Capacitor native share failed, trying web fallback:', err);
        }
    }

    // 2. Web Share API Level 2 (Chrome Android, Safari iOS, modern mobile browsers)
    if (blob && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
            const file = new File([blob], filename, { type: 'image/png' });
            const shareData = {
                title: `Pronóstico ${locationName} - ChimiPesca`,
                text: shareText,
                files: [file],
            };

            if (!navigator.canShare || navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
                return { method: 'webshare' };
            }
        } catch (err) {
            if (err?.name === 'AbortError') {
                return { method: 'cancelled' };
            }
            console.warn('Web Share API file sharing failed, falling back to download:', err);
        }
    }

    // 3. Fallback: direct PNG download
    downloadForecastImage({ dataUrl, filename });
    return { method: 'download' };
}
