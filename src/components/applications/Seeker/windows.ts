import type { ApplicationWindowDisplayOptions, OpenWindowOptions, WindowState } from '~types'
import { aboutWindowOptions } from './About/window'
import { mainWindowOptions } from './Main/window'
import { settingsWindowOptions } from './Settings/window'

export const SEEKER_WINDOW_KIND = {
  MAIN: 'main',
  ABOUT: 'about',
  SETTINGS: 'settings',
} as const

export type SeekerWindowKind = typeof SEEKER_WINDOW_KIND[keyof typeof SEEKER_WINDOW_KIND]

export const SEEKER_ABOUT_WINDOW_SIZE = { width: 320, height: 380 }
export const SEEKER_SETTINGS_WINDOW_SIZE = { width: 500, height: 400 }

export function resolveSeekerWindowOptions(
  windowKind: SeekerWindowKind,
): ApplicationWindowDisplayOptions {
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
  return {
    title: '关于 Seeker',
    size: SEEKER_ABOUT_WINDOW_SIZE,
    position: centerWindowPosition(SEEKER_ABOUT_WINDOW_SIZE),
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
  return {
    title: 'Seeker 设置',
    size: SEEKER_SETTINGS_WINDOW_SIZE,
    position: centerWindowPosition(SEEKER_SETTINGS_WINDOW_SIZE),
    payload: { windowKind: SEEKER_WINDOW_KIND.SETTINGS },
  }
}
