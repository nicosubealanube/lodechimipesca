import React from 'react';
import fifa2026Logo from '../assets/fifa_2026_logo.svg';

export default function PromoProde() {
    return (
        <div 
            className="fishing-report-card" 
            style={{ 
                margin: '-8px 0', 
                background: 'var(--glass-bg)', 
                border: '1px solid var(--glass-border)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
        >
            {/* Subtle light effect on card */}
            <div 
                style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(241, 133, 28, 0.08) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}
            />
            
            <a
                href="https://chimiprode.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    textDecoration: 'none', 
                    width: '100%', 
                    gap: '16px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: '800', 
                        color: 'var(--secondary-color)', 
                        lineHeight: '1.1',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        letterSpacing: '-0.5px'
                    }}>
                        Chimi Prode
                    </span>
                    <span style={{ 
                        fontSize: '2.1rem', 
                        fontWeight: '900', 
                        color: 'var(--primary-color)', 
                        lineHeight: '1.1',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        letterSpacing: '-0.5px'
                    }}>
                        Mundial 2026
                    </span>
                </div>
                <div style={{ 
                    width: '84px', 
                    height: '84px', 
                    borderRadius: '50%', 
                    border: '2px solid #f1851c', 
                    backgroundColor: '#000000', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '8px',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    boxShadow: '0 0 15px rgba(241, 133, 28, 0.4)'
                }}>
                    <img 
                        src={fifa2026Logo} 
                        alt="FIFA 2026" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                </div>
            </a>
        </div>
    );
}
