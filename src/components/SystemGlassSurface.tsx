import type { CSSProperties } from 'react'

export const SYSTEM_GLASS_BACKDROP_FILTER = 'blur(22px) saturate(1.8)'

interface SystemGlassSurfaceProps {
  className?: string
  clipPath?: CSSProperties['clipPath']
  style?: CSSProperties
}

function SystemGlassSurface(props: SystemGlassSurfaceProps) {
  const { className = '', clipPath, style } = props

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        WebkitBackdropFilter: SYSTEM_GLASS_BACKDROP_FILTER,
        backdropFilter: SYSTEM_GLASS_BACKDROP_FILTER,
        backgroundColor: 'var(--system-surface-menu)',
        clipPath,
        ...style,
      }}
    />
  )
}

export default SystemGlassSurface
