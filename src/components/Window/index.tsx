import type { MouseEvent as ReactMouseEvent } from 'react'
import { flushSync } from 'react-dom'
import type { WindowState } from '~types'
import { resolveApplication } from '../applications/registry'
import { resolveRemSizeToPx } from '../../services/window'
import { createWindowSnapshot, captureWindowSnapshot, publishWindowSnapshot } from '../../services/window-snapshots'
import fullscreenIcon from '~assets/common/window-fullscreen.svg'
import { Circle, Minus, Plus, X } from 'lucide-react'
import { AppIcon } from '../icons/AppIcon'
import { FocusContext } from './FocusContext'
import { shouldStartWindowDrag } from './Drag'
import { ResizeContext } from './ResizeContext'

interface WindowProps {
  active: boolean
  minimizing?: boolean
  window: WindowState
  onClose: (windowId: string) => void
  onFocus: (windowId: string) => void
  onFrameChange: (windowId: string, frame: WindowFrame) => void
  onMinimize: (windowId: string) => void
  onMinimizeAnimationEnd: (windowId: string) => void
}

interface TrafficLightsProps {
  active: boolean
  title: string
  documentDirty?: boolean
  zoomDisabled?: boolean
  minimizeDisabled?: boolean
  onClose: () => void
  onMinimize: () => void
}

interface WindowFrame {
  position: { x: number; y: number }
  size: { width: number; height: number }
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
type WindowInteraction =
  | {
      type: 'drag'
      startPointer: { x: number; y: number }
      startFrame: WindowFrame
    }
  | {
      type: 'resize'
      direction: ResizeDirection
      startPointer: { x: number; y: number }
      startFrame: WindowFrame
    }

const trafficLightBaseClass = 'relative w-[.9rem] h-[.9rem] rounded-full p-0 cursor-default flex items-center justify-center active:[filter:brightness(.82)]'
const trafficLightGlyphBaseClass = 'w-[.42rem] h-[.42rem] object-contain opacity-0'
const TRAFFIC_LIGHT_INACTIVE_CLASS = 'border border-#cecdcd bg-#cecdcd'
const TRAFFIC_LIGHT_APPEARANCE = {
  close: {
    active: 'border border-#e0443e bg-#ff5f56',
    hover: 'group-hover:border-#e0443e group-hover:bg-#ff5f56',
  },
  minimize: {
    active: 'border border-#dea123 bg-#ffbd2e',
    hover: 'group-hover:border-#dea123 group-hover:bg-#ffbd2e',
  },
  zoom: {
    active: 'border border-#1aab29 bg-#27c93f',
    hover: 'group-hover:border-#1aab29 group-hover:bg-#27c93f',
  },
} as const

/** Focused: colored unless disabled. Unfocused: gray; hover traffic lights restores all enabled colors. */
function resolveTrafficLightClass(
  focused: boolean,
  disabled: boolean,
  appearance: { active: string; hover: string },
) {
  if (disabled) return TRAFFIC_LIGHT_INACTIVE_CLASS
  if (focused) return appearance.active
  return `${TRAFFIC_LIGHT_INACTIVE_CLASS} ${appearance.hover}`
}

function getTrafficLightGlyphClass(disabled = false) {
  return disabled ? 'opacity-0' : 'opacity-0 group-hover:opacity-50'
}
const DEFAULT_TRAFFIC_LIGHT_POSITION_REM = { top: 0.55, left: 0.55 }
const STANDARD_TITLE_BAR_HEIGHT_REM = 2.75
const WINDOW_TITLE_BAR_HEIGHT = 38
const WINDOW_RESIZE_HANDLE_SIZE_REM = 0.25
const WINDOW_MINIMIZE_ANIMATION_DURATION_MS = 420
const MIN_WINDOW_SIZE = { width: 320, height: 220 }
const SCREEN_EDGE_MARGIN = 24
const WINDOW_BORDER_RADIUS_REM = 0.8
const WINDOW_BORDER_COLOR = '#cacaca'
const TITLE_BAR_BORDER_COLOR = '#c6c5c5'
const cursorMap: Record<ResizeDirection, string> = {
  e: 'ew-resize',
  w: 'ew-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
}

function getResizeCursor(direction: ResizeDirection) {
  return cursorMap[direction]
}

function getResizeHandleSizePx() {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return rootFontSize * WINDOW_RESIZE_HANDLE_SIZE_REM
}

function getRemPx(rem: number) {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return rootFontSize * rem
}

function getResizeDirection(
  event: ReactMouseEvent<HTMLDivElement> | MouseEvent,
  rect: DOMRect,
): ResizeDirection | null {
  const resizeHandleSize = getResizeHandleSizePx()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const insideHorizontalRange = x >= -resizeHandleSize && x <= rect.width + resizeHandleSize
  const insideVerticalRange = y >= -resizeHandleSize && y <= rect.height + resizeHandleSize
  const nearTop = insideHorizontalRange && y >= -resizeHandleSize && y <= resizeHandleSize
  const nearRight = insideVerticalRange && x >= rect.width - resizeHandleSize && x <= rect.width + resizeHandleSize
  const nearBottom = insideHorizontalRange && y >= rect.height - resizeHandleSize && y <= rect.height + resizeHandleSize
  const nearLeft = insideVerticalRange && x >= -resizeHandleSize && x <= resizeHandleSize

  if (nearTop && nearLeft) return 'nw'
  if (nearTop && nearRight) return 'ne'
  if (nearBottom && nearLeft) return 'sw'
  if (nearBottom && nearRight) return 'se'
  if (nearTop) return 'n'
  if (nearRight) return 'e'
  if (nearBottom) return 's'
  if (nearLeft) return 'w'

  return null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function clampDragPosition(position: { x: number; y: number }, frameSize: { width: number; height: number }) {
  return {
    x: clamp(
      position.x,
      SCREEN_EDGE_MARGIN - frameSize.width,
      globalThis.window.innerWidth - SCREEN_EDGE_MARGIN,
    ),
    y: clamp(
      position.y,
      0,
      globalThis.window.innerHeight - SCREEN_EDGE_MARGIN,
    ),
  }
}

function scheduleWindowSnapshotCapture(windowId: string, source: HTMLElement) {
  const capture = () => (
    source.isConnected
      ? captureWindowSnapshot(windowId, source)
      : Promise.resolve()
  )

  const capturePromise = new Promise<void>((resolve) => {
    const runCapture = () => {
      void capture().finally(resolve)
    }

    if (globalThis.window.requestIdleCallback) {
      globalThis.window.requestIdleCallback(runCapture, { timeout: WINDOW_MINIMIZE_ANIMATION_DURATION_MS })
      return
    }

    globalThis.window.setTimeout(runCapture, 80)
  })

  return capturePromise
}

function measureExpandedMinimizeTarget(target: HTMLElement) {
  const slot = target.closest<HTMLElement>('[data-minimized-window-id]')

  if (!slot) return target.getBoundingClientRect()

  const previousHeight = slot.style.height
  const previousTransition = slot.style.transition
  const previousWidth = slot.style.width
  const dock = slot.closest<HTMLElement>('[data-position]')
  const dockPosition = dock?.dataset.position
  const dockRect = dock?.getBoundingClientRect()
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  const slotSize = Math.max(
    0,
    ((dockPosition === 'bottom' ? dockRect?.height : dockRect?.width) ?? 0) - (rootFontSize * 0.5),
  )

  slot.style.transition = 'none'

  if (dockPosition === 'bottom') {
    slot.style.width = `${slotSize}px`
  } else {
    slot.style.height = `${slotSize}px`
  }

  const rect = target.getBoundingClientRect()

  slot.style.height = previousHeight
  slot.style.transition = previousTransition
  slot.style.width = previousWidth

  return rect
}

function forceExpandedMinimizeSlot(slot: HTMLElement) {
  const dock = slot.closest<HTMLElement>('[data-position]')
  const dockPosition = dock?.dataset.position
  const dockRect = dock?.getBoundingClientRect()
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  const slotSize = Math.max(
    0,
    ((dockPosition === 'bottom' ? dockRect?.height : dockRect?.width) ?? 0) - (rootFontSize * 0.5),
  )

  if (dockPosition === 'bottom') {
    slot.style.width = `${slotSize}px`
  } else {
    slot.style.height = `${slotSize}px`
  }
}

function clearForcedMinimizeSlot(slot: HTMLElement) {
  slot.style.height = ''
  slot.style.width = ''
}

function getWindowFramePath(width: number, height: number) {
  const radius = Math.min(getRemPx(WINDOW_BORDER_RADIUS_REM), width / 2, height / 2)

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

function resizeFrame(
  direction: ResizeDirection,
  startFrame: WindowFrame,
  deltaX: number,
  deltaY: number,
  minSize: { width: number; height: number } = MIN_WINDOW_SIZE,
): WindowFrame {
  const nextFrame: WindowFrame = {
    position: { ...startFrame.position },
    size: { ...startFrame.size },
  }

  if (direction.includes('e')) {
    nextFrame.size.width = Math.max(minSize.width, startFrame.size.width + deltaX)
  }

  if (direction.includes('s')) {
    nextFrame.size.height = Math.max(minSize.height, startFrame.size.height + deltaY)
  }

  if (direction.includes('w')) {
    const width = Math.max(minSize.width, startFrame.size.width - deltaX)
    nextFrame.position.x = startFrame.position.x + startFrame.size.width - width
    nextFrame.size.width = width
  }

  if (direction.includes('n')) {
    const height = Math.max(minSize.height, startFrame.size.height - deltaY)
    nextFrame.position.y = startFrame.position.y + startFrame.size.height - height
    nextFrame.size.height = height
  }

  return nextFrame
}

function TrafficLights(props: TrafficLightsProps) {
  const {
    active,
    title,
    documentDirty = false,
    zoomDisabled = false,
    minimizeDisabled = false,
    onClose,
    onMinimize,
  } = props
  const [optionKeyPressed, setOptionKeyPressed] = useState(false)
  const closeLightClass = resolveTrafficLightClass(active, false, TRAFFIC_LIGHT_APPEARANCE.close)
  const minimizeLightClass = resolveTrafficLightClass(active, minimizeDisabled, TRAFFIC_LIGHT_APPEARANCE.minimize)
  const zoomLightClass = resolveTrafficLightClass(active, zoomDisabled, TRAFFIC_LIGHT_APPEARANCE.zoom)

  useEffect(() => {
    const updateOptionKeyState = (event: KeyboardEvent) => setOptionKeyPressed(event.altKey)
    const releaseOptionKey = () => setOptionKeyPressed(false)

    window.addEventListener('keydown', updateOptionKeyState)
    window.addEventListener('keyup', updateOptionKeyState)
    window.addEventListener('blur', releaseOptionKey)

    return () => {
      window.removeEventListener('keydown', updateOptionKeyState)
      window.removeEventListener('keyup', updateOptionKeyState)
      window.removeEventListener('blur', releaseOptionKey)
    }
  }, [])

  return (
    <div
      className="group gap-[.5rem] pointer-events-auto flex items-center"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div
        aria-label={`Close ${title}`}
        className={`${trafficLightBaseClass} ${closeLightClass}`}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        role="button"
        tabIndex={0}
      >
        <AppIcon
          className={`${trafficLightGlyphBaseClass} ${getTrafficLightGlyphClass()} ${documentDirty ? 'fill-current text-#4d0000' : 'text-#4d0000'}`}
          icon={documentDirty ? Circle : X}
          strokeWidth={documentDirty ? 0 : 2.5}
        />
      </div>
      <div
        aria-disabled={minimizeDisabled}
        aria-label={`Minimize ${title}`}
        className={`${trafficLightBaseClass} ${minimizeLightClass}`}
        onClick={(event) => {
          if (minimizeDisabled) return
          event.stopPropagation()
          onMinimize()
        }}
        role="button"
        tabIndex={minimizeDisabled ? -1 : 0}
      >
        <AppIcon
          className={`${trafficLightGlyphBaseClass} ${getTrafficLightGlyphClass(minimizeDisabled)} text-#171717`}
          icon={Minus}
          strokeWidth={2.5}
        />
      </div>
      <div
        aria-disabled={zoomDisabled}
        aria-label={`${optionKeyPressed ? 'Zoom' : 'Enter fullscreen'} ${title}`}
        className={`${trafficLightBaseClass} ${zoomLightClass}`}
        role="button"
        tabIndex={zoomDisabled ? -1 : 0}
      >
        {optionKeyPressed
          ? (
              <AppIcon
                className={`${trafficLightGlyphBaseClass} ${getTrafficLightGlyphClass(zoomDisabled)} text-#171717`}
                icon={Plus}
                strokeWidth={2.5}
              />
            )
          : (
              <img
                className={`${trafficLightGlyphBaseClass} ${getTrafficLightGlyphClass(zoomDisabled)}`}
                src={fullscreenIcon}
                alt=""
              />
            )}
      </div>
    </div>
  )
}

function Window(props: WindowProps) {
  const {
    active,
    minimizing = false,
    window,
    onClose,
    onFocus,
    onFrameChange,
    onMinimize,
    onMinimizeAnimationEnd,
  } = props
  const { children, windowOptions } = resolveApplication(window.appId, window)
  const {
    fullSizeContentView = false,
    trafficLightsPosition,
    zoomDisabled = false,
    minimizeDisabled = false,
    resizable = true,
    minSize: minSizeRem,
  } = windowOptions
  const minSize = minSizeRem ? resolveRemSizeToPx(minSizeRem, MIN_WINDOW_SIZE) : MIN_WINDOW_SIZE
  const [frame, setFrame] = useState<WindowFrame>({
    position: window.position,
    size: window.size,
  })
  const [minimizeAnimationStyle, setMinimizeAnimationStyle] = useState<{
    opacity: number
    transform: string
    transition: string
  } | null>(null)
  const frameRef = useRef(frame)
  frameRef.current = frame
  const frameHeightRef = useRef(frame.size.height)
  frameHeightRef.current = frame.size.height
  const [heightTransition, setHeightTransition] = useState<string>()
  const [cursorStyle, setCursorStyle] = useState<string>()
  const interactionRef = useRef<WindowInteraction | null>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const visibleWindowRef = useRef<HTMLDivElement>(null)
  const dragPreviewPositionRef = useRef<{ x: number; y: number } | null>(null)
  const dragRafRef = useRef<number | null>(null)
  const minSizeRef = useRef(minSize)
  minSizeRef.current = minSize
  const resizeHandleSizeRem = `${WINDOW_RESIZE_HANDLE_SIZE_REM}rem`
  const hitAreaSizeOffsetRem = `${WINDOW_RESIZE_HANDLE_SIZE_REM * 2}rem`
  const trafficLightsTopRem = fullSizeContentView
    ? trafficLightsPosition?.top ?? DEFAULT_TRAFFIC_LIGHT_POSITION_REM.top
    : DEFAULT_TRAFFIC_LIGHT_POSITION_REM.top
  const trafficLightsLeftRem = fullSizeContentView
    ? trafficLightsPosition?.left ?? DEFAULT_TRAFFIC_LIGHT_POSITION_REM.left
    : DEFAULT_TRAFFIC_LIGHT_POSITION_REM.left
  const draggableTitleBarHeight = fullSizeContentView
    ? WINDOW_TITLE_BAR_HEIGHT
    : getRemPx(STANDARD_TITLE_BAR_HEIGHT_REM)
  const setWindowHeight = useCallback((height: number, options?: { animate?: boolean; duration?: number }) => {
    if (frameHeightRef.current === height) return

    const duration = options?.duration ?? 200

    if (options?.animate) {
      setHeightTransition(`height ${duration}ms ease`)
    } else {
      setHeightTransition(undefined)
    }

    setFrame((currentFrame) => ({
      ...currentFrame,
      size: {
        ...currentFrame.size,
        height,
      },
    }))
  }, [])

  const resizeContextValue = useMemo(() => ({ setWindowHeight }), [setWindowHeight])
  const focusContextValue = useMemo(
    () => ({ focused: active, windowId: window.id }),
    [active, window.id],
  )

  const applyShellTransform = useCallback((x: number, y: number) => {
    const shell = shellRef.current
    if (!shell) return

    shell.style.transform = `translate(calc(${x}px - ${resizeHandleSizeRem}), calc(${y}px - ${resizeHandleSizeRem}))`
  }, [resizeHandleSizeRem])

  const scheduleDragTransform = useCallback((position: { x: number; y: number }) => {
    dragPreviewPositionRef.current = position

    if (dragRafRef.current !== null) return

    dragRafRef.current = globalThis.window.requestAnimationFrame(() => {
      dragRafRef.current = null
      const previewPosition = dragPreviewPositionRef.current
      if (!previewPosition) return

      applyShellTransform(previewPosition.x, previewPosition.y)
    })
  }, [applyShellTransform])

  const clearDragPreview = useCallback(() => {
    if (dragRafRef.current !== null) {
      globalThis.window.cancelAnimationFrame(dragRafRef.current)
      dragRafRef.current = null
    }

    dragPreviewPositionRef.current = null

    const shell = shellRef.current
    if (shell) shell.style.willChange = ''
  }, [])

  const beginDragPreview = useCallback(() => {
    const shell = shellRef.current
    if (shell) shell.style.willChange = 'transform'
  }, [])

  useLayoutEffect(() => {
    if (!minimizing) {
      setMinimizeAnimationStyle(null)
      return
    }

    const transition = [
      `transform ${WINDOW_MINIMIZE_ANIMATION_DURATION_MS}ms cubic-bezier(.2,.8,.2,1)`,
      `opacity ${WINDOW_MINIMIZE_ANIMATION_DURATION_MS}ms ease`,
    ].join(', ')
    let secondFrame: number | null = null
    let thirdFrame: number | null = null
    const fallbackTimer = globalThis.window.setTimeout(
      () => onMinimizeAnimationEnd(window.id),
      WINDOW_MINIMIZE_ANIMATION_DURATION_MS + 120,
    )
    const animationFrame = globalThis.window.requestAnimationFrame(() => {
      secondFrame = globalThis.window.requestAnimationFrame(() => {
        thirdFrame = globalThis.window.requestAnimationFrame(() => {
          const shell = shellRef.current
          const visibleWindow = visibleWindowRef.current
          const target = document.querySelector<HTMLElement>(
            `[data-minimized-window-id="${window.id}"] [data-window-minimize-target="true"]`,
          ) ?? document.querySelector<HTMLElement>(`[data-minimized-window-id="${window.id}"]`)

          if (!shell || !visibleWindow || !target) {
            onMinimizeAnimationEnd(window.id)
            return
          }

          const shellRect = shell.getBoundingClientRect()
          const sourceRect = visibleWindow.getBoundingClientRect()
          const targetRect = measureExpandedMinimizeTarget(target)
          const scale = Math.max(
            0.05,
            Math.min(targetRect.width / sourceRect.width, targetRect.height / sourceRect.height),
          )
          const visibleOffsetX = sourceRect.left - shellRect.left
          const visibleOffsetY = sourceRect.top - shellRect.top
          const x = targetRect.left + ((targetRect.width - sourceRect.width * scale) / 2) - (visibleOffsetX * scale)
          const y = targetRect.top + ((targetRect.height - sourceRect.height * scale) / 2) - (visibleOffsetY * scale)

          globalThis.window.clearTimeout(fallbackTimer)
          globalThis.window.setTimeout(
            () => onMinimizeAnimationEnd(window.id),
            WINDOW_MINIMIZE_ANIMATION_DURATION_MS,
          )
          setMinimizeAnimationStyle({
            opacity: 1,
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
            transition,
          })
        })
      })
    })

    return () => {
      globalThis.window.cancelAnimationFrame(animationFrame)
      if (secondFrame !== null) globalThis.window.cancelAnimationFrame(secondFrame)
      if (thirdFrame !== null) globalThis.window.cancelAnimationFrame(thirdFrame)
      globalThis.window.clearTimeout(fallbackTimer)
    }
  }, [minimizing, onMinimizeAnimationEnd, window.id])

  useEffect(() => {
    if (!heightTransition) return

    const duration = Number.parseInt(heightTransition.match(/(\d+)ms/)?.[1] ?? '200', 10)
    const timer = globalThis.window.setTimeout(() => setHeightTransition(undefined), duration)

    return () => globalThis.window.clearTimeout(timer)
  }, [frame.size.height, heightTransition])

  const framePath = useMemo(
    () => getWindowFramePath(frame.size.width, frame.size.height),
    [frame.size.width, frame.size.height],
  )
  const windowClassName = `absolute rounded-[.8rem] bg-[var(--system-surface-window)] text-[var(--system-text-primary)] select-none ${
    active
      ? 'shadow-[0_1.15rem_3.2rem_#00000038,0_.2rem_.7rem_#0000001f]'
      : 'shadow-[0_.85rem_2.2rem_#00000026,0_.15rem_.45rem_#0000001a]'
  }`

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      const interaction = interactionRef.current
      if (!interaction) return

      const deltaX = event.clientX - interaction.startPointer.x
      const deltaY = event.clientY - interaction.startPointer.y

      if (interaction.type === 'drag') {
        scheduleDragTransform(clampDragPosition({
          x: interaction.startFrame.position.x + deltaX,
          y: interaction.startFrame.position.y + deltaY,
        }, interaction.startFrame.size))
        return
      }

      const nextFrame = resizeFrame(interaction.direction, interaction.startFrame, deltaX, deltaY, minSizeRef.current)
      frameRef.current = nextFrame
      setFrame(nextFrame)
    }

    const handlePointerUp = () => {
      const interaction = interactionRef.current
      const previewPosition = dragPreviewPositionRef.current

      if (interaction?.type === 'drag' && previewPosition) {
        const nextFrame = {
          ...frameRef.current,
          position: previewPosition,
        }
        frameRef.current = nextFrame
        setFrame(nextFrame)
        onFrameChange(window.id, nextFrame)
      } else if (interaction?.type === 'resize') {
        onFrameChange(window.id, frameRef.current)
      }

      clearDragPreview()
      interactionRef.current = null
      setCursorStyle(undefined)
      document.documentElement.style.cursor = ''
      document.body.style.cursor = ''
    }

    globalThis.window.addEventListener('mousemove', handlePointerMove)
    globalThis.window.addEventListener('mouseup', handlePointerUp)

    return () => {
      globalThis.window.removeEventListener('mousemove', handlePointerMove)
      globalThis.window.removeEventListener('mouseup', handlePointerUp)
      clearDragPreview()
      document.documentElement.style.cursor = ''
      document.body.style.cursor = ''
    }
  }, [clearDragPreview, onFrameChange, scheduleDragTransform, window.id])

  const onWindowMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!resizable) return
    if (interactionRef.current) return
    if (!visibleWindowRef.current) return

    const direction = getResizeDirection(event, visibleWindowRef.current.getBoundingClientRect())
    setCursorStyle(direction ? getResizeCursor(direction) : undefined)
  }

  const onWindowMouseLeave = () => {
    if (!interactionRef.current) setCursorStyle(undefined)
  }

  const onWindowMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    onFocus(window.id)

    if (event.button !== 0) return

    if (!visibleWindowRef.current) return

    const rect = visibleWindowRef.current.getBoundingClientRect()
    const direction = resizable ? getResizeDirection(event, rect) : null

    if (direction) {
      const cursor = getResizeCursor(direction)
      interactionRef.current = {
        type: 'resize',
        direction,
        startPointer: { x: event.clientX, y: event.clientY },
        startFrame: frameRef.current,
      }
      setCursorStyle(cursor)
      document.documentElement.style.cursor = cursor
      document.body.style.cursor = cursor
      event.preventDefault()
      return
    }

    if (shouldStartWindowDrag(event.target, visibleWindowRef.current, event.clientY, draggableTitleBarHeight)) {
      beginDragPreview()
      interactionRef.current = {
        type: 'drag',
        startPointer: { x: event.clientX, y: event.clientY },
        startFrame: frameRef.current,
      }
      event.preventDefault()
    }
  }

  const minimizeToDock = async () => {
    const source = visibleWindowRef.current

    if (!source || !document.startViewTransition) {
      if (source) {
        scheduleWindowSnapshotCapture(window.id, source)
      }
      onFrameChange(window.id, frameRef.current)
      onMinimize(window.id)
      return
    }

    const transitionName = `minimize-window-${window.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    const snapshot = await createWindowSnapshot(source)

    if (snapshot) {
      publishWindowSnapshot(window.id, snapshot)
    }

    source.style.viewTransitionName = transitionName

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        onFrameChange(window.id, frameRef.current)
        onMinimize(window.id)
        onMinimizeAnimationEnd(window.id)
      })

      const target = document.querySelector<HTMLElement>(
        `[data-minimized-window-id="${window.id}"] [data-window-minimize-target="true"]`,
      )
      const slot = target?.closest<HTMLElement>('[data-minimized-window-id]')

      if (slot) {
        forceExpandedMinimizeSlot(slot)
      }

      if (target) {
        target.style.viewTransitionName = transitionName
      }
    })

    void transition.finished.finally(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-minimized-window-id="${window.id}"] [data-window-minimize-target="true"]`,
      )
      const slot = target?.closest<HTMLElement>('[data-minimized-window-id]')

      if (source.isConnected) source.style.viewTransitionName = ''
      if (target) target.style.viewTransitionName = ''
      if (slot) {
        clearForcedMinimizeSlot(slot)
      }
    })
  }

  return (
    <div
      className="absolute"
      data-window-id={window.id}
      onMouseDown={onWindowMouseDown}
      onMouseLeave={onWindowMouseLeave}
      onMouseMove={onWindowMouseMove}
      ref={shellRef}
      style={{
        width: `calc(${frame.size.width}px + ${hitAreaSizeOffsetRem})`,
        height: `calc(${frame.size.height}px + ${hitAreaSizeOffsetRem})`,
        cursor: cursorStyle,
        contain: minimizing ? 'paint' : undefined,
        opacity: minimizeAnimationStyle?.opacity ?? 1,
        pointerEvents: minimizing ? 'none' : undefined,
        transform: minimizeAnimationStyle?.transform ?? `translate(calc(${frame.position.x}px - ${resizeHandleSizeRem}), calc(${frame.position.y}px - ${resizeHandleSizeRem}))`,
        transformOrigin: 'top left',
        transition: minimizeAnimationStyle?.transition ?? heightTransition,
        willChange: minimizing ? 'transform, opacity' : undefined,
        zIndex: window.zIndex,
      }}
    >
      <div
        className={windowClassName}
        ref={visibleWindowRef}
        style={{
          width: frame.size.width,
          height: frame.size.height,
          transition: heightTransition,
          transform: `translate(${resizeHandleSizeRem}, ${resizeHandleSizeRem})`,
        }}
      >
        <div className="relative overflow-hidden rounded-[.8rem] w-full h-full" style={{ zIndex: 1 }}>
          <FocusContext.Provider value={focusContextValue}>
            <ResizeContext.Provider value={resizeContextValue}>
            {fullSizeContentView ? (
              <>
                <div
                  className="absolute z-100 pointer-events-none"
                  style={{
                    left: `${trafficLightsLeftRem}rem`,
                    top: `${trafficLightsTopRem}rem`,
                  }}
                >
                  <TrafficLights
                    active={active}
                    title={window.title}
                    zoomDisabled={zoomDisabled}
                    minimizeDisabled={minimizeDisabled}
                    onClose={() => onClose(window.id)}
                    onMinimize={minimizeToDock}
                  />
                </div>
                <div className="w-full h-full">{children}</div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className={`relative box-border h-[2rem] flex-[0_0_2rem] ${active ? 'bg-[var(--system-surface-window-title)]' : 'bg-[var(--system-surface-window-inactive)]'} flex items-center justify-center`}>
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${trafficLightsLeftRem}rem`,
                      top: `${trafficLightsTopRem}rem`,
                    }}
                  >
                    <TrafficLights
                      active={active}
                      title={window.title}
                      zoomDisabled={zoomDisabled}
                      minimizeDisabled={minimizeDisabled}
                      onClose={() => onClose(window.id)}
                      onMinimize={minimizeToDock}
                    />
                  </div>
                  <div className="max-w-[calc(100%-8rem)] overflow-hidden text-ellipsis whitespace-nowrap text-center text-#2f2f2f text-[.9rem] font-700">
                    {window.title}
                  </div>
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute left-0 bottom-0 w-full"
                    height="1"
                    preserveAspectRatio="none"
                    viewBox="0 0 1 1"
                  >
                    <line
                      stroke={TITLE_BAR_BORDER_COLOR}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      x1="0"
                      x2="1"
                      y1="0.5"
                      y2="0.5"
                    />
                  </svg>
                </div>
                <div className="min-h-0 flex-1">{children}</div>
              </div>
            )}
            </ResizeContext.Provider>
          </FocusContext.Provider>
        </div>
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${frame.size.width} ${frame.size.height}`}
          style={{ zIndex: 2 }}
        >
          <path
            d={framePath}
            fill="none"
            stroke={WINDOW_BORDER_COLOR}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}

export default Window
