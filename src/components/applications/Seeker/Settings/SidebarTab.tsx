import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import SystemGlassSurface from '~/components/SystemGlassSurface'
import { getRootFontSize } from '~/services/window'
import { AppIcon } from '~/components/icons/AppIcon'
import { seekerIcons } from '~/components/applications/Seeker/icons'
import { Checkbox } from '~/components/ui-kit'
import useSeekerGlobalStore from '~/components/applications/Seeker/store'

const PANEL_BORDER_COLOR = '#d2d2d2'
const PANEL_HOLE_RADIUS_REM = 0.42

interface PanelLayout {
  clipPath?: string
  panelWidth: number
  panelHeight: number
  panelRadius: number
}

function GlassPanelBorder(props: { height: number; radius: number; width: number }) {
  const { width, height, radius } = props
  if (width <= 0 || height <= 0) return null

  const rx = Math.min(radius, width / 2, height / 2)

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
    >
      <rect
        fill="none"
        height={height - 1}
        rx={rx}
        ry={rx}
        stroke={PANEL_BORDER_COLOR}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        width={width - 1}
        x="0.5"
        y="0.5"
      />
    </svg>
  )
}

function roundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
  const rx = Math.min(radius, width / 2, height / 2)

  return [
    `M ${x + rx} ${y}`,
    `H ${x + width - rx}`,
    `Q ${x + width} ${y} ${x + width} ${y + rx}`,
    `V ${y + height - rx}`,
    `Q ${x + width} ${y + height} ${x + width - rx} ${y + height}`,
    `H ${x + rx}`,
    `Q ${x} ${y + height} ${x} ${y + height - rx}`,
    `V ${y + rx}`,
    `Q ${x} ${y} ${x + rx} ${y}`,
    'Z',
  ].join(' ')
}

function buildHoleClipPath(
  containerWidth: number,
  containerHeight: number,
  hole: { x: number; y: number; width: number; height: number; radius: number },
) {
  const outer = `M 0 0 H ${containerWidth} V ${containerHeight} H 0 Z`
  const inner = roundedRectPath(hole.x, hole.y, hole.width, hole.height, hole.radius)
  return `path(evenodd, '${outer} ${inner}')`
}

function SidebarTab() {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [panelLayout, setPanelLayout] = useState<PanelLayout>({
    panelWidth: 0,
    panelHeight: 0,
    panelRadius: 0,
  })
  const sections = useSeekerGlobalStore((state) => state.sidebarSections)
  const setSidebarItemChecked = useSeekerGlobalStore((state) => state.setSidebarItemChecked)

  const updateClipPath = useCallback(() => {
    const container = containerRef.current
    const panel = panelRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const panelRect = panel?.getBoundingClientRect()
    const holeRadius = PANEL_HOLE_RADIUS_REM * getRootFontSize()
    const holeX = panelRect ? panelRect.left - containerRect.left : 0
    const holeY = panelRect ? panelRect.top - containerRect.top : 0
    const holeWidth = panelRect?.width ?? 0
    const holeHeight = panelRect?.height ?? 0

    setPanelLayout({
      clipPath: buildHoleClipPath(containerRect.width, containerRect.height, {
        x: holeX,
        y: holeY,
        width: holeWidth,
        height: holeHeight,
        radius: holeRadius,
      }),
      panelWidth: holeWidth,
      panelHeight: holeHeight,
      panelRadius: holeRadius,
    })
  }, [])

  useLayoutEffect(() => {
    updateClipPath()

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(updateClipPath)
    observer.observe(container)

    const panel = panelRef.current
    if (panel) observer.observe(panel)

    return () => observer.disconnect()
  }, [updateClipPath, sections])

  return (
    <div
      ref={containerRef}
      className="relative px-[1.35rem] py-[1rem] text-[.84rem] text-[var(--settings-scene-text,#2f2f2f)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[var(--settings-scene-content-bg)]"
        style={panelLayout.clipPath ? { clipPath: panelLayout.clipPath, WebkitClipPath: panelLayout.clipPath } : undefined}
      />
      <div className="relative z-[1]">
        <div className="mb-[.55rem] font-600">在边栏显示这些项目：</div>

        <div
          ref={panelRef}
          className="relative overflow-hidden rounded-[.42rem]"
        >
          <SystemGlassSurface className="rounded-[.42rem]" style={{ zIndex: 0 }} />
          <div className="relative z-[1] px-[.72rem] py-[.55rem]">
            {sections.map((section) => (
              <section className="mb-[.55rem] last:mb-0" key={section.id}>
                <div className="mb-[.25rem] text-[.76rem] font-700 text-[var(--settings-scene-muted-text,#8a8a8a)]">{section.title}</div>
                {section.items.map((item) => (
                  <div className="flex min-h-[1.72rem] min-w-0 items-center" key={item.id}>
                    <Checkbox
                      checked={item.checked}
                      indeterminate={item.indeterminate}
                      label={
                        <span className="flex min-w-0 items-center gap-[.45rem]">
                          <AppIcon className="w-[.95rem] h-[.95rem] shrink-0 text-[var(--settings-scene-icon,#8f8f8f)]" icon={seekerIcons[item.icon]} strokeWidth={1.75} />
                          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
                        </span>
                      }
                      onChange={(checked) => setSidebarItemChecked(section.id, item.id, checked)}
                    />
                  </div>
                ))}
              </section>
            ))}
          </div>
          <GlassPanelBorder
            height={panelLayout.panelHeight}
            radius={panelLayout.panelRadius}
            width={panelLayout.panelWidth}
          />
        </div>
      </div>
    </div>
  )
}

export default SidebarTab
