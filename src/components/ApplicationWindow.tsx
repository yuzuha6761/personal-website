import type { MouseEvent as ReactMouseEvent } from 'react'
import type { WindowState } from '~types'
import { resolveApplication } from './applications/registry'
import fullscreenIcon from '~assets/common/window-fullscreen.svg'
import { Circle, Minus, Plus, X } from 'lucide-react'
import { AppIcon } from './icons/AppIcon'

interface ApplicationWindowProps {
  active: boolean
  window: WindowState
  onClose: (windowId: string) => void
  onFocus: (windowId: string) => void
}

interface TrafficLightsProps {
  active: boolean
  title: string
  documentDirty?: boolean
  onClose: () => void
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
const DEFAULT_TRAFFIC_LIGHT_POSITION_REM = { top: 0.78, left: 0.78 }
const STANDARD_TITLE_BAR_HEIGHT_REM = 2.75
const WINDOW_TITLE_BAR_HEIGHT = 38
const WINDOW_RESIZE_HANDLE_SIZE_REM = 0.25
const MIN_WINDOW_SIZE = { width: 320, height: 220 }
const SCREEN_EDGE_MARGIN = 24
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
  const { active, title, documentDirty = false, onClose } = props
  const [optionKeyPressed, setOptionKeyPressed] = useState(false)
  const glyphVisibilityClass = active ? 'group-hover:opacity-50' : 'opacity-0'
  const inactiveLightClass = 'border border-#d3d3d3 bg-#e6e6e6'
  const closeLightClass = active ? 'border border-#e0443e bg-#ff5f56' : inactiveLightClass
  const minimizeLightClass = active ? 'border border-#dea123 bg-#ffbd2e' : inactiveLightClass
  const zoomLightClass = active ? 'border border-#1aab29 bg-#27c93f' : inactiveLightClass

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
      className="group gap-[.43rem] pointer-events-auto flex items-center"
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
          className={`${trafficLightGlyphBaseClass} ${glyphVisibilityClass} ${documentDirty ? 'fill-current text-#4d0000' : 'text-#4d0000'}`}
          icon={documentDirty ? Circle : X}
          strokeWidth={documentDirty ? 0 : 2.5}
        />
      </div>
      <div
        aria-label={`Minimize ${title}`}
        className={`${trafficLightBaseClass} ${minimizeLightClass}`}
        role="button"
        tabIndex={0}
      >
        <AppIcon
          className={`${trafficLightGlyphBaseClass} ${glyphVisibilityClass} text-#171717`}
          icon={Minus}
          strokeWidth={2.5}
        />
      </div>
      <div
        aria-label={`${optionKeyPressed ? 'Zoom' : 'Enter fullscreen'} ${title}`}
        className={`${trafficLightBaseClass} ${zoomLightClass}`}
        role="button"
        tabIndex={0}
      >
        {optionKeyPressed
          ? (
              <AppIcon
                className={`${trafficLightGlyphBaseClass} ${glyphVisibilityClass} text-#171717`}
                icon={Plus}
                strokeWidth={2.5}
              />
            )
          : (
              <img
                className={`${trafficLightGlyphBaseClass} ${glyphVisibilityClass}`}
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
  } = props
  const { children, windowOptions } = resolveApplication(window.appId)
  const {
    fullSizeContentView = false,
    trafficLightsPosition,
  } = windowOptions
  const [frame, setFrame] = useState<WindowFrame>({
    position: window.position,
    size: window.size,
  })
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
  const windowClassName = `absolute overflow-hidden border border-#cdcdcd rounded-[.7rem] bg-white text-#1f2933 select-none ${
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
    const direction = getResizeDirection(event, rect)

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
          transform: `translate(${resizeHandleSizeRem}, ${resizeHandleSizeRem})`,
        }}
      >
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
                onClose={() => onClose(window.id)}
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
                  onClose={() => onClose(window.id)}
                />
              </div>
              <div className="max-w-[calc(100%-8rem)] overflow-hidden text-ellipsis whitespace-nowrap text-center text-#2f2f2f text-[1.08rem] font-700">
                {window.title}
              </div>
            </div>
            <div className="min-h-0 flex-1">{children}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationWindow
