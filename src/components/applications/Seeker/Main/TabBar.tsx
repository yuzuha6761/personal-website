import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { AppIcon } from '~/components/icons/AppIcon'
import { seekerIcons } from '../icons'
import type { SeekerTabState } from './types'
import { SEEKER_TAB_CHROME } from './types'

const NEW_TAB_ICON_CLASS = 'w-[.9rem] h-[.9rem]'
const TAB_CLOSE_ICON_CLASS = 'w-[.9rem] h-[.9rem]'
const TAB_BG_TRANSITION_CLASS = 'transition-colors duration-150 ease-out'
const TAB_CLOSE_TRANSITION_CLASS = 'transition-[opacity,background-color,color] duration-150 ease-out'
const TAB_SLOT_TRANSFORM_TRANSITION = 'transform 200ms ease-out'
const TAB_SLOT_LAYOUT_TRANSITION = 'left 200ms ease-out, width 200ms ease-out'
const TAB_SETTLE_MS = 200
const TAB_LAYOUT_TRANSITION_MS = 200
const DRAG_THRESHOLD_PX = 50
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
}

function HairlineVertical({ className = '', color }: HairlineProps) {
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

const TAB_TOP_INNER_SHADOW = {
  // Alpha fades toward 0 at 3px so inactive tab bg (#f0f0f0 / #e3e3e3) shows through at the seam.
  focused: 'inset 0 1px 0 0 rgba(205, 205, 205, 0.45), inset 0 2px 0 0 rgba(221, 221, 221, 0.22), inset 0 3px 0 0 rgba(240, 240, 240, 0)',
  unfocused: 'inset 0 1px 0 0 rgba(191, 191, 191, 0.45), inset 0 2px 0 0 rgba(211, 211, 211, 0.22), inset 0 3px 0 0 rgba(227, 227, 227, 0)',
} as const

interface TabCloseButtonProps {
  active: boolean
  focused: boolean
  onClose: () => void
}

function TabCloseButton({ active, focused, onClose }: TabCloseButtonProps) {
  const iconClass = focused ? 'text-#808080' : 'text-#b8b8b8'
  const iconInteractionClass = focused
    ? 'group-hover/close:text-#666666 group-active/close:text-#595959'
    : 'group-hover/close:text-#9a9a9a group-active/close:text-#878787'
  const backgroundClass = active
    ? 'hover:bg-#e3e2e2 active:bg-#d5d4d5'
    : 'hover:bg-#b5b4b4 active:bg-#8a8989'

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
  tabs: SeekerTabState[]
  activeTabId: string
  focused: boolean
  onSelectTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onMoveTabs: (tabIds: string[]) => void
  onAddTab: () => void
}

function TabBar({
  tabs,
  activeTabId,
  focused,
  onSelectTab,
  onCloseTab,
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
  const tabBarBgClass = focused ? 'bg-#ececec' : 'bg-#dedede'
  const activeTabBgClass = focused ? 'bg-#fdfdfd' : 'bg-#f2f2f2'
  const tabBgTransitionClass = suppressBgTransition ? 'transition-none' : TAB_BG_TRANSITION_CLASS
  const inactiveTabBgClass = isDragging || isSettling
    ? focused ? 'bg-#f0f0f0' : 'bg-#e3e3e3'
    : focused
      ? `bg-#f0f0f0 hover:bg-#e3e3e3 ${tabBgTransitionClass}`
      : `bg-#e3e3e3 hover:bg-#d6d6d6 ${tabBgTransitionClass}`
  const addTabBgClass = isDragging || isSettling
    ? focused ? 'bg-#f0f0f0' : 'bg-#e3e3e3'
    : focused
      ? `bg-#f0f0f0 hover:bg-#e3e3e3 active:bg-#cac9c9 ${tabBgTransitionClass}`
      : `bg-#e3e3e3 hover:bg-#d6d6d6 ${tabBgTransitionClass}`
  const newTabIconColorClass = focused ? 'text-#6b6b6b' : 'text-#a8a8a8'
  const tabTextClass = focused ? 'text-#2f2f2f' : 'text-#a0a0a0'
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
              {visualIndex > 0 ? (
                <HairlineVertical
                  className="absolute top-0 left-0 z-[10] h-full"
                  color={SEEKER_TAB_CHROME.divider}
                />
              ) : null}
              {showInactiveInTrack ? (
                <div
                  className={`flex min-w-0 h-full items-stretch cursor-default ${inactiveTabBgClass}`}
                  onMouseDown={(event) => handleTabMouseDown(tab.id, visualIndex, event)}
                >
                  <TabContent
                    active={false}
                    focused={focused}
                    label={tab.label}
                    onClose={() => handleCloseTab(tab.id)}
                    tabTextClass={tabTextClass}
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
      </div>

      <div className="relative z-[2] shrink-0 flex w-8 h-8 items-stretch">
        <HairlineVertical
          className="absolute top-0 left-0 z-[10] h-full"
          color={SEEKER_TAB_CHROME.divider}
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
          <div className={`pointer-events-auto flex min-w-0 h-full flex-col cursor-default ${activeTabBgClass}`}>
            <div className={`shrink-0 ${activeTabBgClass}`} style={{ height: ACTIVE_TAB_RISE_PX }} />
            <div
              className="flex min-w-0 flex-1 items-stretch h-8"
              onMouseDown={(event) => handleTabMouseDown(activeTab.id, activeVisualIndex, event)}
            >
              <TabContent
                active
                focused={focused}
                label={activeTab.label}
                onClose={() => handleCloseTab(activeTab.id)}
                tabTextClass={tabTextClass}
              />
            </div>
          </div>
        </div>
      ) : null}

      {draggedTabId ? (() => {
        const draggedDataIndex = tabs.findIndex((tab) => tab.id === draggedTabId)
        const draggedTab = draggedDataIndex >= 0 ? tabs[draggedDataIndex] : undefined
        const draggedVisualIndex = orderedTabIds.indexOf(draggedTabId)
        const isDraggedActive = draggedTabId === activeTabId
        if (!draggedTab || draggedVisualIndex < 0 || draggedDataIndex < 0) return null

        const isFollowingPointer = isDragging && !isSettling
        const draggedSlotOffsetX = layoutAnim
          ? getLayoutSlotOffsetX(draggedDataIndex, draggedVisualIndex)
          : getSlotOffsetX(draggedDataIndex, draggedVisualIndex)
        const draggedTranslateX = draggedSlotOffsetX + draggedDeltaX

        return (
          <div
            className={`pointer-events-none absolute z-[20] overflow-hidden ${isDraggedActive ? '' : 'h-8'}`}
            style={{
              width: getTabSlotWidth(draggedTab.id),
              left: getLayoutSlotLeft(draggedDataIndex),
              transform: draggedTranslateX !== 0 ? `translateX(${draggedTranslateX}px)` : undefined,
              transition: isFollowingPointer
                ? undefined
                : shouldAnimateSlots
                  ? TAB_SLOT_TRANSFORM_TRANSITION
                  : layoutAnim?.phase === 'to'
                    ? TAB_SLOT_LAYOUT_TRANSITION
                    : undefined,
              top: isDraggedActive ? -ACTIVE_TAB_RISE_PX : 0,
              height: isDraggedActive ? `calc(100% + ${ACTIVE_TAB_RISE_PX}px)` : '100%',
            }}
          >
            <div
              className={`pointer-events-auto flex min-w-0 h-full flex-col cursor-default ${
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
                  tabTextClass={tabTextClass}
                />
              </div>
            </div>
          </div>
        )
      })() : null}
    </div>
  )
}

export default TabBar
