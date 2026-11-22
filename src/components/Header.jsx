import React, { useState, useEffect, useRef } from 'react'
import { Instagram, ExternalLink, ShoppingBag } from 'lucide-react'
import snakeLogo from '../assets/snake_logo.png'
import cantherisLogo from '../assets/cantheris_logo.png'

const SNAKE_INSTAGRAM_URL = 'https://www.instagram.com/snakefishing_ok?obrf=a2E5ZGRubTk4Z3U2'
const CANTHERIS_INSTAGRAM_URL = 'https://www.instagram.com/cantherisarg?fqnt=NWprNzNjZGY1cW9v'
const CANTHERIS_STORE_URL = 'https://www.cantheris.com/productos/'

// Ready for Snake product images once provided: [{ name, image, url }]
const SNAKE_PRODUCTS = []

// Fallback products used only if the live Netlify Function is unreachable (e.g. offline / local)
const FALLBACK_CANTHERIS_PRODUCTS = [
    {
        name: 'Hidden',
        image: 'https://dcdn-us.mitiendanube.com/stores/595/405/products/hidden-conj-mar-e91788b6408923ae2016977485211533-480-0.webp',
        url: 'https://www.cantheris.com/productos/hidden/',
    },
    {
        name: 'France Azul',
        image: 'https://dcdn-us.mitiendanube.com/stores/595/405/products/france-azul-conj-mar-27a8b340fa141c091d16977597703165-480-0.webp',
        url: 'https://www.cantheris.com/productos/france-azul/',
    },
    {
        name: 'Drone',
        image: 'https://dcdn-us.mitiendanube.com/stores/595/405/products/drone-conj-f8d806d77a9e67af6217143415286142-480-0.webp',
        url: 'https://www.cantheris.com/productos/drone/',
    },
    {
        name: 'Bosque',
        image: 'https://dcdn-us.mitiendanube.com/stores/595/405/products/bosque-conj-2b5fd8259e009d91d317143366894017-480-0.webp',
        url: 'https://www.cantheris.com/productos/bosque/',
    },
]

const SPONSORS = [
    {
        id: 'snake',
        name: 'SNAKE Fishing Equipment',
        handle: '@snakefishing_ok',
        logo: snakeLogo,
        url: SNAKE_INSTAGRAM_URL,
        logoClass: 'sponsor-logo-snake',
        promoTheme: 'sponsor-back-snake-promo',
        productTheme: 'sponsor-back-product-snake',
    },
    {
        id: 'cantheris',
        name: 'Cantheris Fishing',
        handle: '@cantherisarg',
        logo: cantherisLogo,
        url: CANTHERIS_INSTAGRAM_URL,
        storeUrl: CANTHERIS_STORE_URL,
        logoClass: 'sponsor-logo-cantheris',
        promoTheme: 'sponsor-back-cantheris-promo',
        productTheme: 'sponsor-back-product-cantheris',
    },
]

function getCantherisProductsEndpoint() {
    if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
        return '/.netlify/functions/get-cantheris-products'
    }
    return 'https://lodechimipesca.netlify.app/.netlify/functions/get-cantheris-products'
}

export default function Header() {
    const [flippedIndex, setFlippedIndex] = useState(null)
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [cantherisProducts, setCantherisProducts] = useState(FALLBACK_CANTHERIS_PRODUCTS)
    const [snakeProductIdx, setSnakeProductIdx] = useState(0)
    const [cantherisProductIdx, setCantherisProductIdx] = useState(0)
    const [cantherisImgFailed, setCantherisImgFailed] = useState(false)
    const cantherisCountRef = useRef(FALLBACK_CANTHERIS_PRODUCTS.length)

    // Fetch live Cantheris catalog via Netlify Function
    useEffect(() => {
        let active = true
        const fetchCatalog = async () => {
            try {
                const res = await fetch(getCantherisProductsEndpoint())
                if (!res.ok) return
                const data = await res.json()
                if (active && Array.isArray(data.products) && data.products.length > 0) {
                    setCantherisProducts(data.products)
                    cantherisCountRef.current = data.products.length
                }
            } catch {
                // Keep fallback products silently if offline
            }
        }
        fetchCatalog()
        return () => { active = false }
    }, [])

    // Preload current & next Cantheris product images so flips never flicker
    useEffect(() => {
        if (!cantherisProducts.length) return
        setCantherisImgFailed(false)
        const curr = cantherisProducts[cantherisProductIdx % cantherisProducts.length]
        const next = cantherisProducts[(cantherisProductIdx + 1) % cantherisProducts.length]
        if (curr?.image) { const i1 = new Image(); i1.src = curr.image }
        if (next?.image) { const i2 = new Image(); i2.src = next.image }
    }, [cantherisProducts, cantherisProductIdx])

    // Direct Logo -> Product -> Logo -> Next Product staggered flip cycle
    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return
        }

        let timeouts = []
        let cancelled = false

        const schedule = (fn, ms) => {
            timeouts.push(setTimeout(() => { if (!cancelled) fn() }, ms))
        }

        const runCycle = (startDelay) => {
            timeouts = []
            let t = startDelay

            // 1. Flip SNAKE (Logo -> Product/Promo -> Logo)
            schedule(() => setFlippedIndex(0), t)
            t += 3000
            schedule(() => setFlippedIndex(null), t)
            t += 850
            if (SNAKE_PRODUCTS.length > 1) {
                schedule(() => setSnakeProductIdx((prev) => (prev + 1) % SNAKE_PRODUCTS.length), t)
            }

            // 2. Flip Cantheris (Logo -> Live Product -> Logo -> advance to next product)
            t += 450
            schedule(() => setFlippedIndex(1), t)
            t += 3200
            schedule(() => setFlippedIndex(null), t)
            t += 850
            schedule(() => {
                setCantherisProductIdx((prev) => (prev + 1) % Math.max(cantherisCountRef.current, 1))
            }, t)

            // Calm pause showing both logos, then repeat with next products
            t += 1600
            schedule(() => runCycle(0), t)
        }

        runCycle(2000)

        return () => {
            cancelled = true
            timeouts.forEach(clearTimeout)
        }
    }, [])

    const activeSnakeProduct = SNAKE_PRODUCTS.length > 0
        ? SNAKE_PRODUCTS[snakeProductIdx % SNAKE_PRODUCTS.length]
        : null

    const activeCantherisProduct = cantherisProducts.length > 0 && !cantherisImgFailed
        ? cantherisProducts[cantherisProductIdx % cantherisProducts.length]
        : null

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
                        const activeProduct = sponsor.id === 'cantheris'
                            ? activeCantherisProduct
                            : activeSnakeProduct

                        const targetUrl = isFlipped && activeProduct
                            ? (activeProduct.url || sponsor.url)
                            : (isFlipped && sponsor.storeUrl ? sponsor.storeUrl : sponsor.url)

                        const targetLabel = isFlipped && activeProduct
                            ? `Ver ${activeProduct.name} de ${sponsor.name}`
                            : `Visitar Instagram de ${sponsor.name} (${sponsor.handle})`

                        return (
                            <a
                                key={sponsor.id}
                                href={targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="header-sponsor-link"
                                aria-label={targetLabel}
                                title={targetLabel}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className={`sponsor-flip-inner ${isFlipped ? 'is-flipped' : ''}`}>
                                    {/* Front Face: Brand Logo + corner IG badge */}
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

                                    {/* Back Face: Product showcase (or promo fallback) */}
                                    {activeProduct ? (
                                        <div className={`sponsor-face sponsor-face-back sponsor-back-product ${sponsor.productTheme}`}>
                                            <img
                                                src={activeProduct.image}
                                                alt={activeProduct.name}
                                                className="sponsor-product-thumb"
                                                onError={sponsor.id === 'cantheris' ? () => setCantherisImgFailed(true) : undefined}
                                            />
                                            <div className="sponsor-back-text">
                                                <span className="sponsor-product-name">{activeProduct.name}</span>
                                                <span className="sponsor-product-cta">
                                                    Ver producto <ExternalLink size={10} />
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`sponsor-face sponsor-face-back ${sponsor.promoTheme}`}>
                                            <span className="sponsor-promo-badge" aria-hidden="true">
                                                <ShoppingBag size={15} strokeWidth={2.4} />
                                            </span>
                                            <div className="sponsor-back-text">
                                                <span className="sponsor-promo-title">Conocé nuestros productos</span>
                                                <span className="sponsor-back-cta">
                                                    Ver catálogo <ExternalLink size={10} />
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </a>
                        )
                    })}
                </div>
            </div>
        </header>
    )
}
