import type { Application, WindowState } from '~types'

const DEFAULT_WINDOW_SIZE = { width: 400, height: 300 }
const CASCADE_OFFSET = 24
const INITIAL_POSITION = { x: 100, y: 80 }

export interface CreateWindowStateOptions {
  title?: string
  position?: { x: number; y: number }
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
      width: application.defaultSizeX ?? DEFAULT_WINDOW_SIZE.width,
      height: application.defaultSizeY ?? DEFAULT_WINDOW_SIZE.height,
    },
    minimized: false,
    maximized: false,
    zIndex: options.zIndex ?? 1,
    payload: options.payload,
  }
}
