import { useState } from 'react'

type NeonColor = 'purple' | 'cyan' | 'magenta'

interface NeonBorderProps {
  children: React.ReactNode
  className?: string
  color?: NeonColor
}

const colorMap: Record<NeonColor, { border: string; shadow: string; hoverShadow: string }> = {
  purple: {
    border: '#b026ff',
    shadow: '0 0 8px rgba(176, 38, 255, 0.4), 0 0 16px rgba(176, 38, 255, 0.2), inset 0 0 8px rgba(176, 38, 255, 0.05)',
    hoverShadow: '0 0 16px rgba(176, 38, 255, 0.7), 0 0 32px rgba(176, 38, 255, 0.4), inset 0 0 16px rgba(176, 38, 255, 0.1)',
  },
  cyan: {
    border: '#00e5ff',
    shadow: '0 0 8px rgba(0, 229, 255, 0.4), 0 0 16px rgba(0, 229, 255, 0.2), inset 0 0 8px rgba(0, 229, 255, 0.05)',
    hoverShadow: '0 0 16px rgba(0, 229, 255, 0.7), 0 0 32px rgba(0, 229, 255, 0.4), inset 0 0 16px rgba(0, 229, 255, 0.1)',
  },
  magenta: {
    border: '#ff00ff',
    shadow: '0 0 8px rgba(255, 0, 255, 0.4), 0 0 16px rgba(255, 0, 255, 0.2), inset 0 0 8px rgba(255, 0, 255, 0.05)',
    hoverShadow: '0 0 16px rgba(255, 0, 255, 0.7), 0 0 32px rgba(255, 0, 255, 0.4), inset 0 0 16px rgba(255, 0, 255, 0.1)',
  },
}

export default function NeonBorder({
  children,
  className = '',
  color = 'purple',
}: NeonBorderProps) {
  const [hovered, setHovered] = useState(false)
  const { border, shadow, hoverShadow } = colorMap[color]

  return (
    <div
      className={`rounded-lg bg-dark-card transition-all duration-300 ${className}`}
      style={{
        border: `1px solid ${border}`,
        boxShadow: hovered ? hoverShadow : shadow,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}
