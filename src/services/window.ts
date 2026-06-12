import type { Application, WindowRemSize, WindowState } from '~types'

const DEFAULT_WINDOW_SIZE = { width: 400, height: 300 }
const CASCADE_OFFSET = 24
const INITIAL_POSITION = { x: 100, y: 80 }

export interface CreateWindowStateOptions {
  title?: string
  position?: { x: number; y: number }
  size?: { width?: number; height?: number }
  zIndex?: number
  payload?: Record<string, unknown>
  siblingCount?: number
}

export function cascadePosition(siblingCount: number) {
  const offset = siblingCount * CASCADE_OFFSET
  return {
    x: INITIAL_POSITION.x + offset,
    y: INITIAL_POSITION.y + offset,
  }
}

export function getNextZIndex(windows: WindowState[]): number {
  if (windows.length === 0) return 1
  return Math.max(...windows.map((window) => window.zIndex)) + 1
}

export function createWindowState(
  application: Application,
  options: CreateWindowStateOptions = {},
): WindowState {
  const siblingCount = options.siblingCount ?? 0

  return {
    id: crypto.randomUUID(),
    appId: application.id,
    title: options.title ?? application.name,
    position: options.position ?? cascadePosition(siblingCount),
    size: {
      width: options.size?.width ?? application.defaultSizeX ?? DEFAULT_WINDOW_SIZE.width,
      height: options.size?.height ?? application.defaultSizeY ?? DEFAULT_WINDOW_SIZE.height,
    },
    minimized: false,
    maximized: false,
    zIndex: options.zIndex ?? 1,
    openedAt: Date.now(),
    payload: options.payload,
  }
}

export function getRootFontSize() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

export function remSizeToPx(size: WindowRemSize) {
  const rootFontSize = getRootFontSize()

  return {
    ...(size.width !== undefined ? { width: rootFontSize * size.width } : {}),
    ...(size.height !== undefined ? { height: rootFontSize * size.height } : {}),
  }
}

export function resolveRemSizeToPx(
  size: WindowRemSize | undefined,
  defaultsPx: { width: number; height: number },
) {
  const partialPx = size ? remSizeToPx(size) : {}

  return {
    width: partialPx.width ?? defaultsPx.width,
    height: partialPx.height ?? defaultsPx.height,
  }
}

export function sortWindowsByOpenedAt(windows: WindowState[]) {
  return [...windows].sort((left, right) => right.openedAt - left.openedAt)
}
