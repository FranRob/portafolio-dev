import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#b026ff',
          cyan: '#00e5ff',
          magenta: '#ff00ff',
        },
        dark: {
          base: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            textShadow:
              '0 0 10px #b026ff, 0 0 20px #b026ff, 0 0 40px #b026ff',
          },
          '50%': {
            textShadow:
              '0 0 20px #b026ff, 0 0 40px #b026ff, 0 0 80px #b026ff',
          },
        },
        glowCyan: {
          '0%, 100%': {
            textShadow:
              '0 0 10px #00e5ff, 0 0 20px #00e5ff, 0 0 40px #00e5ff',
          },
          '50%': {
            textShadow:
              '0 0 20px #00e5ff, 0 0 40px #00e5ff, 0 0 80px #00e5ff',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        glitch: {
          '0%': { transform: 'translate(0)', clipPath: 'inset(0 0 100% 0)' },
          '10%': {
            transform: 'translate(-2px, 1px)',
            clipPath: 'inset(20% 0 60% 0)',
          },
          '20%': {
            transform: 'translate(2px, -1px)',
            clipPath: 'inset(50% 0 30% 0)',
          },
          '30%': {
            transform: 'translate(-1px, 2px)',
            clipPath: 'inset(80% 0 5% 0)',
          },
          '40%': { transform: 'translate(0)', clipPath: 'inset(0 0 100% 0)' },
          '100%': { transform: 'translate(0)', clipPath: 'inset(0 0 100% 0)' },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-8px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        glowCyan: 'glowCyan 2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        glitch: 'glitch 0.4s steps(1) forwards',
        bounce: 'bounce 1.5s infinite',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
      },
      boxShadow: {
        neonPurple:
          '0 0 10px #b026ff, 0 0 20px #b026ff, 0 0 40px rgba(176, 38, 255, 0.5)',
        neonCyan:
          '0 0 10px #00e5ff, 0 0 20px #00e5ff, 0 0 40px rgba(0, 229, 255, 0.5)',
        neonMagenta:
          '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px rgba(255, 0, 255, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
