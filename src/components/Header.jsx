import React from 'react'
import snakeLogo from '../assets/snake_logo.png'
import cantherisLogo from '../assets/cantheris_logo.png'

const SPONSORS = [
    {
        name: 'SNAKE Fishing Equipment',
        logo: snakeLogo,
        url: 'https://www.instagram.com/snakefishing_ok?obrf=a2E5ZGRubTk4Z3U2',
        className: 'sponsor-logo-snake',
    },
    {
        name: 'Cantheris Fishing',
        logo: cantherisLogo,
        url: 'https://www.instagram.com/cantherisarg?fqnt=NWprNzNjZGY1cW9v',
        className: 'sponsor-logo-cantheris',
    },
]

export default function Header() {
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
                    {SPONSORS.map((sponsor) => (
                        <a
                            key={sponsor.name}
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="header-sponsor-card"
                            aria-label={`Visitar Instagram de ${sponsor.name}`}
                            title={`Instagram de ${sponsor.name}`}
                        >
                            <img
                                src={sponsor.logo}
                                alt={sponsor.name}
                                className={`header-sponsor-img ${sponsor.className}`}
                            />
                        </a>
                    ))}
                </div>
            </div>
        </header>
    )
}
