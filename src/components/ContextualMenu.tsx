import type { LucideIcon } from 'lucide-react'
import { Check, ChevronRight, Globe } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DockPositionEnum } from '~enums'
import { AppIcon } from './icons/AppIcon'
import SystemGlassSurface from './SystemGlassSurface'
import useDockSettingStore from '../stores/settings/dock'

export interface ContextualMenuPosition {
  x: number
  y: number
}

export interface ContextualMenuAnchor extends ContextualMenuPosition {
  side: 'bottom' | 'left' | 'right'
}

export interface ContextualMenuActionItem {
  id: string
  label: string
  checked?: boolean
  checkable?: boolean
  color?: string
  disabled?: boolean
  icon?: LucideIcon
  iconScale?: number
  shortcut?: string
  children?: ContextualMenuItem[]
}

export interface ContextualMenuDividerItem {
  id: string
  type: 'separator'
}

export interface ContextualMenuSearchItem {
  id: string
  type: 'search'
  placeholder: string
}

export interface ContextualMenuColorTagsItem {
  colors: string[]
  id: string
  type: 'color-tags'
}

export type ContextualMenuItem =
  | ContextualMenuActionItem
  | ContextualMenuColorTagsItem
  | ContextualMenuDividerItem
  | ContextualMenuSearchItem

export interface ContextualMenuSelectEvent {
  item: ContextualMenuActionItem
  path: ContextualMenuActionItem[]
}

interface ContextualMenuProps {
  anchor?: ContextualMenuAnchor
  id?: string
  items: ContextualMenuItem[]
  open: boolean
  position: ContextualMenuPosition
  zIndex?: number
  onClose?: () => void
  onSelect?: (event: ContextualMenuSelectEvent) => void
}

interface ContextualMenuPanelProps {
  arrowEdge?: MenuArrowEdge
  arrowOffset?: number
  availableBottom: number
  closing: boolean
  items: ContextualMenuItem[]
  path: ContextualMenuActionItem[]
  selectedHighlightVisible: boolean
  selectedPathKey: string | null
  zIndex: number
  pointerDownStartedInsideMenuRef: React.RefObject<boolean>
  pointerReleaseSelectArmedRef: React.RefObject<boolean>
  onClose?: () => void
  onSelectItem: (event: ContextualMenuSelectEvent) => void
  onSubmenuItemHoverChange?: (hovered: boolean) => void
}

interface SubmenuPlacement {
  anchorLeft: number
  anchorRight: number
  anchorTop: number
  preferredSide: 'left' | 'right'
  x: number
  y: number
}

interface ContextualSubmenuProps {
  availableBottom: number
  children: ReactNode
  placement: SubmenuPlacement
  zIndex: number
}

type MenuArrowEdge = 'bottom' | 'left' | 'right'

const VIEWPORT_GAP = 8
const SUBMENU_OVERLAP_REM = 0.35
const SUBMENU_DEFAULT_TOP_REM = -0.45
const MENU_ROW_HEIGHT_REM = 1.55
const MENU_PANEL_VERTICAL_PADDING_REM = 0.9
const MENU_SEPARATOR_BLOCK_HEIGHT_REM = 0.77
const DOCK_EDGE_GAP_REM = 0.4
const SELECT_HIGHLIGHT_RESTORE_DELAY = 50
const SELECT_FADE_OUT_DURATION = 200
const CONTEXTUAL_MENU_OPEN_EVENT = 'contextual-menu-open'
const ANCHORED_MENU_GAP = 14
const MENU_ARROW_HEIGHT = 14
const MENU_ARROW_WIDTH = 28
const MENU_ARROW_HALF_WIDTH = MENU_ARROW_WIDTH / 2
const MENU_ARROW_CORNER_RADIUS = 5.5
const MENU_ARROW_EDGE_INSET = 34
const MENU_RADIUS = 9
const MENU_PARENT_SUBMENU_OPEN_HIGHLIGHT_STYLE: CSSProperties = {
  backgroundColor: 'var(--system-color-menu-parent-highlight)',
}

function isDivider(item: ContextualMenuItem): item is ContextualMenuDividerItem {
  return 'type' in item && item.type === 'separator'
}

function isSearch(item: ContextualMenuItem): item is ContextualMenuSearchItem {
  return 'type' in item && item.type === 'search'
}

function isColorTags(item: ContextualMenuItem): item is ContextualMenuColorTagsItem {
  return 'type' in item && item.type === 'color-tags'
}

function hasCheckColumn(items: ContextualMenuItem[]) {
  return items.some((item) => (
    !isDivider(item)
    && !isSearch(item)
    && !isColorTags(item)
    && (item.checkable || item.checked !== undefined)
  ))
}

function getPathKey(path: ContextualMenuActionItem[]) {
  return path.map((item) => item.id).join('/')
}

function getRootFontSize() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

function getCssLengthPx(value: string) {
  const numericValue = Number.parseFloat(value)

  if (value.endsWith('rem')) return numericValue * getRootFontSize()
  if (value.endsWith('px')) return numericValue

  return numericValue
}

function estimateMenuHeight(items: ContextualMenuItem[]) {
  const rootFontSize = getRootFontSize()
  const contentHeightRem = items.reduce((height, item) => (
    height + (isDivider(item) ? MENU_SEPARATOR_BLOCK_HEIGHT_REM : MENU_ROW_HEIGHT_REM)
  ), MENU_PANEL_VERTICAL_PADDING_REM)

  return contentHeightRem * rootFontSize
}

function splitShortcut(shortcut: string) {
  const tokens: string[] = []

  for (let index = 0; index < shortcut.length; index += 1) {
    const char = shortcut[index]
    const codePoint = shortcut.codePointAt(index)

    if (codePoint && codePoint > 0xffff) {
      tokens.push(String.fromCodePoint(codePoint))
      index += 1
    } else if (char !== ' ') {
      tokens.push(char)
    }
  }

  return tokens
}

function ShortcutDisplay({ shortcut, highlighted = false }: { shortcut?: string; highlighted?: boolean }) {
  if (!shortcut) return null

  const shortcutClass = highlighted ? 'text-white/75' : 'text-#9f9f9f'
  const globeClass = highlighted ? 'text-white/75' : 'text-#9f9f9f'

  return (
    <span className={`pl-[1.8rem] whitespace-nowrap flex items-center justify-end gap-[.06rem] ${shortcutClass}`}>
      {splitShortcut(shortcut).map((token, index) => (
        <span
          className="min-w-[.82rem] h-[.9rem] flex items-center justify-center text-center leading-none tabular-nums"
          key={`${token}-${index}`}
        >
          {token === '🌐'
            ? <AppIcon className={`w-[.72rem] h-[.72rem] ${globeClass}`} icon={Globe} strokeWidth={2.25} />
            : token}
        </span>
      ))}
    </span>
  )
}

function getAdjustedRootPosition(
  position: ContextualMenuPosition,
  menuElement: HTMLDivElement | null,
  availableBottom: number,
  anchor?: ContextualMenuAnchor,
) {
  if (!menuElement) return position

  const rect = menuElement.getBoundingClientRect()
  const preferredArrowOffset = Math.min(MENU_ARROW_EDGE_INSET, Math.max(MENU_ARROW_HALF_WIDTH, (
    anchor?.side === 'bottom' ? rect.width : rect.height
  ) - MENU_ARROW_HALF_WIDTH))
  const preferredPosition = anchor
    ? anchor.side === 'bottom'
      ? {
          x: anchor.x - preferredArrowOffset,
          y: anchor.y - rect.height - ANCHORED_MENU_GAP,
        }
      : anchor.side === 'left'
        ? {
            x: anchor.x + ANCHORED_MENU_GAP,
            y: anchor.y - preferredArrowOffset,
          }
        : {
            x: anchor.x - rect.width - ANCHORED_MENU_GAP,
            y: anchor.y - preferredArrowOffset,
          }
    : position
  const x = Math.min(preferredPosition.x, window.innerWidth - rect.width - VIEWPORT_GAP)
  const y = Math.min(preferredPosition.y, availableBottom - rect.height - VIEWPORT_GAP)

  return {
    x: Math.max(VIEWPORT_GAP, x),
    y: Math.max(VIEWPORT_GAP, y),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function svgPathToCssPath(path: string) {
  return `path('${path}')`
}

function getBottomArrowPathSegment(offset: number, baseY: number, tipY: number) {
  const radius = MENU_ARROW_CORNER_RADIUS
  const tipRadius = radius * 0.52
  const leftBaseX = offset - MENU_ARROW_HALF_WIDTH
  const rightBaseX = offset + MENU_ARROW_HALF_WIDTH

  return [
    `L ${rightBaseX + radius} ${baseY}`,
    `Q ${rightBaseX} ${baseY} ${rightBaseX - (radius * 0.72)} ${baseY + (radius * 0.72)}`,
    `L ${offset + tipRadius} ${tipY - tipRadius}`,
    `Q ${offset} ${tipY} ${offset - tipRadius} ${tipY - tipRadius}`,
    `L ${leftBaseX + (radius * 0.72)} ${baseY + (radius * 0.72)}`,
    `Q ${leftBaseX} ${baseY} ${leftBaseX - radius} ${baseY}`,
  ]
}

function getLeftArrowPathSegment(baseX: number, offset: number) {
  const radius = MENU_ARROW_CORNER_RADIUS
  const tipRadius = radius * 0.52
  const topBaseY = offset - MENU_ARROW_HALF_WIDTH
  const bottomBaseY = offset + MENU_ARROW_HALF_WIDTH

  return [
    `L ${baseX} ${bottomBaseY + radius}`,
    `Q ${baseX} ${bottomBaseY} ${baseX - (radius * 0.72)} ${bottomBaseY - (radius * 0.72)}`,
    `L ${tipRadius} ${offset + tipRadius}`,
    `Q 0 ${offset} ${tipRadius} ${offset - tipRadius}`,
    `L ${baseX - (radius * 0.72)} ${topBaseY + (radius * 0.72)}`,
    `Q ${baseX} ${topBaseY} ${baseX} ${topBaseY - radius}`,
  ]
}

function getRightArrowPathSegment(baseX: number, tipX: number, offset: number) {
  const radius = MENU_ARROW_CORNER_RADIUS
  const tipRadius = radius * 0.52
  const topBaseY = offset - MENU_ARROW_HALF_WIDTH
  const bottomBaseY = offset + MENU_ARROW_HALF_WIDTH

  return [
    `L ${baseX} ${topBaseY - radius}`,
    `Q ${baseX} ${topBaseY} ${baseX + (radius * 0.72)} ${topBaseY + (radius * 0.72)}`,
    `L ${tipX - tipRadius} ${offset - tipRadius}`,
    `Q ${tipX} ${offset} ${tipX - tipRadius} ${offset + tipRadius}`,
    `L ${baseX + (radius * 0.72)} ${bottomBaseY - (radius * 0.72)}`,
    `Q ${baseX} ${bottomBaseY} ${baseX} ${bottomBaseY + radius}`,
  ]
}

function getPanelPath(
  size?: { width: number; height: number },
  edge?: MenuArrowEdge,
  offset?: number,
) {
  if (!size) return undefined
  if (!edge || offset === undefined) {
    const { width, height } = size
    const radius = Math.min(MENU_RADIUS, width / 2, height / 2)

    return [
      `M ${radius} 0`,
      `L ${width - radius} 0`,
      `Q ${width} 0 ${width} ${radius}`,
      `L ${width} ${height - radius}`,
      `Q ${width} ${height} ${width - radius} ${height}`,
      `L ${radius} ${height}`,
      `Q 0 ${height} 0 ${height - radius}`,
      `L 0 ${radius}`,
      `Q 0 0 ${radius} 0`,
      'Z',
    ].join(' ')
  }

  const { width, height } = size
  const radius = Math.min(MENU_RADIUS, width / 2, height / 2)
  const safeOffset = edge === 'bottom'
    ? clamp(offset, radius + MENU_ARROW_HALF_WIDTH, width - radius - MENU_ARROW_HALF_WIDTH)
    : clamp(offset, radius + MENU_ARROW_HALF_WIDTH, height - radius - MENU_ARROW_HALF_WIDTH)

  if (edge === 'bottom') {
    const baseY = height - MENU_ARROW_HEIGHT

    return [
      `M ${radius} 0`,
      `L ${width - radius} 0`,
      `Q ${width} 0 ${width} ${radius}`,
      `L ${width} ${baseY - radius}`,
      `Q ${width} ${baseY} ${width - radius} ${baseY}`,
      ...getBottomArrowPathSegment(safeOffset, baseY, height),
      `L ${radius} ${baseY}`,
      `Q 0 ${baseY} 0 ${baseY - radius}`,
      `L 0 ${radius}`,
      `Q 0 0 ${radius} 0`,
      'Z',
    ].join(' ')
  }

  if (edge === 'left') {
    const baseX = MENU_ARROW_HEIGHT

    return [
      `M ${baseX + radius} 0`,
      `L ${width - radius} 0`,
      `Q ${width} 0 ${width} ${radius}`,
      `L ${width} ${height - radius}`,
      `Q ${width} ${height} ${width - radius} ${height}`,
      `L ${baseX + radius} ${height}`,
      `Q ${baseX} ${height} ${baseX} ${height - radius}`,
      ...getLeftArrowPathSegment(baseX, safeOffset),
      `L ${baseX} ${radius}`,
      `Q ${baseX} 0 ${baseX + radius} 0`,
      'Z',
    ].join(' ')
  }

  const baseX = width - MENU_ARROW_HEIGHT

  return [
    `M ${radius} 0`,
    `L ${baseX - radius} 0`,
    `Q ${baseX} 0 ${baseX} ${radius}`,
    ...getRightArrowPathSegment(baseX, width, safeOffset),
    `L ${baseX} ${height - radius}`,
    `Q ${baseX} ${height} ${baseX - radius} ${height}`,
    `L ${radius} ${height}`,
    `Q 0 ${height} 0 ${height - radius}`,
    `L 0 ${radius}`,
    `Q 0 0 ${radius} 0`,
    'Z',
  ].join(' ')
}

function getPanelClipPath(
  size?: { width: number; height: number },
  edge?: MenuArrowEdge,
  offset?: number,
) {
  const path = getPanelPath(size, edge, offset)

  return path ? svgPathToCssPath(path) : undefined
}

function getPanelArrowPadding(edge?: MenuArrowEdge): CSSProperties {
  if (edge === 'bottom') return { paddingBottom: MENU_ARROW_HEIGHT }
  if (edge === 'left') return { paddingLeft: MENU_ARROW_HEIGHT }
  if (edge === 'right') return { paddingRight: MENU_ARROW_HEIGHT }

  return {}
}

function getSubmenuPosition(
  placement: SubmenuPlacement,
  submenuElement: HTMLDivElement | null,
  availableBottom: number,
) {
  if (!submenuElement) return { x: placement.x, y: placement.y }

  const rect = submenuElement.getBoundingClientRect()
  const rootFontSize = getRootFontSize()
  const overlap = SUBMENU_OVERLAP_REM * rootFontSize
  const defaultTop = SUBMENU_DEFAULT_TOP_REM * rootFontSize
  const rightX = placement.anchorRight - overlap
  const leftX = placement.anchorLeft + overlap - rect.width
  const rightOverflow = rightX + rect.width + VIEWPORT_GAP - window.innerWidth
  const leftOverflow = VIEWPORT_GAP - leftX
  const side = rightOverflow <= 0 || rightOverflow <= leftOverflow ? 'right' : 'left'
  const preferredX = side === 'right' ? rightX : leftX
  const submenuTop = placement.anchorTop + defaultTop
  const topOverflow = VIEWPORT_GAP - submenuTop
  const bottomOverflow = submenuTop + rect.height + VIEWPORT_GAP - availableBottom
  const preferredY = submenuTop
    + (topOverflow > 0 ? topOverflow : 0)
    - (bottomOverflow > 0 ? bottomOverflow : 0)

  return {
    x: Math.max(VIEWPORT_GAP, Math.min(preferredX, window.innerWidth - rect.width - VIEWPORT_GAP)),
    y: Math.max(VIEWPORT_GAP, preferredY),
  }
}

function ContextualSubmenu(props: ContextualSubmenuProps) {
  const { availableBottom, children, placement, zIndex } = props
  const submenuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: placement.x, y: placement.y })
  const [positionReady, setPositionReady] = useState(false)

  useLayoutEffect(() => {
    setPosition(getSubmenuPosition(placement, submenuRef.current, availableBottom))
    setPositionReady(true)
  }, [availableBottom, placement])

  return createPortal(
    <div
      className="fixed"
      ref={submenuRef}
      style={{
        left: position.x,
        top: position.y,
        zIndex,
        visibility: positionReady ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>,
    document.body,
  )
}

function useOutsideClose(open: boolean, menuRef: React.RefObject<HTMLDivElement | null>, onClose?: () => void) {
  useEffect(() => {
    if (!open || !onClose) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!menuRef.current?.contains(target) && !target.closest('[data-contextual-menu-panel=true]')) {
        onClose()
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuRef, onClose, open])
}

function ContextualMenuPanel(props: ContextualMenuPanelProps) {
  const {
    arrowEdge,
    arrowOffset,
    availableBottom,
    closing,
    items,
    path,
    selectedHighlightVisible,
    selectedPathKey,
    zIndex,
    pointerDownStartedInsideMenuRef,
    pointerReleaseSelectArmedRef,
    onClose,
    onSelectItem,
    onSubmenuItemHoverChange,
  } = props
  const [submenuPlacements, setSubmenuPlacements] = useState<Record<string, SubmenuPlacement>>({})
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [activeSubmenuItemId, setActiveSubmenuItemId] = useState<string | null>(null)
  const [submenuItemHovered, setSubmenuItemHovered] = useState(false)
  const [submenuEngaged, setSubmenuEngaged] = useState(false)
  const [clipSize, setClipSize] = useState<{ width: number; height: number }>()
  const panelRef = useRef<HTMLDivElement>(null)
  const skipNextClickSelectRef = useRef(false)
  const reserveCheckColumn = hasCheckColumn(items)
  const rowGridClass = reserveCheckColumn
    ? 'grid grid-cols-[1.35rem_minmax(0,1fr)_max-content] pl-[.48rem] pr-[1rem]'
    : 'grid grid-cols-[minmax(0,1fr)_max-content] px-[1rem]'
  const panelPath = getPanelPath(clipSize, arrowEdge, arrowOffset)
  const panelClipPath = getPanelClipPath(clipSize, arrowEdge, arrowOffset)
  const panelArrowPadding = getPanelArrowPadding(arrowEdge)

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
  }, [items])

  useEffect(() => {
    setSubmenuItemHovered(false)
    setSubmenuEngaged(false)
  }, [activeSubmenuItemId])

  useEffect(() => {
    if (submenuItemHovered) {
      setSubmenuEngaged(true)
    }
  }, [submenuItemHovered])

  useEffect(() => {
    onSubmenuItemHoverChange?.(hoveredItemId !== null)

    return () => {
      onSubmenuItemHoverChange?.(false)
    }
  }, [hoveredItemId, onSubmenuItemHoverChange])

  const updateSubmenuPlacement = (
    itemId: string,
    element: HTMLDivElement,
    submenuItems: ContextualMenuItem[],
  ) => {
    const rect = element.getBoundingClientRect()
    const rootFontSize = getRootFontSize()
    const submenuWidth = panelRef.current?.getBoundingClientRect().width ?? rect.width
    const submenuHeight = estimateMenuHeight(submenuItems)
    const overlap = SUBMENU_OVERLAP_REM * rootFontSize
    const rightOverflow = rect.right - overlap + submenuWidth + VIEWPORT_GAP - window.innerWidth
    const leftOverflow = VIEWPORT_GAP - (rect.left + overlap - submenuWidth)
    const side = rightOverflow <= 0 || rightOverflow <= leftOverflow ? 'right' : 'left'
    const x = side === 'right'
      ? rect.right - overlap
      : rect.left + overlap - submenuWidth
    const defaultTop = SUBMENU_DEFAULT_TOP_REM * rootFontSize
    const submenuTop = rect.top + defaultTop
    const topOverflow = VIEWPORT_GAP - submenuTop
    const bottomOverflow = submenuTop + submenuHeight + VIEWPORT_GAP - availableBottom
    const topOffset = submenuTop
      + (topOverflow > 0 ? topOverflow : 0)
      - (bottomOverflow > 0 ? bottomOverflow : 0)

    setSubmenuPlacements((state) => ({
      ...state,
      [itemId]: {
        anchorLeft: rect.left,
        anchorRight: rect.right,
        anchorTop: rect.top,
        preferredSide: side,
        x: Math.max(VIEWPORT_GAP, x),
        y: Math.max(VIEWPORT_GAP, topOffset),
      },
    }))
  }

  return (
    <div
      className={`relative z-1 w-max min-w-[13rem] max-w-[28rem] text-[var(--system-text-primary)] text-[.9rem] transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
      data-contextual-menu-panel="true"
      onContextMenu={(event) => event.preventDefault()}
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
            style={{ filter: 'blur(14px)' }}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={panelPath}
            fill="none"
            stroke="rgba(0, 0, 0, .08)"
            strokeWidth="5"
            style={{ filter: 'blur(3px)' }}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <SystemGlassSurface
        className="rounded-[.55rem]"
        clipPath={panelClipPath}
        style={{ zIndex: 1 }}
      />
      <div
        className="relative"
        style={{
          zIndex: 2,
          ...panelArrowPadding,
        }}
      >
        <div className="py-[.4rem]">
        {items.map((item) => {
          if (isDivider(item)) {
            return <div className="h-px my-[.38rem] mx-[1rem] bg-[var(--system-surface-divider)]" key={item.id} />
          }

          if (isSearch(item)) {
            return (
              <div className="h-[1.9rem] px-[.55rem] flex items-center" key={item.id}>
                <div className="h-[1.38rem] w-full rounded-[.34rem] bg-#ffffff70 border border-#00000010 px-[.48rem] flex items-center text-#9d9d9d">
                  <span
                    className="w-[.16rem] h-[1rem] rounded-full mr-[.18rem]"
                    style={{ background: 'var(--system-color, #ef5ba1)' }}
                  />
                  <span>{item.placeholder}</span>
                </div>
              </div>
            )
          }

          if (isColorTags(item)) {
            return (
              <div className="h-[1.55rem] px-[1rem] flex items-center gap-[.85rem]" key={item.id}>
                {item.colors.map((color) => (
                  <span
                    className="w-[.92rem] h-[.92rem] rounded-full border border-#00000020"
                    key={color}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )
          }

          const childPath = [...path, item]
          const hasChildren = Boolean(item.children?.length)
          const submenuPlacement = submenuPlacements[item.id]
          const itemHovered = hoveredItemId === item.id
          const itemSubmenuOpen = activeSubmenuItemId === item.id
          const itemPathKey = getPathKey(childPath)
          const itemSelected = selectedPathKey === itemPathKey
          const parentSubmenuGrayHighlight = itemSubmenuOpen && !itemHovered && submenuEngaged
          const itemAccentHighlighted = itemSelected
            ? selectedHighlightVisible
            : itemHovered
          const itemTextHighlighted = !item.disabled && !parentSubmenuGrayHighlight && itemAccentHighlighted
          const itemIconClass = itemTextHighlighted ? 'text-white' : 'text-[var(--system-menu-icon-color)]'
          const selectItem = () => {
            if (item.disabled) return
            onSelectItem({ item, path: childPath })
          }

          return (
            <div
              className="relative"
              key={item.id}
            >
              <div
                aria-disabled={item.disabled}
                className="relative h-[1.55rem] border-0 bg-transparent text-inherit [font:inherit] cursor-default text-left"
                onClick={(event) => {
                  event.stopPropagation()
                  if (skipNextClickSelectRef.current) {
                    skipNextClickSelectRef.current = false
                    return
                  }
                  selectItem()
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  selectItem()
                }}
                onMouseEnter={(event) => {
                  setHoveredItemId(item.id)
                  if (hasChildren && item.children) {
                    setActiveSubmenuItemId(item.id)
                    updateSubmenuPlacement(item.id, event.currentTarget, item.children)
                  } else {
                    setActiveSubmenuItemId(null)
                  }
                }}
                onMouseLeave={() => setHoveredItemId((currentId) => currentId === item.id ? null : currentId)}
                onMouseUp={(event) => {
                  event.stopPropagation()
                  if (pointerDownStartedInsideMenuRef.current) return
                  if (!pointerReleaseSelectArmedRef.current) return

                  skipNextClickSelectRef.current = true
                  window.setTimeout(() => {
                    skipNextClickSelectRef.current = false
                  }, 0)
                  selectItem()
                }}
                role="menuitem"
                tabIndex={item.disabled ? -1 : 0}
              >
                {!item.disabled && (
                  <span
                    className="absolute inset-y-0 left-[.35rem] right-[.35rem] z-0 rounded-[.32rem]"
                    style={
                      itemAccentHighlighted
                        ? { backgroundColor: 'var(--system-color-menu-highlight, rgba(239, 91, 161, 0.75))' }
                        : parentSubmenuGrayHighlight
                          ? MENU_PARENT_SUBMENU_OPEN_HIGHLIGHT_STYLE
                          : undefined
                    }
                  />
                )}
                <div className={`relative z-1 h-full items-center ${rowGridClass}`}>
                  {reserveCheckColumn && (
                    <span className={`flex items-center justify-center ${item.disabled ? 'opacity-45' : ''}`}>
                      {item.checked && (
                        <AppIcon
                          className={`w-[.9rem] h-[.9rem] ${itemIconClass}`}
                          icon={Check}
                          strokeWidth={2.5}
                        />
                      )}
                    </span>
                  )}
                  <span className={`min-w-0 whitespace-nowrap flex items-center gap-[.45rem] ${item.disabled ? 'opacity-45' : itemTextHighlighted ? 'text-white' : ''}`}>
                    {item.icon && (
                      <span className="w-[.9rem] h-[.9rem] shrink-0 flex items-center justify-center">
                        <AppIcon
                          className={`w-[.9rem] h-[.9rem] ${itemIconClass}`}
                          icon={item.icon}
                          scale={item.iconScale ?? 1}
                          strokeWidth={2}
                        />
                      </span>
                    )}
                    <span className="min-w-0 overflow-hidden text-ellipsis">{item.label}</span>
                  </span>
                  <ShortcutDisplay highlighted={itemTextHighlighted} shortcut={item.shortcut} />
                  {hasChildren && (
                    <AppIcon
                      className={`w-[.9rem] h-[.9rem] justify-self-end ${itemIconClass} ${item.disabled ? 'opacity-45' : ''}`}
                      icon={ChevronRight}
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              </div>
              {hasChildren && item.children && itemSubmenuOpen && submenuPlacement && (
                <ContextualSubmenu
                  availableBottom={availableBottom}
                  placement={submenuPlacement}
                  zIndex={zIndex + path.length + 1}
                >
                  <ContextualMenuPanel
                    availableBottom={availableBottom}
                    closing={closing}
                    items={item.children}
                    path={childPath}
                    pointerDownStartedInsideMenuRef={pointerDownStartedInsideMenuRef}
                    pointerReleaseSelectArmedRef={pointerReleaseSelectArmedRef}
                    selectedHighlightVisible={selectedHighlightVisible}
                    selectedPathKey={selectedPathKey}
                    zIndex={zIndex}
                    onClose={onClose}
                    onSelectItem={onSelectItem}
                    onSubmenuItemHoverChange={setSubmenuItemHovered}
                  />
                </ContextualSubmenu>
              )}
            </div>
          )
        })}
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
            stroke="var(--system-surface-menu-border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  )
}

function ContextualMenu(props: ContextualMenuProps) {
  const {
    anchor,
    id,
    items,
    open,
    position,
    zIndex = 3000,
    onClose,
    onSelect,
  } = props
  const dockPosition = useDockSettingStore((state) => state.position)
  const dockSize = useDockSettingStore((state) => state.size)
  const generatedId = useId()
  const menuId = id ?? generatedId
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoreHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSelectRef = useRef<ContextualMenuSelectEvent | null>(null)
  const pointerDownStartedInsideMenuRef = useRef(false)
  const pointerReleaseSelectArmedRef = useRef(false)
  const [adjustedPosition, setAdjustedPosition] = useState(position)
  const [positionReady, setPositionReady] = useState(false)
  const [closing, setClosing] = useState(false)
  const [frozenItems, setFrozenItems] = useState<ContextualMenuItem[] | null>(null)
  const [selectedHighlightVisible, setSelectedHighlightVisible] = useState(true)
  const [selectedPathKey, setSelectedPathKey] = useState<string | null>(null)
  const availableBottom = dockPosition === DockPositionEnum.BOTTOM
    ? window.innerHeight - getCssLengthPx(dockSize) - (DOCK_EDGE_GAP_REM * getRootFontSize())
    : window.innerHeight

  const clearCloseTimers = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (restoreHighlightTimerRef.current) {
      clearTimeout(restoreHighlightTimerRef.current)
      restoreHighlightTimerRef.current = null
    }
    pendingSelectRef.current = null
  }, [])

  useOutsideClose(open && !closing, menuRef, onClose)

  useEffect(() => {
    if (!open && !closing) {
      pointerDownStartedInsideMenuRef.current = false
      pointerReleaseSelectArmedRef.current = false
      return
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      pointerDownStartedInsideMenuRef.current = Boolean(target?.closest('[data-contextual-menu-panel=true]'))
      pointerReleaseSelectArmedRef.current = false
    }
    const onMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!event.buttons || pointerDownStartedInsideMenuRef.current) return

      pointerReleaseSelectArmedRef.current = Boolean(target?.closest('[data-contextual-menu-panel=true]'))
    }
    const onMouseUp = () => {
      window.setTimeout(() => {
        pointerDownStartedInsideMenuRef.current = false
        pointerReleaseSelectArmedRef.current = false
      }, 0)
    }

    document.addEventListener('mousedown', onMouseDown, true)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousedown', onMouseDown, true)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [closing, open])

  useEffect(() => {
    if (!open) return

    const onOtherMenuOpen = (event: Event) => {
      const openedMenuId = (event as CustomEvent<string>).detail
      if (openedMenuId !== menuId) onClose?.()
    }

    window.addEventListener(CONTEXTUAL_MENU_OPEN_EVENT, onOtherMenuOpen)
    window.dispatchEvent(new CustomEvent(CONTEXTUAL_MENU_OPEN_EVENT, { detail: menuId }))

    return () => {
      window.removeEventListener(CONTEXTUAL_MENU_OPEN_EVENT, onOtherMenuOpen)
    }
  }, [menuId, onClose, open])

  useEffect(() => () => clearCloseTimers(), [clearCloseTimers])

  useLayoutEffect(() => {
    if (!open) {
      setPositionReady(false)
      return
    }
    clearCloseTimers()
    setClosing(false)
    setFrozenItems(null)
    setSelectedHighlightVisible(true)
    setSelectedPathKey(null)
    setAdjustedPosition(getAdjustedRootPosition(position, menuRef.current, availableBottom, anchor))
    setPositionReady(true)
  }, [anchor, availableBottom, clearCloseTimers, open, position])

  const onSelectItem = (event: ContextualMenuSelectEvent) => {
    clearCloseTimers()

    pendingSelectRef.current = event
    setFrozenItems(items)
    setSelectedPathKey(getPathKey(event.path))
    setSelectedHighlightVisible(false)

    restoreHighlightTimerRef.current = setTimeout(() => {
      setSelectedHighlightVisible(true)
      setClosing(true)

      closeTimerRef.current = setTimeout(() => {
        onClose?.()
        setClosing(false)
        setSelectedPathKey(null)
        setFrozenItems(null)

        const pending = pendingSelectRef.current
        pendingSelectRef.current = null
        if (pending) onSelect?.(pending)
      }, SELECT_FADE_OUT_DURATION)
    }, SELECT_HIGHLIGHT_RESTORE_DELAY)
  }

  if (!open && !closing) return null

  const displayItems = frozenItems ?? items

  const menuRect = menuRef.current?.getBoundingClientRect()
  const arrowEdge = anchor?.side
  const arrowOffset = anchor && menuRect
    ? anchor.side === 'bottom'
      ? clamp(anchor.x - adjustedPosition.x, MENU_ARROW_HALF_WIDTH, menuRect.width - MENU_ARROW_HALF_WIDTH)
      : clamp(anchor.y - adjustedPosition.y, MENU_ARROW_HALF_WIDTH, menuRect.height - MENU_ARROW_HALF_WIDTH)
    : null

  return createPortal(
    <div
      ref={menuRef}
      className="fixed"
      onContextMenu={(event) => event.preventDefault()}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        zIndex,
        visibility: positionReady ? 'visible' : 'hidden',
      }}
    >
      <ContextualMenuPanel
        arrowEdge={arrowEdge}
        arrowOffset={arrowOffset ?? undefined}
        availableBottom={availableBottom}
        closing={closing}
        items={displayItems}
        path={[]}
        pointerDownStartedInsideMenuRef={pointerDownStartedInsideMenuRef}
        pointerReleaseSelectArmedRef={pointerReleaseSelectArmedRef}
        selectedHighlightVisible={selectedHighlightVisible}
        selectedPathKey={selectedPathKey}
        zIndex={zIndex}
        onClose={onClose}
        onSelectItem={onSelectItem}
      />
    </div>,
    document.body,
  )
}

export default ContextualMenu
