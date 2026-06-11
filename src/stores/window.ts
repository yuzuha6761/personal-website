import { create } from 'zustand'
import type { AppId, WindowStore } from '~types'
import { getApplicationById } from '../components/applications/registry'
import { createWindowState, getNextZIndex } from '../services/window'
import useAppStore from './app'

function getAppWindows(windows: WindowStore['windows'], appId: AppId) {
  return windows.filter((window) => window.appId === appId)
}

function getVisibleAppWindows(windows: WindowStore['windows'], appId: AppId) {
  return getAppWindows(windows, appId).filter((window) => !window.minimized)
}

function getFrontmostWindow(windows: WindowStore['windows'], appId: AppId) {
  return getVisibleAppWindows(windows, appId)
    .sort((left, right) => right.zIndex - left.zIndex)[0]
}

const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  focusedTarget: { type: 'desktop' },

  openApp: (appId, options) => {
    const application = getApplicationById(appId)
    if (!application) {
      throw new Error(`Unknown application: ${appId}`)
    }

    useAppStore.getState().launchApp(appId)

    const appWindows = getAppWindows(get().windows, appId)
    const visibleWindows = getVisibleAppWindows(get().windows, appId)

    if (application.singleInstance) {
      const existing = appWindows[0]
      if (existing) {
        if (existing.minimized) {
          set((state) => ({
            windows: state.windows.map((window) => (
              window.id === existing.id ? { ...window, minimized: false } : window
            )),
          }))
        }
        get().focusWindow(existing.id)
        return existing.id
      }
    } else if (visibleWindows.length > 0) {
      const frontmost = getFrontmostWindow(get().windows, appId)!
      get().focusWindow(frontmost.id)
      return frontmost.id
    } else if (appWindows.length > 0) {
      set((state) => ({
        windows: state.windows.map((window) => (
          window.appId === appId ? { ...window, minimized: false } : window
        )),
      }))
      const frontmost = getFrontmostWindow(get().windows, appId)!
      get().focusWindow(frontmost.id)
      return frontmost.id
    }

    return get().openWindow(appId, options)
  },

  openWindow: (appId, options) => {
    const application = getApplicationById(appId)
    if (!application) {
      throw new Error(`Unknown application: ${appId}`)
    }

    useAppStore.getState().launchApp(appId)

    const siblings = get().windows.filter((window) => window.appId === appId)
    const newWindow = createWindowState(application, {
      title: options?.title,
      position: options?.position,
      payload: options?.payload,
      siblingCount: siblings.length,
      zIndex: getNextZIndex(get().windows),
    })

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
      focusedTarget: { type: 'window', windowId: newWindow.id },
    }))

    useAppStore.getState().activateApp(appId)

    return newWindow.id
  },

  closeWindow: (windowId) => {
    const closedWindow = get().windows.find((window) => window.id === windowId)

    set((state) => {
      const remaining = state.windows.filter((window) => window.id !== windowId)
      const activeClosed = state.activeWindowId === windowId
      const focusedClosed = state.focusedTarget.type === 'window'
        && state.focusedTarget.windowId === windowId
      const nextActiveWindowId = activeClosed
        ? remaining.at(-1)?.id ?? null
        : state.activeWindowId

      return {
        windows: remaining,
        activeWindowId: nextActiveWindowId,
        focusedTarget: focusedClosed
          ? nextActiveWindowId
            ? { type: 'window', windowId: nextActiveWindowId }
            : { type: 'desktop' }
          : state.focusedTarget,
      }
    })

    if (closedWindow) {
      useAppStore.getState().activateApp(closedWindow.appId)
    }
  },

  hideApp: (appId) => {
    if (!useAppStore.getState().isAppRunning(appId)) return

    set((state) => {
      const { focusedTarget } = state
      const activeWindow = state.activeWindowId
        ? state.windows.find((window) => window.id === state.activeWindowId)
        : undefined
      const focusedWindow = focusedTarget.type === 'window'
        ? state.windows.find((window) => window.id === focusedTarget.windowId)
        : undefined
      const hideActiveWindow = activeWindow?.appId === appId
      const hideFocusedWindow = focusedWindow?.appId === appId

      return {
        windows: state.windows.map((window) => (
          window.appId === appId ? { ...window, minimized: true } : window
        )),
        activeWindowId: hideActiveWindow ? null : state.activeWindowId,
        focusedTarget: hideFocusedWindow ? { type: 'desktop' } : state.focusedTarget,
      }
    })

    useAppStore.getState().activateApp(appId)
  },

  quitApp: (appId) => {
    set((state) => {
      const { focusedTarget } = state
      const remaining = state.windows.filter((window) => window.appId !== appId)
      const activeClosed = state.activeWindowId
        ? !remaining.some((window) => window.id === state.activeWindowId)
        : false
      const focusedClosed = focusedTarget.type === 'window'
        ? !remaining.some((window) => window.id === focusedTarget.windowId)
        : false
      const nextActiveWindowId = activeClosed
        ? remaining.at(-1)?.id ?? null
        : state.activeWindowId

      return {
        windows: remaining,
        activeWindowId: nextActiveWindowId,
        focusedTarget: focusedClosed
          ? nextActiveWindowId
            ? { type: 'window', windowId: nextActiveWindowId }
            : { type: 'desktop' }
          : state.focusedTarget,
      }
    })

    useAppStore.getState().quitApp(appId)
  },

  focusDesktop: () => {
    set({ focusedTarget: { type: 'desktop' } })
  },

  focusWindow: (windowId) => {
    const window = get().windows.find((item) => item.id === windowId)
    if (!window) return

    get().bringToFront(windowId)
  },

  bringToFront: (windowId) => {
    set((state) => {
      const target = state.windows.find((window) => window.id === windowId)
      if (!target) return state

      const zIndex = getNextZIndex(state.windows)

      return {
        activeWindowId: windowId,
        focusedTarget: { type: 'window', windowId },
        windows: state.windows.map((window) =>
          window.id === windowId ? { ...window, zIndex, minimized: false } : window,
        ),
      }
    })

    const window = get().windows.find((item) => item.id === windowId)
    if (window) {
      useAppStore.getState().activateApp(window.appId)
    }
  },

  isWindowFocused: (windowId) => {
    const { focusedTarget } = get()

    return focusedTarget.type === 'window' && focusedTarget.windowId === windowId
  },
}))

export default useWindowStore
