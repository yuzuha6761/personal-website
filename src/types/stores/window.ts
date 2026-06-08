import type { AppId } from '../app'
import type { OpenWindowOptions, WindowState } from '../window'

export interface WindowStore {
  windows: WindowState[]
  activeWindowId: string | null
  openApp: (appId: AppId, options?: OpenWindowOptions) => string
  openWindow: (appId: AppId, options?: OpenWindowOptions) => string
  closeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  bringToFront: (windowId: string) => void
}
