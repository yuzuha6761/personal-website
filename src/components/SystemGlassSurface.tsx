import type { CSSProperties } from 'react'
import { useWindowFocus } from './Window/FocusContext'
import './SystemGlassSurface.theme.scss'

export const SYSTEM_GLASS_BACKDROP_FILTER = 'blur(22px) saturate(1.8)'

interface SystemGlassSurfaceProps {
  className?: string
  clipPath?: CSSProperties['clipPath']
  /** Skip window focus check (e.g. portaled menus). */
  ignoreWindowFocus?: boolean
  style?: CSSProperties
}

function SystemGlassSurface(props: SystemGlassSurfaceProps) {
  const { className = '', clipPath, ignoreWindowFocus = false, style } = props
  const focused = useWindowFocus()?.focused ?? true
  const glassActive = ignoreWindowFocus || focused

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        ...(glassActive
          ? {
              WebkitBackdropFilter: SYSTEM_GLASS_BACKDROP_FILTER,
              backdropFilter: SYSTEM_GLASS_BACKDROP_FILTER,
              backgroundColor: 'var(--glass-surface)',
            }
          : { backgroundColor: 'var(--glass-surface-unfocused)' }),
        clipPath,
        ...style,
      }}
    />
  )
}

export default SystemGlassSurface
