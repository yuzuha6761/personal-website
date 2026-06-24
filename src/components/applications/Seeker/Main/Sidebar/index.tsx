import { useCallback, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AppIcon } from '~/components/icons/AppIcon'
import SystemGlassSurface from '~/components/SystemGlassSurface'
import { Scrollbar } from '~/components/ui-kit'
import { useWindowFocus } from '~/components/Window/FocusContext'
import { getRootFontSize } from '~/services/window'
import { resolveSeekerNewWindowPath } from '~/components/applications/Seeker/newWindowPath'
import { isItemActive, resolveItemPath } from './paths'
import { buildVisibleEntries, isItemVisible } from './location'
import { seekerIcons } from '~/components/applications/Seeker/icons'
import useSeekerGlobalStore from '~/components/applications/Seeker/store'
import { useMainWindow } from '../useMainWindow'
import type { SidebarItem } from '../types'

const DEFAULT_WIDTH_REM = 10.65
const MIN_WIDTH_REM = 9
const HIDE_AT_REM = 4
const MAIN_MIN_WIDTH_REM = 25
const TAGS_SECTION_ID = 'tags'

const sidebarItemClass = 'w-full h-[1.98rem] border-0 rounded-[.34rem] pr-[.25rem] py-0 bg-transparent [font:inherit] text-[.9rem] font-[560] leading-none cursor-default flex items-center text-left'
const sidebarIconClass = 'flex-[0_0_1.42rem] w-[1.1rem] h-[1.1rem] mr-[.3rem]'

interface NavItemProps {
  active: boolean
  depth: number
  focused: boolean
  item: SidebarItem
  onNavigate: (path: string) => void
  sidebarIconColorStyle: { color: string }
  sidebarTextClass: string
}

function NavItem(props: NavItemProps) {
  const { active, depth, focused, item, onNavigate, sidebarIconColorStyle, sidebarTextClass } = props
  const path = resolveItemPath(item.id)
  const depthClass = depth > 0 ? 'pl-[1.35rem]' : 'pl-[.3rem]'
  const className = `${sidebarItemClass} ${depthClass} ${sidebarTextClass}`
  const activeBackground = focused
    ? 'var(--seeker-sidebar-item-active-focused)'
    : 'var(--seeker-sidebar-item-active-unfocused)'
  const content = (
    <>
      <AppIcon className={sidebarIconClass} icon={seekerIcons[item.icon]} style={sidebarIconColorStyle} />
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
    </>
  )

  if (!path) {
    return <div className={className}>{content}</div>
  }

  return (
    <button
      className={className}
      onClick={() => onNavigate(path)}
      style={active ? { backgroundColor: activeBackground } : undefined}
      type="button"
    >
      {content}
    </button>
  )
}

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

interface SectionTitleProps {
  className: string
  collapsed: boolean
  sectionId: string
  title: string
  toggleCollapsed: (sectionId: string) => void
}

function SectionTitle({
  className,
  collapsed,
  sectionId,
  title,
  toggleCollapsed,
}: SectionTitleProps) {
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

interface CollapsibleItemsProps {
  children: React.ReactNode
  collapsed: boolean
}

function CollapsibleItems({ children, collapsed }: CollapsibleItemsProps) {
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

function resolveWidth(pointerRem: number, containerWidthRem: number) {
  if (pointerRem <= HIDE_AT_REM) {
    return { visible: false, widthRem: DEFAULT_WIDTH_REM }
  }

  const maxWidthRem = Math.max(0, containerWidthRem - MAIN_MIN_WIDTH_REM)
  const widthRem = Math.min(maxWidthRem, Math.max(MIN_WIDTH_REM, pointerRem))

  return { visible: true, widthRem }
}

function Sidebar({ containerRef }: SidebarProps) {
  const focused = useWindowFocus()?.focused ?? true
  const { windowState, navigateTo } = useMainWindow()
  const newWindowPathOption = useSeekerGlobalStore((state) => state.newWindowPathOption)
  const defaultTabPath = resolveSeekerNewWindowPath(newWindowPathOption)
  const activeTab = windowState?.tabs.find((tab) => tab.id === windowState.activeTabId)
  const currentPath = activeTab?.path ?? defaultTabPath
  const sidebarSections = useSeekerGlobalStore((state) => state.sidebarSections)
  const tagItems = useSeekerGlobalStore((state) => state.tagItems)
  const collapsedSidebarSectionIds = useSeekerGlobalStore((state) => state.collapsedSidebarSectionIds)
  const toggleSidebarSectionCollapsed = useSeekerGlobalStore((state) => state.toggleSidebarSectionCollapsed)
  const [widthRem, setWidthRem] = useState(DEFAULT_WIDTH_REM)
  const [visible, setVisible] = useState(true)
  const dragStateRef = useRef<{ pointerId: number } | null>(null)

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
  const showTagsSection = Boolean(tagSection?.items.some(isItemVisible) && tagItems.length > 0)

  const handleNavigate = useCallback((path: string) => {
    navigateTo(path)
  }, [navigateTo])

  const handleResizeMove = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return

    const rootFontSize = getRootFontSize()
    const containerRect = container.getBoundingClientRect()
    const containerWidthRem = containerRect.width / rootFontSize
    const pointerRem = (clientX - containerRect.left) / rootFontSize
    const next = resolveWidth(pointerRem, containerWidthRem)

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
      className="relative z-[30] flex h-full shrink-0 flex-col overflow-hidden"
      style={{ width: visible ? `${widthRem}rem` : 0 }}
    >
      <SystemGlassSurface style={{ zIndex: 0 }} />
      {visible ? (
        <HairlineVerticalStrip
          className="absolute top-0 right-0 z-[1] h-full"
          color={sidebarBorderColor}
        />
      ) : null}
      <div className="relative z-[1] h-[3.85rem] shrink-0" />
      <Scrollbar
        className="relative z-[1] min-h-0 flex-1"
        contentClassName="pt-0 pr-[.5rem] pb-[.9rem] pl-[.6rem]"
      >
        {sidebarSections.filter((section) => section.id !== TAGS_SECTION_ID).map((section) => {
          const visibleEntries = buildVisibleEntries(section.id, section.items)
          const collapsed = collapsedSidebarSectionIds.includes(section.id)

          if (visibleEntries.length === 0) return null

          return (
            <section className="mb-[1.08rem]" key={section.id}>
              {section.title && (
                <SectionTitle
                  className={`mb-[.25rem] ${sidebarTitleClass} text-[.78rem] font-700`}
                  collapsed={collapsed}
                  sectionId={section.id}
                  title={section.title}
                  toggleCollapsed={toggleSidebarSectionCollapsed}
                />
              )}
              <CollapsibleItems collapsed={collapsed}>
                {visibleEntries.map(({ item, depth }) => (
                  <NavItem
                    active={isItemActive(item.id, currentPath)}
                    depth={depth}
                    focused={focused}
                    item={item}
                    key={item.id}
                    onNavigate={handleNavigate}
                    sidebarIconColorStyle={sidebarIconColorStyle}
                    sidebarTextClass={sidebarTextClass}
                  />
                ))}
              </CollapsibleItems>
            </section>
          )
        })}

        {showTagsSection ? (
          <section className="mb-[1.08rem]">
            <SectionTitle
              className={`mb-[.34rem] ${sidebarTitleClass} text-[.74rem] font-700`}
              collapsed={collapsedSidebarSectionIds.includes(TAGS_SECTION_ID)}
              sectionId={TAGS_SECTION_ID}
              title={tagSection?.title ?? '标签'}
              toggleCollapsed={toggleSidebarSectionCollapsed}
            />
            <CollapsibleItems collapsed={collapsedSidebarSectionIds.includes(TAGS_SECTION_ID)}>
              {tagItems.map((tag) => (
                <div className={`${sidebarItemClass} pl-[.3rem] ${sidebarTextClass}`} key={tag.id}>
                  <span
                    className="flex-[0_0_.55rem] h-[.55rem] mr-[.58rem] ml-[.22rem] rounded-full"
                    style={{ backgroundColor: tag.color, opacity: focused ? 1 : 0.42 }}
                  />
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tag.label}</span>
                </div>
              ))}
            </CollapsibleItems>
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
