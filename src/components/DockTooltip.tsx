import type { CSSProperties } from 'react'
import styles from './DockTooltip.module.scss'
import {
  DOCK_TOOLTIP_PANEL_RADIUS_REM,
  getGlassPanelArrowPadding,
  getGlassPanelClipPath,
  getGlassPanelPath,
  type GlassPanelArrowEdge,
} from './glassPanelPath'
import SystemGlassSurface from './SystemGlassSurface'

interface DockTooltipProps {
  arrowEdge: GlassPanelArrowEdge
  className?: string
  label: string
}

function DockTooltip(props: DockTooltipProps) {
  const { arrowEdge, className = '', label } = props
  const panelRef = useRef<HTMLDivElement>(null)
  const [clipSize, setClipSize] = useState<{ width: number; height: number }>()

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const updateSize = () => {
      const rect = panel.getBoundingClientRect()
      setClipSize((currentSize) => {
        if (
          currentSize
          && Math.abs(currentSize.width - rect.width) < 0.5
          && Math.abs(currentSize.height - rect.height) < 0.5
        ) {
          return currentSize
        }

        return { width: rect.width, height: rect.height }
      })
    }

    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(panel)

    return () => resizeObserver.disconnect()
  }, [label])

  const arrowOffset = clipSize
    ? arrowEdge === 'bottom'
      ? clipSize.width / 2
      : clipSize.height / 2
    : undefined
  const panelPath = getGlassPanelPath(clipSize, arrowEdge, arrowOffset, DOCK_TOOLTIP_PANEL_RADIUS_REM)
  const panelClipPath = getGlassPanelClipPath(clipSize, arrowEdge, arrowOffset, DOCK_TOOLTIP_PANEL_RADIUS_REM)
  const panelArrowPadding = getGlassPanelArrowPadding(arrowEdge)

  return (
    <div
      className={`${styles.panel} ${className}`}
      ref={panelRef}
    >
      {panelPath && clipSize && (
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={clipSize.width}
          height={clipSize.height}
          viewBox={`0 0 ${clipSize.width} ${clipSize.height}`}
          style={{ zIndex: 0 }}
        >
          <path
            d={panelPath}
            fill="none"
            stroke="rgba(0, 0, 0, .12)"
            strokeWidth="18"
            className={styles.shadow}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={panelPath}
            fill="none"
            stroke="rgba(0, 0, 0, .08)"
            strokeWidth="5"
            className={styles['shadow-tight']}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <SystemGlassSurface
        ignoreWindowFocus
        clipPath={panelClipPath}
        style={{ zIndex: 1 }}
      />
      <div
        className={styles.content}
        style={{
          ...panelArrowPadding,
        } satisfies CSSProperties}
      >
        <div className={styles.label}>
          {label}
        </div>
      </div>
      {panelPath && clipSize && (
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={clipSize.width}
          height={clipSize.height}
          viewBox={`0 0 ${clipSize.width} ${clipSize.height}`}
          style={{ zIndex: 2 }}
        >
          <path
            d={panelPath}
            fill="none"
            stroke="var(--dock-tooltip-border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  )
}

export default DockTooltip
