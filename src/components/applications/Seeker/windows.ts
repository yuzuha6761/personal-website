import type {
  ApplicationWindowHandlers,
  FocusTarget,
  WindowDisplayOptions,
  OpenWindowOptions,
  WindowState,
} from '~types'
import { aboutWindowOptions } from './About/window'
import { mainWindowOptions } from './Main/window'
import { settingsWindowOptions } from './Settings/window'
import { resolveRemSizeToPx } from '~/services/window'

export const SEEKER_WINDOW_KIND = {
  MAIN: 'main',
  ABOUT: 'about',
  SETTINGS: 'settings',
} as const

export type SeekerWindowKind = typeof SEEKER_WINDOW_KIND[keyof typeof SEEKER_WINDOW_KIND]

const SETTINGS_WINDOW_SIZE_DEFAULTS_PX = { width: 500, height: 400 }
const ABOUT_WINDOW_SIZE_DEFAULTS_PX = { width: 320, height: 376 }

export function resolveSeekerWindowOptions(
  windowKind: SeekerWindowKind,
): WindowDisplayOptions {
  switch (windowKind) {
    case SEEKER_WINDOW_KIND.ABOUT:
      return aboutWindowOptions
    case SEEKER_WINDOW_KIND.SETTINGS:
      return settingsWindowOptions
    default:
      return mainWindowOptions
  }
}

export function getSeekerMainWindows(windows: WindowState[]) {
  return windows
    .filter((window) => (
      window.appId === 'seeker'
      && getSeekerWindowKind(window.payload) === SEEKER_WINDOW_KIND.MAIN
    ))
    .sort((left, right) => right.openedAt - left.openedAt)
}

export function findSeekerMainWindow(windows: WindowState[]) {
  return getSeekerMainWindows(windows)[0]
}

export function resolveTargetSeekerMainWindowId(
  windows: WindowState[],
  focusedTarget: FocusTarget,
): string | undefined {
  if (focusedTarget.type === 'window') {
    const focused = windows.find((window) => window.id === focusedTarget.windowId)
    if (
      focused?.appId === 'seeker'
      && getSeekerWindowKind(focused.payload) === SEEKER_WINDOW_KIND.MAIN
    ) {
      return focused.id
    }
  }

  return findSeekerMainWindow(windows)?.id
}

export function getSeekerWindowKind(payload?: Record<string, unknown>): SeekerWindowKind {
  if (payload?.windowKind === SEEKER_WINDOW_KIND.ABOUT) return SEEKER_WINDOW_KIND.ABOUT
  if (payload?.windowKind === SEEKER_WINDOW_KIND.SETTINGS) return SEEKER_WINDOW_KIND.SETTINGS
  return SEEKER_WINDOW_KIND.MAIN
}

export function centerWindowPosition(size: { width: number; height: number }) {
  return {
    x: Math.max(24, (globalThis.window.innerWidth - size.width) / 2),
    y: Math.max(24, (globalThis.window.innerHeight - size.height) / 2),
  }
}

export function findSeekerAboutWindow(windows: WindowState[]) {
  return windows.find((window) => (
    window.appId === 'seeker'
    && getSeekerWindowKind(window.payload) === SEEKER_WINDOW_KIND.ABOUT
  ))
}

export function createSeekerAboutWindowOptions(): OpenWindowOptions {
  const size = resolveRemSizeToPx(aboutWindowOptions.size, ABOUT_WINDOW_SIZE_DEFAULTS_PX)

  return {
    title: '关于 Seeker',
    size,
    position: centerWindowPosition(size),
    payload: { windowKind: SEEKER_WINDOW_KIND.ABOUT },
  }
}

export function findSeekerSettingsWindow(windows: WindowState[]) {
  return windows.find((window) => (
    window.appId === 'seeker'
    && getSeekerWindowKind(window.payload) === SEEKER_WINDOW_KIND.SETTINGS
  ))
}

export function createSeekerSettingsWindowOptions(): OpenWindowOptions {
  const size = resolveRemSizeToPx(settingsWindowOptions.size, SETTINGS_WINDOW_SIZE_DEFAULTS_PX)

  return {
    title: 'Seeker 设置',
    size,
    position: centerWindowPosition(size),
    payload: { windowKind: SEEKER_WINDOW_KIND.SETTINGS },
  }
}

export const applicationWindowHandlers: ApplicationWindowHandlers = {
  openApp({ windows, openWindow, focusWindow, restoreWindow }) {
    const mainWindow = findSeekerMainWindow(windows)
    if (!mainWindow) {
      return openWindow('seeker', { payload: { windowKind: SEEKER_WINDOW_KIND.MAIN } })
    }

    if (mainWindow.minimized) {
      restoreWindow(mainWindow.id)
    }

    focusWindow(mainWindow.id)
    return mainWindow.id
  },

  resolveOpenWindowPayload() {
    return { windowKind: SEEKER_WINDOW_KIND.MAIN }
  },
}
