import type { AppId } from '../app'
import type { OpenWindowOptions, WindowState } from '../window'

export type FocusTarget =
  | { type: 'desktop' }
  | { type: 'window'; windowId: string }

export interface WindowStore {
  windows: WindowState[]
  activeWindowId: string | null
  focusedTarget: FocusTarget
  openApp: (appId: AppId, options?: OpenWindowOptions) => string
  openWindow: (appId: AppId, options?: OpenWindowOptions) => string
  closeWindow: (windowId: string) => void
  focusDesktop: () => void
  focusWindow: (windowId: string) => void
  bringToFront: (windowId: string) => void
  isWindowFocused: (windowId: string) => boolean
}
