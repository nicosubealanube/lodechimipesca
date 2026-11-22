import React, { useState, useEffect } from 'react'
import { Instagram, ExternalLink } from 'lucide-react'
import snakeLogo from '../assets/snake_logo.png'
import cantherisLogo from '../assets/cantheris_logo.png'

const SPONSORS = [
    {
        name: 'SNAKE Fishing Equipment',
        handle: '@snakefishing_ok',
        logo: snakeLogo,
        url: 'https://www.instagram.com/snakefishing_ok?obrf=a2E5ZGRubTk4Z3U2',
        logoClass: 'sponsor-logo-snake',
        backTheme: 'sponsor-back-snake',
    },
    {
        name: 'Cantheris Fishing',
        handle: '@cantherisarg',
        logo: cantherisLogo,
        url: 'https://www.instagram.com/cantherisarg?fqnt=NWprNzNjZGY1cW9v',
        logoClass: 'sponsor-logo-cantheris',
        backTheme: 'sponsor-back-cantheris',
    },
]

export default function Header() {
    const [flippedIndex, setFlippedIndex] = useState(null)
    const [hoveredIndex, setHoveredIndex] = useState(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return
        }

        let timeouts = []
        let cancelled = false

        const runCycle = (initialDelay) => {
            timeouts = []
            // Flip SNAKE -> hold -> return
            timeouts.push(setTimeout(() => { if (!cancelled) setFlippedIndex(0) }, initialDelay))
            timeouts.push(setTimeout(() => { if (!cancelled) setFlippedIndex(null) }, initialDelay + 2800))
            // Flip Cantheris -> hold -> return
            timeouts.push(setTimeout(() => { if (!cancelled) setFlippedIndex(1) }, initialDelay + 4200))
            timeouts.push(setTimeout(() => { if (!cancelled) setFlippedIndex(null) }, initialDelay + 7000))
            // Repeat smoothly after a calm pause
            timeouts.push(setTimeout(() => { if (!cancelled) runCycle(2600) }, initialDelay + 8400))
        }

        runCycle(2200)

        return () => {
            cancelled = true
            timeouts.forEach(clearTimeout)
        }
    }, [])

    return (
        <header className="header">
            <div className="logo-container">
                <img src="/logo-chimi.jpg" alt="Lo de Chimi Pesca" className="app-logo" />
            </div>

            <div className="header-sponsors" aria-label="Sponsors">
                <div className="powered-by-divider">
                    <span className="powered-by-line" />
                    <span className="powered-by-label">Powered by</span>
                    <span className="powered-by-line" />
                </div>

                <div className="header-sponsors-grid">
                    {SPONSORS.map((sponsor, idx) => {
                        const isFlipped = hoveredIndex === idx || (hoveredIndex === null && flippedIndex === idx)

                        return (
                            <a
                                key={sponsor.name}
                                href={sponsor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="header-sponsor-link"
                                aria-label={`Visitar Instagram de ${sponsor.name} (${sponsor.handle})`}
                                title={`Abrir ${sponsor.handle} en Instagram`}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className={`sponsor-flip-inner ${isFlipped ? 'is-flipped' : ''}`}>
                                    {/* Front Face: Brand Logo */}
                                    <div className={`sponsor-face sponsor-face-front ${idx === 1 ? 'sheen-delayed' : ''}`}>
                                        <span className="sponsor-corner-ig" aria-hidden="true">
                                            <Instagram size={11} strokeWidth={2.4} />
                                        </span>
                                        <img
                                            src={sponsor.logo}
                                            alt={sponsor.name}
                                            className={`header-sponsor-img ${sponsor.logoClass}`}
                                        />
                                    </div>

                                    {/* Back Face: Instagram CTA */}
                                    <div className={`sponsor-face sponsor-face-back ${sponsor.backTheme}`}>
                                        <span className="sponsor-ig-badge" aria-hidden="true">
                                            <Instagram size={15} strokeWidth={2.4} />
                                        </span>
                                        <div className="sponsor-back-text">
                                            <span className="sponsor-back-handle">{sponsor.handle}</span>
                                            <span className="sponsor-back-cta">
                                                Ver Instagram <ExternalLink size={10} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        )
                    })}
                </div>
            </div>
        </header>
    )
}
