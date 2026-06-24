import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ContextualMenu, { type ContextualMenuSelectEvent } from '~/components/ContextualMenu'
import { AppIcon } from '~/components/icons/AppIcon'
import { seekerIcons } from '~/components/applications/Seeker/icons'
import { Z_INDEX } from '~/constants/zIndex'
import { getTabContextMenuItems } from './tabContextMenu'
import type { TabState } from '../types'

const NEW_TAB_ICON_CLASS = 'w-[.9rem] h-[.9rem]'
const TAB_CLOSE_ICON_CLASS = 'w-[.9rem] h-[.9rem]'
const TAB_BG_TRANSITION_CLASS = 'transition-colors duration-150 ease-out'
const TAB_CLOSE_TRANSITION_CLASS = 'transition-[opacity,background-color,color] duration-150 ease-out'
const TAB_SLOT_TRANSFORM_TRANSITION = 'transform 200ms ease-out'
const TAB_SLOT_LAYOUT_TRANSITION = 'left 200ms ease-out, width 200ms ease-out'
const TAB_SETTLE_MS = 200
const TAB_LAYOUT_TRANSITION_MS = 200
const DRAG_THRESHOLD_PX = 10
const ACTIVE_TAB_RISE_PX = 2

function clampDragDeltaX(
  deltaX: number,
  visualIndex: number,
  slotWidth: number,
  trackWidth: number,
): number {
  const minDeltaX = -visualIndex * slotWidth
  const maxDeltaX = trackWidth - (visualIndex + 1) * slotWidth
  return Math.max(minDeltaX, Math.min(maxDeltaX, deltaX))
}

interface TabDragState {
  tabId: string
  startX: number
  currentIndex: number
  deltaX: number
  dragging: boolean
  previewTabIds: string[]
}

interface TabSettleState {
  tabId: string
  previewTabIds: string[]
  deltaX: number
}

interface TabLayoutAnimState {
  kind: 'add' | 'close'
  fromSlotWidth: number
  toSlotWidth: number
  targetTabId: string
  targetIndex: number
  phase: 'from' | 'to'
  onComplete?: () => void
}

interface HairlineProps {
  className?: string
  color: string
  style?: React.CSSProperties
}

function HairlineVertical({ className = '', color, style }: HairlineProps) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none ${className}`}
      preserveAspectRatio="none"
      style={style}
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

interface TrackDividersProps {
  dividerColor: string
  tabCount: number
  slotWidth: number
  transition?: string
}

function TrackDividers({
  dividerColor,
  tabCount,
  slotWidth,
  transition,
}: TrackDividersProps) {
  if (tabCount <= 1) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[3]">
      {Array.from({ length: tabCount - 1 }, (_, index) => {
        const boundaryIndex = index + 1

        const left = slotWidth > 0
          ? boundaryIndex * slotWidth
          : `${(boundaryIndex / tabCount) * 100}%`

        return (
          <HairlineVertical
            className="absolute top-0 h-full"
            color={dividerColor}
            key={boundaryIndex}
            style={{ left, transition }}
          />
        )
      })}
    </div>
  )
}

interface ActiveTabSideBordersProps {
  backgroundClass: string
  dividerColor: string
}

function ActiveTabSideBorders({ backgroundClass, dividerColor }: ActiveTabSideBordersProps) {
  const style = {
    top: ACTIVE_TAB_RISE_PX,
    height: `calc(100% - ${ACTIVE_TAB_RISE_PX}px)`,
  }

  return (
    <>
      <div className={`pointer-events-none absolute left-[-1px] z-[9] w-px ${backgroundClass}`} style={style} />
      <HairlineVertical
        className="absolute left-[-1px] z-[10]"
        color={dividerColor}
        style={style}
      />
      <div className={`pointer-events-none absolute right-[-1px] z-[9] w-px ${backgroundClass}`} style={style} />
      <HairlineVertical
        className="absolute right-[-1px] z-[10]"
        color={dividerColor}
        style={style}
      />
    </>
  )
}

interface ActiveTabBorderOverlayProps {
  backgroundClass: string
  dividerColor: string
  height: React.CSSProperties['height']
  left: React.CSSProperties['left']
  top: React.CSSProperties['top']
  transform?: string
  transition?: string
  width: React.CSSProperties['width']
  zIndex: number
}

function ActiveTabBorderOverlay({
  backgroundClass,
  dividerColor,
  height,
  left,
  top,
  transform,
  transition,
  width,
  zIndex,
}: ActiveTabBorderOverlayProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute overflow-visible"
      style={{
        height,
        left,
        top,
        transform,
        transition,
        width,
        zIndex,
      }}
    >
      <ActiveTabSideBorders backgroundClass={backgroundClass} dividerColor={dividerColor} />
    </div>
  )
}

const TAB_TOP_INNER_SHADOW = {
  focused: 'var(--seeker-tabbar-top-inner-shadow-focused)',
  unfocused: 'var(--seeker-tabbar-top-inner-shadow-unfocused)',
} as const

interface TabCloseButtonProps {
  active: boolean
  focused: boolean
  onClose: () => void
}

function TabCloseButton({ active, focused, onClose }: TabCloseButtonProps) {
  const iconClass = focused
    ? 'text-[var(--seeker-tab-close-icon-focused)]'
    : 'text-[var(--seeker-tab-close-icon-unfocused)]'
  const iconInteractionClass = focused
    ? 'group-hover/close:text-[var(--seeker-tab-close-icon-hover-focused)] group-active/close:text-[var(--seeker-tab-close-icon-active-focused)]'
    : 'group-hover/close:text-[var(--seeker-tab-close-icon-hover-unfocused)] group-active/close:text-[var(--seeker-tab-close-icon-active-unfocused)]'
  const backgroundClass = active
    ? 'hover:bg-[var(--seeker-tab-close-hover-active-tab)] active:bg-[var(--seeker-tab-close-active-active-tab)]'
    : 'hover:bg-[var(--seeker-tab-close-hover-inactive-tab)] active:bg-[var(--seeker-tab-close-active-inactive-tab)]'

  const handleClose = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onClose()
  }

  return (
    <div
      aria-label="关闭标签页"
      className={`group/close absolute top-1/2 left-[.22rem] z-[1] flex h-[1.2rem] w-[1.2rem] -translate-y-1/2 shrink-0 items-center justify-center rounded-[.2rem] cursor-default opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto ${TAB_CLOSE_TRANSITION_CLASS} ${backgroundClass}`}
      onClick={handleClose}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <AppIcon
        className={`${TAB_CLOSE_ICON_CLASS} ${iconClass} ${iconInteractionClass} transition-colors duration-150 ease-out`}
        icon={seekerIcons.close}
        strokeWidth={2.5}
      />
    </div>
  )
}

interface TabContentProps {
  active: boolean
  label: string
  focused: boolean
  tabTextClass: string
  onClose: () => void
}

function TabContent({
  active,
  label,
  focused,
  tabTextClass,
  onClose,
}: TabContentProps) {
  return (
    <div
      className="group relative flex min-w-0 flex-1 items-stretch h-8 cursor-default"
    >
      <TabCloseButton active={active} focused={focused} onClose={onClose} />
      <div
        className={`min-w-0 flex-1 h-full flex items-center justify-center px-[1.35rem] text-center truncate [font:inherit] text-[.82rem] font-[620] leading-none ${tabTextClass}`}
      >
        {label}
      </div>
    </div>
  )
}

interface TabBarProps {
  tabs: TabState[]
  activeTabId: string
  focused: boolean
  onSelectTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onCloseOtherTabs: (tabId: string) => void
  onMoveTabToNewWindow: (tabId: string) => void
  onMoveTabs: (tabIds: string[]) => void
  onAddTab: () => void
}

function TabBar({
  tabs,
  activeTabId,
  focused,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onMoveTabToNewWindow,
  onMoveTabs,
  onAddTab,
}: TabBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<TabDragState | null>(null)
  const settleTimerRef = useRef<number | null>(null)
  const layoutAnimTimerRef = useRef<number | null>(null)
  const prevTabCountRef = useRef<number | null>(null)
  const [, setDragTick] = useState(0)
  const [trackWidthPx, setTrackWidthPx] = useState(0)
  const [settleState, setSettleState] = useState<TabSettleState | null>(null)
  const [layoutAnim, setLayoutAnim] = useState<TabLayoutAnimState | null>(null)
  const [suppressBgTransition, setSuppressBgTransition] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    open: boolean
    position: { x: number; y: number }
    tabId: string | null
  }>({ open: false, position: { x: 0, y: 0 }, tabId: null })
  const prevFocusedRef = useRef(focused)

  const measureTrack = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setTrackWidthPx(track.offsetWidth)
  }, [])

  useLayoutEffect(() => {
    measureTrack()
    window.addEventListener('resize', measureTrack)
    return () => window.removeEventListener('resize', measureTrack)
  }, [measureTrack, tabs.length])

  useLayoutEffect(() => {
    if (prevFocusedRef.current === focused) return
    prevFocusedRef.current = focused
    setSuppressBgTransition(true)
    const frame = requestAnimationFrame(() => {
      setSuppressBgTransition(false)
    })
    return () => cancelAnimationFrame(frame)
  }, [focused])

  useLayoutEffect(() => () => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
    }
    if (layoutAnimTimerRef.current !== null) {
      window.clearTimeout(layoutAnimTimerRef.current)
    }
  }, [])

  const startTabLayoutAnim = useCallback((config: Omit<TabLayoutAnimState, 'phase'>) => {
    if (layoutAnimTimerRef.current !== null) {
      window.clearTimeout(layoutAnimTimerRef.current)
    }

    setLayoutAnim({ ...config, phase: 'from' })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLayoutAnim((current) => (
          current?.targetTabId === config.targetTabId ? { ...current, phase: 'to' } : current
        ))
      })
    })

    layoutAnimTimerRef.current = window.setTimeout(() => {
      config.onComplete?.()
      setLayoutAnim(null)
      layoutAnimTimerRef.current = null
    }, TAB_LAYOUT_TRANSITION_MS)
  }, [])

  useLayoutEffect(() => {
    if (trackWidthPx <= 0 || tabs.length < 2) return

    const prevCount = prevTabCountRef.current
    const newTab = tabs[tabs.length - 1]
    if (!newTab) return

    const toSlotWidth = trackWidthPx / tabs.length

    if (prevCount === null) {
      startTabLayoutAnim({
        kind: 'add',
        fromSlotWidth: trackWidthPx / (tabs.length - 1),
        toSlotWidth,
        targetTabId: newTab.id,
        targetIndex: tabs.length - 1,
      })
    } else if (tabs.length > prevCount) {
      startTabLayoutAnim({
        kind: 'add',
        fromSlotWidth: trackWidthPx / prevCount,
        toSlotWidth,
        targetTabId: newTab.id,
        targetIndex: tabs.length - 1,
      })
    }

    prevTabCountRef.current = tabs.length
  }, [startTabLayoutAnim, tabs, trackWidthPx])

  const bumpDragRender = useCallback(() => {
    setDragTick((value) => value + 1)
  }, [])

  const dragState = dragRef.current
  const isDragging = dragState?.dragging ?? false
  const isSettling = settleState !== null

  const orderedTabIds = settleState?.previewTabIds
    ?? dragState?.previewTabIds
    ?? tabs.map((tab) => tab.id)
  const tabBarBgClass = focused
    ? 'bg-[var(--seeker-tabbar-focused)]'
    : 'bg-[var(--seeker-tabbar-unfocused)]'
  const activeTabBgClass = focused
    ? 'bg-[var(--seeker-tab-active-focused)]'
    : 'bg-[var(--seeker-tab-active-unfocused)]'
  const tabBgTransitionClass = suppressBgTransition ? 'transition-none' : TAB_BG_TRANSITION_CLASS
  const inactiveTabBgClass = focused
    ? `bg-[var(--seeker-tab-inactive-focused)] hover:bg-[var(--seeker-tab-inactive-focused-hover)] ${tabBgTransitionClass}`
    : `bg-[var(--seeker-tab-inactive-unfocused)] hover:bg-[var(--seeker-tab-inactive-unfocused-hover)] ${tabBgTransitionClass}`
  const addTabBgClass = focused
    ? `bg-[var(--seeker-tab-add-focused)] hover:bg-[var(--seeker-tab-add-focused-hover)] active:bg-[var(--seeker-tab-add-focused-active)] ${tabBgTransitionClass}`
    : `bg-[var(--seeker-tab-add-unfocused)] hover:bg-[var(--seeker-tab-add-unfocused-hover)] ${tabBgTransitionClass}`
  const activeTabTextClass = focused
    ? 'text-[var(--seeker-tab-active-text-focused)]'
    : 'text-[var(--seeker-tab-active-text-unfocused)]'
  const inactiveTabTextClass = focused
    ? 'text-[var(--seeker-tab-inactive-text-focused)]'
    : 'text-[var(--seeker-tab-inactive-text-unfocused)]'
  const newTabIconColorClass = focused
    ? 'text-[var(--seeker-tab-add-icon-focused)]'
    : 'text-[var(--seeker-tab-add-icon-unfocused)]'
  const tabDividerColor = focused
    ? 'var(--seeker-tab-divider-focused)'
    : 'var(--seeker-tab-divider-unfocused)'
  const tabCount = tabs.length
  const slotWidthPx = tabCount > 0 && trackWidthPx > 0 ? trackWidthPx / tabCount : 0
  const layoutSlotWidth = layoutAnim
    ? (layoutAnim.phase === 'from' ? layoutAnim.fromSlotWidth : layoutAnim.toSlotWidth)
    : slotWidthPx

  const getLayoutSlotLeft = useCallback((dataIndex: number) => {
    if (layoutSlotWidth <= 0) return 0
    if (!layoutAnim || layoutAnim.kind === 'add') {
      return dataIndex * layoutSlotWidth
    }

    const closeIndex = layoutAnim.targetIndex
    if (layoutAnim.phase === 'from') {
      return dataIndex * layoutAnim.fromSlotWidth
    }

    if (dataIndex <= closeIndex) return dataIndex * layoutAnim.toSlotWidth
    return (dataIndex - 1) * layoutAnim.toSlotWidth
  }, [layoutAnim, layoutSlotWidth])

  const getSlotOffsetX = useCallback((dataIndex: number, visualIndex: number) => (
    slotWidthPx > 0 ? (visualIndex - dataIndex) * slotWidthPx : 0
  ), [slotWidthPx])

  const getLayoutSlotOffsetX = useCallback((dataIndex: number, visualIndex: number) => (
    layoutSlotWidth > 0 ? (visualIndex - dataIndex) * layoutSlotWidth : 0
  ), [layoutSlotWidth])

  const getTabSlotWidth = useCallback((tabId: string) => {
    if (layoutSlotWidth <= 0) return `${100 / tabCount}%`
    if (layoutAnim && tabId === layoutAnim.targetTabId) {
      if (layoutAnim.kind === 'add' && layoutAnim.phase === 'from') return 0
      if (layoutAnim.kind === 'close' && layoutAnim.phase === 'to') return 0
    }
    return layoutSlotWidth
  }, [layoutAnim, layoutSlotWidth, tabCount])

  const draggedTabId = isSettling
    ? settleState.tabId
    : isDragging
      ? dragState?.tabId
      : undefined
  const draggedDeltaX = isSettling ? settleState.deltaX : dragState?.deltaX ?? 0
  const shouldAnimateSlots = isDragging || isSettling

  const getSlotTransition = useCallback((isDragged: boolean) => {
    if (shouldAnimateSlots && !isDragged) return TAB_SLOT_TRANSFORM_TRANSITION
    if (layoutAnim?.phase === 'to') return TAB_SLOT_LAYOUT_TRANSITION
    return undefined
  }, [layoutAnim, shouldAnimateSlots])

  const activeDataIndex = tabs.findIndex((tab) => tab.id === activeTabId)
  const activeVisualIndex = orderedTabIds.indexOf(activeTabId)
  const activeTab = activeDataIndex >= 0 ? tabs[activeDataIndex] : undefined
  const draggedDataIndex = draggedTabId
    ? tabs.findIndex((tab) => tab.id === draggedTabId)
    : -1
  const draggedVisualIndex = draggedTabId ? orderedTabIds.indexOf(draggedTabId) : -1
  const activeSlotOffsetX = activeDataIndex >= 0 && activeVisualIndex >= 0
    ? (layoutAnim ? getLayoutSlotOffsetX : getSlotOffsetX)(activeDataIndex, activeVisualIndex)
    : 0

  const handleCloseTab = useCallback((tabId: string) => {
    if (isSettling || isDragging || layoutAnim) return
    if (tabs.length <= 1) return

    const closeIndex = tabs.findIndex((tab) => tab.id === tabId)
    if (closeIndex < 0) return

    measureTrack()
    if (trackWidthPx <= 0) {
      onCloseTab(tabId)
      return
    }

    startTabLayoutAnim({
      kind: 'close',
      fromSlotWidth: trackWidthPx / tabs.length,
      toSlotWidth: trackWidthPx / (tabs.length - 1),
      targetTabId: tabId,
      targetIndex: closeIndex,
      onComplete: () => onCloseTab(tabId),
    })
  }, [
    isDragging,
    isSettling,
    layoutAnim,
    measureTrack,
    onCloseTab,
    startTabLayoutAnim,
    tabs,
    trackWidthPx,
  ])

  const contextMenuItems = useMemo(
    () => getTabContextMenuItems(tabs.length),
    [tabs.length],
  )

  const closeContextMenu = useCallback(() => {
    setContextMenu((current) => (current.open ? { ...current, open: false, tabId: null } : current))
  }, [])

  const handleTabContextMenu = useCallback((tabId: string, event: React.MouseEvent) => {
    if (isDragging || isSettling || layoutAnim) return

    event.preventDefault()
    event.stopPropagation()
    onSelectTab(tabId)
    setContextMenu({
      open: true,
      position: { x: event.clientX, y: event.clientY },
      tabId,
    })
  }, [isDragging, isSettling, layoutAnim, onSelectTab])

  const handleContextMenuSelect = useCallback((event: ContextualMenuSelectEvent) => {
    const tabId = contextMenu.tabId
    if (!tabId) return

    switch (event.item.id) {
      case 'close-tab':
        handleCloseTab(tabId)
        break
      case 'close-other-tabs':
        onCloseOtherTabs(tabId)
        break
      case 'move-tab-new-window':
        onMoveTabToNewWindow(tabId)
        break
      default:
        break
    }

    closeContextMenu()
  }, [closeContextMenu, contextMenu.tabId, handleCloseTab, onCloseOtherTabs, onMoveTabToNewWindow])

  const beginSettle = useCallback((state: TabDragState) => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
    }

    setSettleState({
      tabId: state.tabId,
      previewTabIds: state.previewTabIds,
      deltaX: state.deltaX,
    })
    dragRef.current = null

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSettleState((current) => (
          current ? { ...current, deltaX: 0 } : null
        ))
      })
    })

    settleTimerRef.current = window.setTimeout(() => {
      onMoveTabs(state.previewTabIds)
      setSettleState(null)
      settleTimerRef.current = null
      bumpDragRender()
    }, TAB_SETTLE_MS)
  }, [bumpDragRender, onMoveTabs])

  const handleTabMouseDown = useCallback((tabId: string, index: number, event: React.MouseEvent) => {
    if (event.button !== 0 || isSettling || layoutAnim) return

    measureTrack()
    onSelectTab(tabId)

    dragRef.current = {
      tabId,
      startX: event.clientX,
      currentIndex: index,
      deltaX: 0,
      dragging: false,
      previewTabIds: tabs.map((tab) => tab.id),
    }
    bumpDragRender()

    const handleMove = (moveEvent: MouseEvent) => {
      const state = dragRef.current
      const track = trackRef.current
      if (!state || !track) return

      const count = state.previewTabIds.length
      const slotWidth = track.offsetWidth / count
      const trackWidth = track.offsetWidth
      let deltaX = moveEvent.clientX - state.startX
      const dragging = state.dragging || Math.abs(deltaX) >= DRAG_THRESHOLD_PX

      if (dragging && slotWidth > 0) {
        const trackLeft = track.getBoundingClientRect().left
        const centerX = trackLeft + state.currentIndex * slotWidth + slotWidth / 2 + deltaX
        let nextIndex = Math.round((centerX - trackLeft - slotWidth / 2) / slotWidth)
        nextIndex = Math.max(0, Math.min(count - 1, nextIndex))

        if (nextIndex !== state.currentIndex) {
          const nextIds = [...state.previewTabIds]
          nextIds.splice(state.currentIndex, 1)
          nextIds.splice(nextIndex, 0, state.tabId)
          const startX = state.startX + (nextIndex - state.currentIndex) * slotWidth
          deltaX = clampDragDeltaX(moveEvent.clientX - startX, nextIndex, slotWidth, trackWidth)
          dragRef.current = {
            ...state,
            previewTabIds: nextIds,
            currentIndex: nextIndex,
            startX,
            deltaX,
            dragging: true,
          }
          bumpDragRender()
          return
        }

        deltaX = clampDragDeltaX(deltaX, state.currentIndex, slotWidth, trackWidth)
      }

      dragRef.current = {
        ...state,
        deltaX,
        dragging,
      }
      bumpDragRender()
    }

    const handleUp = () => {
      const state = dragRef.current
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)

      if (state?.dragging) {
        beginSettle(state)
      } else {
        dragRef.current = null
        bumpDragRender()
      }
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [beginSettle, bumpDragRender, isSettling, layoutAnim, measureTrack, onSelectTab, tabs])

  const showActiveOverlay = activeTab
    && draggedTabId !== activeTab.id
    && !isSettling

  return (
    <div className={`relative shrink-0 h-8 flex items-stretch ${tabBarBgClass}`}>
      <div className="relative z-[2] min-w-0 flex-1 h-8" ref={trackRef}>
        {tabs.map((tab, dataIndex) => {
          const visualIndex = orderedTabIds.indexOf(tab.id)
          if (visualIndex < 0) return null

          const isActive = tab.id === activeTabId
          const isDragged = draggedTabId === tab.id
          const showInactiveInTrack = !isActive && !isDragged
          const slotOffsetX = layoutAnim
            ? getLayoutSlotOffsetX(dataIndex, visualIndex)
            : getSlotOffsetX(dataIndex, visualIndex)

          return (
            <div
              className="absolute top-0 h-8 z-[2] overflow-hidden"
              key={tab.id}
              style={{
                width: getTabSlotWidth(tab.id),
                left: getLayoutSlotLeft(dataIndex),
                transform: slotOffsetX !== 0 ? `translateX(${slotOffsetX}px)` : undefined,
                transition: getSlotTransition(isDragged),
              }}
            >
              {showInactiveInTrack ? (
                <div
                  className={`flex min-w-0 h-full items-stretch cursor-default ${inactiveTabBgClass}`}
                  onContextMenu={(event) => handleTabContextMenu(tab.id, event)}
                  onMouseDown={(event) => handleTabMouseDown(tab.id, visualIndex, event)}
                >
                  <TabContent
                    active={false}
                    focused={focused}
                    label={tab.label}
                    onClose={() => handleCloseTab(tab.id)}
                    tabTextClass={inactiveTabTextClass}
                  />
                </div>
              ) : (
                <div
                  aria-hidden={isActive && !isDragged}
                  className={`min-w-0 h-full ${isActive && !isDragged ? 'pointer-events-none' : 'cursor-default'}`}
                  onMouseDown={isDragged ? undefined : (event) => handleTabMouseDown(tab.id, visualIndex, event)}
                />
              )}
            </div>
          )
        })}
        <TrackDividers
          dividerColor={tabDividerColor}
          slotWidth={layoutSlotWidth}
          tabCount={tabCount}
          transition={layoutAnim?.phase === 'to' ? TAB_SLOT_LAYOUT_TRANSITION : undefined}
        />
      </div>

      <div className="relative z-[2] shrink-0 flex w-8 h-8 items-stretch">
        <HairlineVertical
          className="absolute top-0 left-0 z-[10] h-full"
          color={tabDividerColor}
        />
        <div
          className={`w-full h-full cursor-default flex items-center justify-center ${addTabBgClass}`}
          onClick={onAddTab}
        >
          <AppIcon className={`${NEW_TAB_ICON_CLASS} ${newTabIconColorClass}`} icon={seekerIcons.plus} />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{ boxShadow: focused ? TAB_TOP_INNER_SHADOW.focused : TAB_TOP_INNER_SHADOW.unfocused }}
      />

      {showActiveOverlay ? (
        <div
          className="pointer-events-none absolute z-[5] overflow-hidden"
          style={{
            width: getTabSlotWidth(activeTab.id),
            left: getLayoutSlotLeft(activeDataIndex),
            transform: activeSlotOffsetX !== 0 ? `translateX(${activeSlotOffsetX}px)` : undefined,
            transition: shouldAnimateSlots
              ? TAB_SLOT_TRANSFORM_TRANSITION
              : layoutAnim?.phase === 'to'
                ? TAB_SLOT_LAYOUT_TRANSITION
                : undefined,
            top: -ACTIVE_TAB_RISE_PX,
            height: `calc(100% + ${ACTIVE_TAB_RISE_PX}px)`,
          }}
        >
          <div className={`pointer-events-auto relative flex min-w-0 h-full flex-col cursor-default ${activeTabBgClass}`}>
            <div className={`shrink-0 ${activeTabBgClass}`} style={{ height: ACTIVE_TAB_RISE_PX }} />
            <div
              className="flex min-w-0 flex-1 items-stretch h-8"
              onContextMenu={(event) => handleTabContextMenu(activeTab.id, event)}
              onMouseDown={(event) => handleTabMouseDown(activeTab.id, activeVisualIndex, event)}
            >
              <TabContent
                active
                focused={focused}
                label={activeTab.label}
                onClose={() => handleCloseTab(activeTab.id)}
                tabTextClass={activeTabTextClass}
              />
            </div>
          </div>
        </div>
      ) : null}

      {showActiveOverlay ? (
        <ActiveTabBorderOverlay
          backgroundClass={activeTabBgClass}
          dividerColor={tabDividerColor}
          height={`calc(100% + ${ACTIVE_TAB_RISE_PX}px)`}
          left={getLayoutSlotLeft(activeDataIndex)}
          top={-ACTIVE_TAB_RISE_PX}
          transform={activeSlotOffsetX !== 0 ? `translateX(${activeSlotOffsetX}px)` : undefined}
          transition={shouldAnimateSlots
            ? TAB_SLOT_TRANSFORM_TRANSITION
            : layoutAnim?.phase === 'to'
              ? TAB_SLOT_LAYOUT_TRANSITION
              : undefined}
          width={getTabSlotWidth(activeTab.id)}
          zIndex={6}
        />
      ) : null}

      {draggedTabId ? (() => {
        const draggedTab = draggedDataIndex >= 0 ? tabs[draggedDataIndex] : undefined
        const isDraggedActive = draggedTabId === activeTabId
        if (!draggedTab || draggedVisualIndex < 0 || draggedDataIndex < 0) return null

        const isFollowingPointer = isDragging && !isSettling
        const draggedSlotOffsetX = layoutAnim
          ? getLayoutSlotOffsetX(draggedDataIndex, draggedVisualIndex)
          : getSlotOffsetX(draggedDataIndex, draggedVisualIndex)
        const draggedTranslateX = draggedSlotOffsetX + draggedDeltaX
        const draggedTransition = isFollowingPointer
          ? undefined
          : shouldAnimateSlots
            ? TAB_SLOT_TRANSFORM_TRANSITION
            : layoutAnim?.phase === 'to'
              ? TAB_SLOT_LAYOUT_TRANSITION
              : undefined

        return (
          <>
            <div
              className={`pointer-events-none absolute z-[20] overflow-hidden ${isDraggedActive ? '' : 'h-8'}`}
              style={{
                width: getTabSlotWidth(draggedTab.id),
                left: getLayoutSlotLeft(draggedDataIndex),
                transform: draggedTranslateX !== 0 ? `translateX(${draggedTranslateX}px)` : undefined,
                transition: draggedTransition,
                top: isDraggedActive ? -ACTIVE_TAB_RISE_PX : 0,
                height: isDraggedActive ? `calc(100% + ${ACTIVE_TAB_RISE_PX}px)` : '100%',
              }}
            >
              <div
                className={`pointer-events-auto relative flex min-w-0 h-full flex-col cursor-default ${
                  isDraggedActive ? activeTabBgClass : 'bg-#e6e5e5'
                }`}
              >
                {isDraggedActive ? (
                  <div className={`shrink-0 ${activeTabBgClass}`} style={{ height: ACTIVE_TAB_RISE_PX }} />
                ) : null}
                <div className="flex min-w-0 flex-1 items-stretch h-8">
                  <TabContent
                    active={isDraggedActive}
                    focused={focused}
                    label={draggedTab.label}
                    onClose={() => handleCloseTab(draggedTab.id)}
                    tabTextClass={isDraggedActive ? activeTabTextClass : inactiveTabTextClass}
                  />
                </div>
              </div>
            </div>
            {isDraggedActive ? (
              <ActiveTabBorderOverlay
                backgroundClass={activeTabBgClass}
                dividerColor={tabDividerColor}
                height={`calc(100% + ${ACTIVE_TAB_RISE_PX}px)`}
                left={getLayoutSlotLeft(draggedDataIndex)}
                top={-ACTIVE_TAB_RISE_PX}
                transform={draggedTranslateX !== 0 ? `translateX(${draggedTranslateX}px)` : undefined}
                transition={draggedTransition}
                width={getTabSlotWidth(draggedTab.id)}
                zIndex={21}
              />
            ) : null}
          </>
        )
      })() : null}

      <ContextualMenu
        items={contextMenuItems}
        open={contextMenu.open}
        position={contextMenu.position}
        zIndex={Z_INDEX.IN_APP_OVERLAY}
        onClose={closeContextMenu}
        onSelect={handleContextMenuSelect}
      />
    </div>
  )
}

export default TabBar
