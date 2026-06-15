import type { ApplicationWindowHandlers, WindowState } from '~types'

export const SYSTEM_SETTINGS_WINDOW_KIND = {
  MAIN: 'main',
} as const

export type SystemSettingsWindowKind = typeof SYSTEM_SETTINGS_WINDOW_KIND[keyof typeof SYSTEM_SETTINGS_WINDOW_KIND]

export function getSystemSettingsWindowKind(payload?: Record<string, unknown>): SystemSettingsWindowKind {
  if (payload?.windowKind === SYSTEM_SETTINGS_WINDOW_KIND.MAIN) {
    return SYSTEM_SETTINGS_WINDOW_KIND.MAIN
  }

  return SYSTEM_SETTINGS_WINDOW_KIND.MAIN
}

export function findSystemSettingsMainWindow(windows: WindowState[]) {
  return windows.find((window) => (
    window.appId === 'system-settings'
    && getSystemSettingsWindowKind(window.payload) === SYSTEM_SETTINGS_WINDOW_KIND.MAIN
  ))
}

export function isSystemSettingsMainWindow(window: WindowState) {
  return window.appId === 'system-settings'
    && getSystemSettingsWindowKind(window.payload) === SYSTEM_SETTINGS_WINDOW_KIND.MAIN
}

export const applicationWindowHandlers: ApplicationWindowHandlers = {
  openApp({ windows, openWindow, focusWindow, restoreWindow }) {
    const mainWindow = findSystemSettingsMainWindow(windows)
    if (!mainWindow) {
      return openWindow('system-settings', { payload: { windowKind: SYSTEM_SETTINGS_WINDOW_KIND.MAIN } })
    }

    if (mainWindow.minimized) {
      restoreWindow(mainWindow.id)
    }

    focusWindow(mainWindow.id)
    return mainWindow.id
  },

  resolveOpenWindowPayload() {
    return { windowKind: SYSTEM_SETTINGS_WINDOW_KIND.MAIN }
  },

  onCloseWindow({ window }) {
    if (isSystemSettingsMainWindow(window)) {
      return 'quit'
    }
  },
}
