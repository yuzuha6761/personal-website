import type { MouseEvent as ReactMouseEvent } from 'react'
import type { WindowState } from '~types'
import { resolveApplication } from './applications/registry'
import fullscreenIcon from '~assets/common/window-fullscreen.svg'
import { Circle, Minus, Plus, X } from 'lucide-react'
import { AppIcon } from './icons/AppIcon'
import { ApplicationWindowFocusContext } from './ApplicationWindowFocusContext'
import { ApplicationWindowResizeContext } from './ApplicationWindowResizeContext'

interface ApplicationWindowProps {
  active: boolean
  window: WindowState
  onClose: (windowId: string) => void
  onFocus: (windowId: string) => void
  onMinimize: (windowId: string) => void
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
const DEFAULT_TRAFFIC_LIGHT_POSITION_REM = { top: 0.55, left: 0.55 }
const STANDARD_TITLE_BAR_HEIGHT_REM = 2.75
const WINDOW_TITLE_BAR_HEIGHT = 38
const WINDOW_RESIZE_HANDLE_SIZE_REM = 0.25
const MIN_WINDOW_SIZE = { width: 320, height: 220 }
const SCREEN_EDGE_MARGIN = 24
const WINDOW_BORDER_RADIUS_REM = 0.7
const WINDOW_BORDER_COLOR = '#cacaca'
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
): WindowFrame {
  const nextFrame: WindowFrame = {
    position: { ...startFrame.position },
    size: { ...startFrame.size },
  }

  if (direction.includes('e')) {
    nextFrame.size.width = Math.max(MIN_WINDOW_SIZE.width, startFrame.size.width + deltaX)
  }

  if (direction.includes('s')) {
    nextFrame.size.height = Math.max(MIN_WINDOW_SIZE.height, startFrame.size.height + deltaY)
  }

  if (direction.includes('w')) {
    const width = Math.max(MIN_WINDOW_SIZE.width, startFrame.size.width - deltaX)
    nextFrame.position.x = startFrame.position.x + startFrame.size.width - width
    nextFrame.size.width = width
  }

  if (direction.includes('n')) {
    const height = Math.max(MIN_WINDOW_SIZE.height, startFrame.size.height - deltaY)
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
  const getGlyphVisibilityClass = (disabled = false) => (
    disabled ? 'opacity-0' : 'opacity-0 group-hover:opacity-50'
  )
  const inactiveLightBaseClass = 'border border-#cecdcd bg-#cecdcd'
  const closeLightClass = active
    ? 'border border-#e0443e bg-#ff5f56'
    : `${inactiveLightBaseClass} group-hover:border-#e0443e group-hover:bg-#ff5f56`
  const minimizeLightClass = minimizeDisabled
    ? inactiveLightBaseClass
    : active
      ? 'border border-#dea123 bg-#ffbd2e'
      : `${inactiveLightBaseClass} group-hover:border-#dea123 group-hover:bg-#ffbd2e`
  const zoomLightClass = zoomDisabled
    ? inactiveLightBaseClass
    : active
      ? 'border border-#1aab29 bg-#27c93f'
      : `${inactiveLightBaseClass} group-hover:border-#1aab29 group-hover:bg-#27c93f`

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
      className="gap-[.5rem] pointer-events-auto flex items-center"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div
        aria-label={`Close ${title}`}
        className={`group ${trafficLightBaseClass} ${closeLightClass}`}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        role="button"
        tabIndex={0}
      >
        <AppIcon
          className={`${trafficLightGlyphBaseClass} ${getGlyphVisibilityClass()} ${documentDirty ? 'fill-current text-#4d0000' : 'text-#4d0000'}`}
          icon={documentDirty ? Circle : X}
          strokeWidth={documentDirty ? 0 : 2.5}
        />
      </div>
      <div
        aria-disabled={minimizeDisabled}
        aria-label={`Minimize ${title}`}
        className={`group ${trafficLightBaseClass} ${minimizeLightClass} ${minimizeDisabled ? 'pointer-events-none' : ''}`}
        onClick={(event) => {
          event.stopPropagation()
          onMinimize()
        }}
        role="button"
        tabIndex={minimizeDisabled ? -1 : 0}
      >
        <AppIcon
          className={`${trafficLightGlyphBaseClass} ${getGlyphVisibilityClass(minimizeDisabled)} text-#171717`}
          icon={Minus}
          strokeWidth={2.5}
        />
      </div>
      <div
        aria-disabled={zoomDisabled}
        aria-label={`${optionKeyPressed ? 'Zoom' : 'Enter fullscreen'} ${title}`}
        className={`group ${trafficLightBaseClass} ${zoomLightClass} ${zoomDisabled ? 'pointer-events-none' : ''}`}
        role="button"
        tabIndex={zoomDisabled ? -1 : 0}
      >
        {optionKeyPressed
          ? (
              <AppIcon
                className={`${trafficLightGlyphBaseClass} ${getGlyphVisibilityClass(zoomDisabled)} text-#171717`}
                icon={Plus}
                strokeWidth={2.5}
              />
            )
          : (
              <img
                className={`${trafficLightGlyphBaseClass} ${getGlyphVisibilityClass(zoomDisabled)}`}
                src={fullscreenIcon}
                alt=""
              />
            )}
      </div>
    </div>
  )
}

function ApplicationWindow(props: ApplicationWindowProps) {
  const {
    active,
    window,
    onClose,
    onFocus,
    onMinimize,
  } = props
  const { children, windowOptions } = resolveApplication(window.appId, window)
  const {
    fullSizeContentView = false,
    trafficLightsPosition,
    zoomDisabled = false,
    minimizeDisabled = false,
    resizable = true,
  } = windowOptions
  const [frame, setFrame] = useState<WindowFrame>({
    position: window.position,
    size: window.size,
  })
  const frameHeightRef = useRef(frame.size.height)
  frameHeightRef.current = frame.size.height
  const [heightTransition, setHeightTransition] = useState<string>()
  const [cursorStyle, setCursorStyle] = useState<string>()
  const interactionRef = useRef<WindowInteraction | null>(null)
  const visibleWindowRef = useRef<HTMLDivElement>(null)
  const resizeHandleSizeRem = `${WINDOW_RESIZE_HANDLE_SIZE_REM}rem`
  const hitAreaSizeOffsetRem = `${WINDOW_RESIZE_HANDLE_SIZE_REM * 2}rem`
  const trafficLightsTopRem = fullSizeContentView
    ? trafficLightsPosition?.top ?? DEFAULT_TRAFFIC_LIGHT_POSITION_REM.top
    : 0.92
  const trafficLightsLeftRem = fullSizeContentView
    ? trafficLightsPosition?.left ?? DEFAULT_TRAFFIC_LIGHT_POSITION_REM.left
    : 1
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
  const windowClassName = `absolute rounded-[.7rem] bg-white text-#1f2933 select-none ${
    active
      ? 'shadow-[0_1.15rem_3.2rem_#00000038,0_.2rem_.7rem_#0000001f]'
      : '[filter:saturate(.88)_brightness(.96)] shadow-[0_.85rem_2.2rem_#00000026,0_.15rem_.45rem_#0000001a]'
  }`

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      const interaction = interactionRef.current
      if (!interaction) return

      const deltaX = event.clientX - interaction.startPointer.x
      const deltaY = event.clientY - interaction.startPointer.y

      if (interaction.type === 'drag') {
        setFrame((currentFrame) => ({
          ...currentFrame,
          position: {
            x: clamp(
              interaction.startFrame.position.x + deltaX,
              SCREEN_EDGE_MARGIN - interaction.startFrame.size.width,
              globalThis.window.innerWidth - SCREEN_EDGE_MARGIN,
            ),
            y: clamp(
              interaction.startFrame.position.y + deltaY,
              0,
              globalThis.window.innerHeight - SCREEN_EDGE_MARGIN,
            ),
          },
        }))
        return
      }

      setFrame(resizeFrame(interaction.direction, interaction.startFrame, deltaX, deltaY))
    }

    const handlePointerUp = () => {
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
      document.documentElement.style.cursor = ''
      document.body.style.cursor = ''
    }
  }, [])

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
        startFrame: frame,
      }
      setCursorStyle(cursor)
      document.documentElement.style.cursor = cursor
      document.body.style.cursor = cursor
      event.preventDefault()
      return
    }

    const localY = event.clientY - rect.top
    if (localY <= draggableTitleBarHeight) {
      interactionRef.current = {
        type: 'drag',
        startPointer: { x: event.clientX, y: event.clientY },
        startFrame: frame,
      }
      event.preventDefault()
    }
  }

  return (
    <div
      className="absolute"
      onMouseDown={onWindowMouseDown}
      onMouseLeave={onWindowMouseLeave}
      onMouseMove={onWindowMouseMove}
      style={{
        width: `calc(${frame.size.width}px + ${hitAreaSizeOffsetRem})`,
        height: `calc(${frame.size.height}px + ${hitAreaSizeOffsetRem})`,
        cursor: cursorStyle,
        transform: `translate(calc(${frame.position.x}px - ${resizeHandleSizeRem}), calc(${frame.position.y}px - ${resizeHandleSizeRem}))`,
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
        <div className="relative overflow-hidden rounded-[.7rem] w-full h-full" style={{ zIndex: 1 }}>
          <ApplicationWindowFocusContext.Provider value={{ focused: active, windowId: window.id }}>
            <ApplicationWindowResizeContext.Provider value={resizeContextValue}>
            {fullSizeContentView ? (
              <>
                <div
                  className="absolute z-2 pointer-events-none"
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
                    onMinimize={() => onMinimize(window.id)}
                  />
                </div>
                <div className="w-full h-full">{children}</div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className="relative box-border h-[2.75rem] flex-[0_0_2.75rem] border-b border-b-#d0d0d0 bg-#ececec flex items-center justify-center">
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
                      onMinimize={() => onMinimize(window.id)}
                    />
                  </div>
                  <div className="max-w-[calc(100%-8rem)] overflow-hidden text-ellipsis whitespace-nowrap text-center text-#2f2f2f text-[1.08rem] font-700">
                    {window.title}
                  </div>
                </div>
                <div className="min-h-0 flex-1">{children}</div>
              </div>
            )}
            </ApplicationWindowResizeContext.Provider>
          </ApplicationWindowFocusContext.Provider>
        </div>
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={frame.size.width}
          height={frame.size.height}
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

export default ApplicationWindow
