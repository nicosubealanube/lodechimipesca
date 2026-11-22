import React, { useState, useEffect, useRef } from 'react'
import { Instagram, ExternalLink, ShoppingBag } from 'lucide-react'
import snakeLogo from '../assets/snake_logo.png'
import cantherisLogo from '../assets/cantheris_logo.png'

const SNAKE_INSTAGRAM_URL = 'https://www.instagram.com/snakefishing_ok?obrf=a2E5ZGRubTk4Z3U2'
const CANTHERIS_INSTAGRAM_URL = 'https://www.instagram.com/cantherisarg?fqnt=NWprNzNjZGY1cW9v'

// Fallback products used only if the live Netlify Function is unreachable (e.g. offline / pre-deploy)
const FALLBACK_CANTHERIS_PRODUCTS = [
    {
        name: 'Remera Hidden',
        image: 'https://dcdn-us.mitiendanube.com/stores/595/405/products/hidden-conj-mar-e91788b6408923ae2016977485211533-480-0.webp',
        url: 'https://www.cantheris.com/productos/hidden/',
    },
    {
        name: 'France Azul',
        image: 'https://dcdn-us.mitiendanube.com/stores/595/405/products/france-azul-conj-mar-27a8b340fa141c091d16977597703165-480-0.webp',
        url: 'https://www.cantheris.com/productos/france-azul/',
    },
    {
        name: 'Modelo Drone',
        image: 'https://dcdn-us.mitiendanube.com/stores/595/405/products/drone-conj-f8d806d77a9e67af6217143415286142-480-0.webp',
        url: 'https://www.cantheris.com/productos/drone/',
    },
    {
        name: 'Colección Bosque',
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
        backTheme: 'sponsor-back-snake',
    },
    {
        id: 'cantheris',
        name: 'Cantheris Fishing',
        handle: '@cantherisarg',
        logo: cantherisLogo,
        url: CANTHERIS_INSTAGRAM_URL,
        logoClass: 'sponsor-logo-cantheris',
        backTheme: 'sponsor-back-cantheris',
    },
]

function getCantherisProductsEndpoint() {
    if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
        return '/.netlify/functions/get-cantheris-products'
    }
    return 'https://lodechimipesca.netlify.app/.netlify/functions/get-cantheris-products'
}

export default function Header() {
    // flippedIndex: 0 (SNAKE) | 1 (Cantheris) | null
    const [flippedIndex, setFlippedIndex] = useState(null)
    const [hoveredIndex, setHoveredIndex] = useState(null)
    // Track which back-face mode each sponsor currently holds ('instagram' | 'product')
    const [cardModes, setCardModes] = useState(['instagram', 'instagram'])
    const [cantherisProducts, setCantherisProducts] = useState(FALLBACK_CANTHERIS_PRODUCTS)
    const [productIdx, setProductIdx] = useState(0)
    const [imgFailed, setImgFailed] = useState(false)
    const productsCountRef = useRef(FALLBACK_CANTHERIS_PRODUCTS.length)

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
                    productsCountRef.current = data.products.length
                }
            } catch {
                // Keep fallback products silently if offline or not deployed yet
            }
        }
        fetchCatalog()
        return () => { active = false }
    }, [])

    // Preload current & next Cantheris product images so flips never flicker
    useEffect(() => {
        if (!cantherisProducts.length) return
        setImgFailed(false)
        const curr = cantherisProducts[productIdx % cantherisProducts.length]
        const next = cantherisProducts[(productIdx + 1) % cantherisProducts.length]
        if (curr?.image) { const i1 = new Image(); i1.src = curr.image }
        if (next?.image) { const i2 = new Image(); i2.src = next.image }
    }, [cantherisProducts, productIdx])

    // Two-stage 3D flip cycle:
    // Round 1 (Instagram): SNAKE IG -> Cantheris IG
    // Round 2 (Products):  SNAKE "Conocé nuestros productos" -> Cantheris live product
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

            // --- ROUND 1: INSTAGRAM ---
            schedule(() => {
                setCardModes(['instagram', 'instagram'])
                setFlippedIndex(0)
            }, t)
            t += 2600
            schedule(() => setFlippedIndex(null), t)

            t += 1200
            schedule(() => setFlippedIndex(1), t)
            t += 2600
            schedule(() => setFlippedIndex(null), t)

            // Wait for Cantheris to finish flipping back before swapping back-face content
            t += 900
            schedule(() => setCardModes(['product', 'product']), t)

            // --- ROUND 2: PRODUCTS ---
            t += 900
            schedule(() => setFlippedIndex(0), t)
            t += 2900
            schedule(() => setFlippedIndex(null), t)

            t += 1200
            schedule(() => setFlippedIndex(1), t)
            t += 3200
            schedule(() => setFlippedIndex(null), t)

            // Advance to next Cantheris product after flipping back face-front
            t += 900
            schedule(() => {
                setProductIdx((prev) => (prev + 1) % Math.max(productsCountRef.current, 1))
                setCardModes(['instagram', 'instagram'])
            }, t)

            // Restart full cycle after a calm pause
            t += 1600
            schedule(() => runCycle(0), t)
        }

        runCycle(2000)

        return () => {
            cancelled = true
            timeouts.forEach(clearTimeout)
        }
    }, [])

    const activeProduct = cantherisProducts.length > 0
        ? cantherisProducts[productIdx % cantherisProducts.length]
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
                        const mode = cardModes[idx]
                        const showingCantherisProduct = sponsor.id === 'cantheris' && mode === 'product' && activeProduct && !imgFailed
                        const showingSnakeProduct = sponsor.id === 'snake' && mode === 'product'

                        // When Cantheris is showing a product, clicking opens that product directly
                        const targetUrl = isFlipped && showingCantherisProduct
                            ? activeProduct.url
                            : sponsor.url

                        const targetLabel = isFlipped && showingCantherisProduct
                            ? `Ver ${activeProduct.name} en Cantheris`
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

                                    {/* Back Face: alternates between Instagram & Products */}
                                    {showingCantherisProduct ? (
                                        <div className="sponsor-face sponsor-face-back sponsor-back-product">
                                            <img
                                                src={activeProduct.image}
                                                alt={activeProduct.name}
                                                className="sponsor-product-thumb"
                                                onError={() => setImgFailed(true)}
                                            />
                                            <div className="sponsor-back-text">
                                                <span className="sponsor-product-name">{activeProduct.name}</span>
                                                <span className="sponsor-product-cta">
                                                    Ver producto <ExternalLink size={10} />
                                                </span>
                                            </div>
                                        </div>
                                    ) : showingSnakeProduct ? (
                                        <div className="sponsor-face sponsor-face-back sponsor-back-snake-promo">
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
                                    ) : (
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
