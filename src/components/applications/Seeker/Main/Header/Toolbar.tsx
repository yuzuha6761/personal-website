import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { LucideIcon } from 'lucide-react'
import ContextualMenu, { type ContextualMenuItem } from '~/components/ContextualMenu'
import { AppIcon } from '~/components/icons/AppIcon'
import { getRootFontSize } from '~/services/window'
import { Z_INDEX } from '~/constants/zIndex'
import { seekerIcons } from '~/components/applications/Seeker/icons'
import type { ViewMode } from '../types'

const TITLE_MIN_REM = 7.5
const ICON_SLOT_REM = 1.72
const ACTION_ICON_REM = 1.4
const ICON_GAP_REM = 0.48
const SEPARATOR_BLOCK_REM = 0.68
const VIEW_EXPANDED_REM = 7.75
const VIEW_COLLAPSED_REM = 2.95
const SEARCH_FIELD_REM = 11.5

const ALL_ACTIONS = ['group', 'share', 'tag', 'more'] as const
type ActionId = typeof ALL_ACTIONS[number]

const VIEW_MODES: { id: ViewMode; icon: LucideIcon; label: string }[] = [
  { id: 'icon', icon: seekerIcons.grid, label: '为图标' },
  { id: 'list', icon: seekerIcons.list, label: '为列表' },
  { id: 'column', icon: seekerIcons.columns, label: '为分栏' },
  { id: 'gallery', icon: seekerIcons.gallery, label: '为画廊' },
]

const ACTION_ITEMS: Record<ActionId, { icon: LucideIcon; label: string }> = {
  group: { icon: seekerIcons.group, label: '使用群组' },
  share: { icon: seekerIcons.share, label: '共享...' },
  tag: { icon: seekerIcons.tag, label: '标签...' },
  more: { icon: seekerIcons.more, label: '更多' },
}

interface ToolbarLayout {
  showOverflow: boolean
  searchPresentation: 'field' | 'icon'
  viewInOverflow: boolean
  viewPresentation: 'collapsed' | 'expanded' | 'hidden'
  visibleActionCount: number
}

interface ToolbarProps {
  availableWidth: number | null
  focused: boolean
}

function measureLayoutWidthRem(layout: ToolbarLayout) {
  let width = 0

  const add = (segmentWidth: number) => {
    if (width > 0) width += ICON_GAP_REM
    width += segmentWidth
  }

  if (layout.viewPresentation === 'expanded') add(VIEW_EXPANDED_REM)
  else if (layout.viewPresentation === 'collapsed') add(VIEW_COLLAPSED_REM)

  if (layout.visibleActionCount > 0) {
    if (layout.viewPresentation !== 'hidden') add(SEPARATOR_BLOCK_REM)
    for (let index = 0; index < layout.visibleActionCount; index += 1) add(ACTION_ICON_REM)
  }

  if (layout.showOverflow) add(ICON_SLOT_REM)
  add(layout.searchPresentation === 'field' ? SEARCH_FIELD_REM : ACTION_ICON_REM)

  return width
}

function resolveToolbarLayout(availableRem: number): ToolbarLayout {
  const candidates: ToolbarLayout[] = [
    { viewPresentation: 'expanded', visibleActionCount: 4, showOverflow: false, searchPresentation: 'field', viewInOverflow: false },
    { viewPresentation: 'expanded', visibleActionCount: 4, showOverflow: false, searchPresentation: 'icon', viewInOverflow: false },
    { viewPresentation: 'collapsed', visibleActionCount: 4, showOverflow: false, searchPresentation: 'icon', viewInOverflow: false },
    ...([3, 2, 1, 0] as const).map((visibleActionCount) => ({
      viewPresentation: 'collapsed' as const,
      visibleActionCount,
      showOverflow: visibleActionCount < 4,
      searchPresentation: 'icon' as const,
      viewInOverflow: false,
    })),
    { viewPresentation: 'hidden', visibleActionCount: 0, showOverflow: true, searchPresentation: 'icon', viewInOverflow: true },
  ]

  for (const layout of candidates) {
    if (measureLayoutWidthRem(layout) <= availableRem) return layout
  }

  return candidates[candidates.length - 1]
}

function Toolbar(props: ToolbarProps) {
  const { availableWidth, focused } = props
  const viewMenuId = useId()
  const overflowMenuId = useId()
  const viewTriggerRef = useRef<HTMLDivElement>(null)
  const overflowTriggerRef = useRef<HTMLDivElement>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [hoveredViewMode, setHoveredViewMode] = useState<ViewMode | null>(null)
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false)
  const [viewMenuPosition, setViewMenuPosition] = useState({ x: 0, y: 0 })
  const [overflowMenuPosition, setOverflowMenuPosition] = useState({ x: 0, y: 0 })

  const toolbarIconClass = 'w-[1.4rem] h-[1.4rem]'
  const toolbarIconColorClass = focused ? 'text-#737373' : 'text-#adadad'
  const iconSlotClass = 'w-[1.72rem] h-[1.72rem] rounded-[.36rem] flex items-center justify-center cursor-default'
  const separatorColorClass = focused ? 'bg-#dadada' : 'bg-#e2e2e2'
  const viewGroupShellClass = focused ? 'bg-#e8e8e8' : 'bg-#e4e4e4'
  const viewHoverClass = focused ? 'hover:bg-#dcdcdc' : 'hover:bg-#d8d8d8'
  const viewActiveClass = focused ? 'bg-#c8c8c8' : 'bg-#cfcfcf'
  const viewInnerSeparatorClass = focused ? 'bg-#cbcbcb' : 'bg-#d5d5d5'
  const searchFieldClass = focused
    ? 'border-#d5d5d5 bg-#ffffff85 text-#444 placeholder:text-#8b8b8b'
    : 'border-#dddddd bg-#f7f7f785 text-#999 placeholder:text-#ababab'

  const availableRem = (availableWidth ?? Number.POSITIVE_INFINITY) / getRootFontSize()
  const layout = useMemo(() => resolveToolbarLayout(availableRem), [availableRem])

  const visibleActions = ALL_ACTIONS.slice(0, layout.visibleActionCount)
  const overflowActions = ALL_ACTIONS.slice(layout.visibleActionCount)

  const viewMenuItems = useMemo<ContextualMenuItem[]>(() => (
    VIEW_MODES.map((mode) => ({
      id: mode.id,
      label: mode.label,
      checkable: true,
      checked: viewMode === mode.id,
    }))
  ), [viewMode])

  const overflowMenuItems = useMemo<ContextualMenuItem[]>(() => {
    const items: ContextualMenuItem[] = []

    if (layout.viewInOverflow) {
      items.push(...VIEW_MODES.map((mode) => ({
        id: `view-${mode.id}`,
        label: mode.label,
        checkable: true,
        checked: viewMode === mode.id,
        icon: mode.icon,
      })))

      if (overflowActions.length > 0) {
        items.push({ id: 'overflow-divider', type: 'separator' })
      }
    }

    items.push(...overflowActions.map((actionId) => ({
      id: actionId,
      label: ACTION_ITEMS[actionId].label,
      icon: ACTION_ITEMS[actionId].icon,
    })))

    return items
  }, [layout.viewInOverflow, overflowActions, viewMode])

  const openViewMenu = useCallback(() => {
    const rect = viewTriggerRef.current?.getBoundingClientRect()
    if (!rect) return

    setViewMenuPosition({ x: rect.left, y: rect.bottom + 4 })
    setViewMenuOpen(true)
  }, [])

  const openOverflowMenu = useCallback(() => {
    const rect = overflowTriggerRef.current?.getBoundingClientRect()
    if (!rect) return

    setOverflowMenuPosition({ x: rect.left, y: rect.bottom + 4 })
    setOverflowMenuOpen(true)
  }, [])

  const getViewSlotClass = (mode: ViewMode) => {
    if (viewMode === mode) return `${iconSlotClass} ${viewActiveClass}`
    if (hoveredViewMode === mode) return `${iconSlotClass} ${focused ? 'bg-#dcdcdc' : 'bg-#d8d8d8'}`
    return `${iconSlotClass} ${viewHoverClass}`
  }

  const renderViewGroupExpanded = () => (
    <div className={`flex items-center gap-[.1rem] rounded-full px-[.18rem] py-[.12rem] ${viewGroupShellClass}`}>
      {VIEW_MODES.slice(0, 3).map((mode) => (
        <div
          className={getViewSlotClass(mode.id)}
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          onMouseEnter={() => setHoveredViewMode(mode.id)}
          onMouseLeave={() => setHoveredViewMode((current) => (current === mode.id ? null : current))}
        >
          <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={mode.icon} />
        </div>
      ))}
      <span className={`w-px h-[1.25rem] ${viewInnerSeparatorClass}`} />
      <div
        className={getViewSlotClass('gallery')}
        onClick={() => setViewMode('gallery')}
        onMouseEnter={() => setHoveredViewMode('gallery')}
        onMouseLeave={() => setHoveredViewMode((current) => (current === 'gallery' ? null : current))}
      >
        <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.gallery} />
      </div>
    </div>
  )

  const renderViewGroupCollapsed = () => (
    <div
      className="flex h-[1.72rem] cursor-default items-center gap-[.18rem] rounded-[.36rem] px-[.12rem]"
      onClick={openViewMenu}
      ref={viewTriggerRef}
    >
      <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.list} />
      <AppIcon className="h-[.72rem] w-[.72rem] text-#888" icon={seekerIcons.chevronsUpDown} strokeWidth={2.4} />
    </div>
  )

  const renderSearch = () => {
    if (layout.searchPresentation === 'field') {
      return (
        <label className={`box-border h-[1.72rem] w-[11.5rem] rounded-[.42rem] border px-[.5rem] flex items-center gap-[.34rem] ${searchFieldClass}`}>
          <AppIcon className="w-[.95rem] h-[.95rem] shrink-0 text-current opacity-72" icon={seekerIcons.search} />
          <input
            aria-label="搜索"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[.82rem] leading-none outline-none [font:inherit] placeholder:text-inherit"
            placeholder="搜索"
            type="search"
          />
        </label>
      )
    }

    return <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.search} />
  }

  return (
    <div className="flex min-w-0 items-center justify-end gap-[.48rem] overflow-hidden">
      {layout.viewPresentation === 'expanded' && renderViewGroupExpanded()}
      {layout.viewPresentation === 'collapsed' && renderViewGroupCollapsed()}

      {layout.viewPresentation !== 'hidden' && layout.visibleActionCount > 0 && (
        <span className={`w-px h-[1.45rem] ${separatorColorClass}`} />
      )}

      {visibleActions.map((actionId) => (
        <AppIcon
          className={`${toolbarIconClass} ${toolbarIconColorClass}`}
          icon={ACTION_ITEMS[actionId].icon}
          key={actionId}
        />
      ))}

      {layout.showOverflow && (
        <div
          className={`${iconSlotClass} cursor-default`}
          onClick={openOverflowMenu}
          ref={overflowTriggerRef}
        >
          <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.chevronsRight} strokeWidth={2.2} />
        </div>
      )}

      {renderSearch()}

      <ContextualMenu
        id={viewMenuId}
        items={viewMenuItems}
        open={viewMenuOpen}
        position={viewMenuPosition}
        zIndex={Z_INDEX.IN_APP_OVERLAY}
        onClose={() => setViewMenuOpen(false)}
        onSelect={({ item }) => setViewMode(item.id as ViewMode)}
      />

      <ContextualMenu
        id={overflowMenuId}
        items={overflowMenuItems}
        open={overflowMenuOpen}
        position={overflowMenuPosition}
        zIndex={Z_INDEX.IN_APP_OVERLAY}
        onClose={() => setOverflowMenuOpen(false)}
        onSelect={({ item }) => {
          if (item.id.startsWith('view-')) {
            setViewMode(item.id.replace('view-', '') as ViewMode)
          }
        }}
      />
    </div>
  )
}

interface ToolbarAreaProps {
  focused: boolean
  headerRowRef: RefObject<HTMLDivElement | null>
  leadingRef: RefObject<HTMLDivElement | null>
}

export function ToolbarArea(props: ToolbarAreaProps) {
  const { focused, headerRowRef, leadingRef } = props
  const [availableWidth, setAvailableWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    const headerRow = headerRowRef.current
    const leading = leadingRef.current
    if (!headerRow || !leading) return

    const updateAvailableWidth = () => {
      const styles = getComputedStyle(headerRow)
      const paddingX = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight)
      const titleMinWidth = getRootFontSize() * TITLE_MIN_REM
      const budgetWidth = headerRow.clientWidth - paddingX - leading.offsetWidth - titleMinWidth

      setAvailableWidth(Math.max(0, budgetWidth))
    }

    updateAvailableWidth()

    const resizeObserver = new ResizeObserver(updateAvailableWidth)
    resizeObserver.observe(headerRow)
    resizeObserver.observe(leading)

    return () => resizeObserver.disconnect()
  }, [headerRowRef, leadingRef])

  return <Toolbar availableWidth={availableWidth} focused={focused} />
}

export default Toolbar
