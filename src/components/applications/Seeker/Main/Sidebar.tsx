import { useCallback, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AppIcon } from '~/components/icons/AppIcon'
import SystemGlassSurface from '~/components/SystemGlassSurface'
import { Scrollbar } from '~/components/ui-kit'
import { useWindowFocus } from '~/components/Window/FocusContext'
import { getRootFontSize } from '~/services/window'
import { seekerIcons } from '../icons'
import useSeekerGlobalStore from '../store'

const DEFAULT_WIDTH_REM = 10.65
const MIN_WIDTH_REM = 9
const HIDE_AT_REM = 4
const MAIN_MIN_WIDTH_REM = 25
const TAGS_SECTION_ID = 'tags'

const sidebarItemClass = 'w-full h-[1.98rem] border-0 rounded-[.34rem] p-0 bg-transparent [font:inherit] text-[.9rem] font-[560] leading-none cursor-default flex items-center'
const sidebarIconClass = 'flex-[0_0_1.42rem] w-[1.1rem] h-[1.1rem] mr-[.3rem]'

interface HairlineStripProps {
  className?: string
  color: string
}

function HairlineVerticalStrip({ className = '', color }: HairlineStripProps) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none ${className}`}
      preserveAspectRatio="none"
      viewBox="0 0 1 1"
      width="1"
    >
      <line
        stroke={color}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        x1="0.5"
        x2="0.5"
        y1="0"
        y2="1"
      />
    </svg>
  )
}

interface SidebarSectionTitleProps {
  className: string
  collapsed: boolean
  sectionId: string
  title: string
  toggleCollapsed: (sectionId: string) => void
}

function SidebarSectionTitle({
  className,
  collapsed,
  sectionId,
  title,
  toggleCollapsed,
}: SidebarSectionTitleProps) {
  return (
    <div className={`group flex items-center justify-between ${className}`}>
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{title}</span>
      <button
        aria-expanded={!collapsed}
        aria-label={`${collapsed ? '展开' : '收起'}${title}`}
        className="ml-[.35rem] flex h-[1.25rem] w-[1.25rem] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-current opacity-0 transition-opacity duration-150 group-hover:opacity-80 hover:opacity-100 focus-visible:opacity-100"
        onClick={() => toggleCollapsed(sectionId)}
        type="button"
      >
        <AppIcon
          className={`h-[1rem] w-[1rem] transition-transform duration-180 ease-out ${collapsed ? '' : 'rotate-90'}`}
          icon={seekerIcons.chevronRight}
          strokeWidth={2.4}
        />
      </button>
    </div>
  )
}

interface CollapsibleSidebarItemsProps {
  children: React.ReactNode
  collapsed: boolean
}

function CollapsibleSidebarItems({ children, collapsed }: CollapsibleSidebarItemsProps) {
  return (
    <div
      className="grid overflow-hidden"
      style={{
        gridTemplateRows: collapsed ? '0fr' : '1fr',
        opacity: collapsed ? 0 : 1,
        transition: 'grid-template-rows 180ms ease, opacity 140ms ease',
      }}
    >
      <div className="min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

interface SidebarProps {
  containerRef: RefObject<HTMLDivElement | null>
}

function resolveSidebarWidth(pointerRem: number, containerWidthRem: number) {
  if (pointerRem <= HIDE_AT_REM) {
    return { visible: false, widthRem: DEFAULT_WIDTH_REM }
  }

  const maxWidthRem = Math.max(0, containerWidthRem - MAIN_MIN_WIDTH_REM)
  const widthRem = Math.min(maxWidthRem, Math.max(MIN_WIDTH_REM, pointerRem))

  return { visible: true, widthRem }
}

function isSidebarItemVisible(item: { checked?: boolean, indeterminate?: boolean }) {
  return Boolean(item.checked || item.indeterminate)
}

function Sidebar({ containerRef }: SidebarProps) {
  const focused = useWindowFocus()?.focused ?? true
  const sidebarSections = useSeekerGlobalStore((state) => state.sidebarSections)
  const tagItems = useSeekerGlobalStore((state) => state.tagItems)
  const collapsedSidebarSectionIds = useSeekerGlobalStore((state) => state.collapsedSidebarSectionIds)
  const toggleSidebarSectionCollapsed = useSeekerGlobalStore((state) => state.toggleSidebarSectionCollapsed)
  const [widthRem, setWidthRem] = useState(DEFAULT_WIDTH_REM)
  const [visible, setVisible] = useState(true)
  const dragStateRef = useRef<{ pointerId: number } | null>(null)

  const sidebarBgClass = focused
    ? ''
    : 'bg-[var(--seeker-sidebar-unfocused)]'
  const sidebarBorderColor = 'var(--seeker-sidebar-border)'
  const sidebarTitleClass = focused
    ? 'text-[var(--seeker-sidebar-title-focused)]'
    : 'text-[var(--seeker-sidebar-title-unfocused)]'
  const sidebarTextClass = focused
    ? 'text-[var(--seeker-sidebar-label-focused)]'
    : 'text-[var(--seeker-sidebar-label-unfocused)]'
  const sidebarIconColorStyle = {
    color: focused
      ? 'var(--system-color-solid, #c13584)'
      : 'var(--system-sidebar-icon-color-muted, #ffb3da)',
  }
  const tagSection = sidebarSections.find((section) => section.id === TAGS_SECTION_ID)
  const showTagsSection = Boolean(tagSection?.items.some(isSidebarItemVisible) && tagItems.length > 0)

  const handleResizeMove = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return

    const rootFontSize = getRootFontSize()
    const containerRect = container.getBoundingClientRect()
    const containerWidthRem = containerRect.width / rootFontSize
    const pointerRem = (clientX - containerRect.left) / rootFontSize
    const next = resolveSidebarWidth(pointerRem, containerWidthRem)

    setVisible(next.visible)
    if (next.visible) setWidthRem(next.widthRem)
  }, [containerRef])

  const handleResizeEnd = useCallback(() => {
    dragStateRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const handleResizeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    dragStateRef.current = { pointerId: event.pointerId }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    handleResizeMove(event.clientX)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (dragStateRef.current?.pointerId !== moveEvent.pointerId) return
      handleResizeMove(moveEvent.clientX)
    }

    const handlePointerEnd = (endEvent: PointerEvent) => {
      if (dragStateRef.current?.pointerId !== endEvent.pointerId) return

      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerEnd)
      document.removeEventListener('pointercancel', handlePointerEnd)
      handleResizeEnd()
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerEnd)
    document.addEventListener('pointercancel', handlePointerEnd)
  }, [handleResizeEnd, handleResizeMove])

  return (
    <aside
      className={`relative z-[30] flex h-full shrink-0 flex-col overflow-hidden ${sidebarBgClass}`}
      style={{ width: visible ? `${widthRem}rem` : 0 }}
    >
      {focused ? <SystemGlassSurface style={{ zIndex: 0 }} /> : null}
      {visible ? (
        <HairlineVerticalStrip
          className="absolute top-0 right-0 z-[1] h-full"
          color={sidebarBorderColor}
        />
      ) : null}
      <div className="relative z-[1] h-[3.85rem] shrink-0" />
      <Scrollbar
        className="relative z-[1] min-h-0 flex-1"
        contentClassName="pt-0 pr-[.75rem] pb-[.9rem] pl-[.9rem]"
      >
        {sidebarSections.filter((section) => section.id !== TAGS_SECTION_ID).map((section) => {
          const visibleItems = section.items.filter(isSidebarItemVisible)
          const collapsed = collapsedSidebarSectionIds.includes(section.id)

          if (visibleItems.length === 0) return null

          return (
            <section className="mb-[1.08rem]" key={section.id}>
              {section.title && (
                <SidebarSectionTitle
                  className={`mb-[.25rem] ${sidebarTitleClass} text-[.78rem] font-700`}
                  collapsed={collapsed}
                  sectionId={section.id}
                  title={section.title}
                  toggleCollapsed={toggleSidebarSectionCollapsed}
                />
              )}
              <CollapsibleSidebarItems collapsed={collapsed}>
                {visibleItems.map((item) => (
                  <div className={`${sidebarItemClass} ${sidebarTextClass}`} key={item.id}>
                    <AppIcon className={sidebarIconClass} icon={seekerIcons[item.icon]} style={sidebarIconColorStyle} />
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
                  </div>
                ))}
              </CollapsibleSidebarItems>
            </section>
          )
        })}

        {showTagsSection ? (
          <section className="mb-[1.08rem]">
            <SidebarSectionTitle
              className={`mb-[.34rem] ${sidebarTitleClass} text-[.74rem] font-700`}
              collapsed={collapsedSidebarSectionIds.includes(TAGS_SECTION_ID)}
              sectionId={TAGS_SECTION_ID}
              title={tagSection?.title ?? '标签'}
              toggleCollapsed={toggleSidebarSectionCollapsed}
            />
            <CollapsibleSidebarItems collapsed={collapsedSidebarSectionIds.includes(TAGS_SECTION_ID)}>
              {tagItems.map((tag) => (
                <div className={`${sidebarItemClass} ${sidebarTextClass}`} key={tag.id}>
                  <span
                    className="flex-[0_0_.55rem] h-[.55rem] mr-[.58rem] ml-[.22rem] rounded-full"
                    style={{ backgroundColor: tag.color, opacity: focused ? 1 : 0.42 }}
                  />
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tag.label}</span>
                </div>
              ))}
            </CollapsibleSidebarItems>
          </section>
        ) : null}
      </Scrollbar>

      {visible && (
        <div
          aria-orientation="vertical"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(widthRem)}
          className="absolute top-0 right-0 z-1 h-full w-[.45rem] translate-x-1/2 cursor-col-resize touch-none"
          onPointerDown={handleResizeStart}
          role="separator"
        />
      )}
    </aside>
  )
}

export default Sidebar
