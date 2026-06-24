import type { AppId } from './app'
import type { OpenWindowOptions, WindowState } from './window'

export interface ApplicationOpenAppContext {
  appId: AppId
  windows: WindowState[]
  options?: OpenWindowOptions
  openWindow: (appId: AppId, options?: OpenWindowOptions) => string
  focusWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
}

export interface ApplicationOpenWindowContext {
  appId: AppId
  options?: OpenWindowOptions
}

export interface ApplicationWindowCloseContext {
  window: WindowState
}

export type ApplicationWindowCloseAction = 'quit'

export interface ApplicationWindowOpenedContext {
  window: WindowState
}

export interface ApplicationWindowHandlers {
  openApp?: (context: ApplicationOpenAppContext) => string | undefined
  resolveOpenWindowPayload?: (context: ApplicationOpenWindowContext) => Record<string, unknown> | undefined
  onWindowOpened?: (context: ApplicationWindowOpenedContext) => void
  onCloseWindow?: (context: ApplicationWindowCloseContext) => ApplicationWindowCloseAction | undefined
}
