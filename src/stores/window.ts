import { create } from 'zustand'
import type { AppId, WindowStore } from '~types'
import {
  getApplicationById,
  getApplicationWindowHandlers,
  isApplicationLoaded,
  preloadApplication,
} from '~/components/applications/registry'
import { SEEKER_WINDOW_KIND } from '~/components/applications/Seeker/windows'
import { createWindowState, getNextZIndex } from '~/services/window'
import { prepareWindowRestoreTransition } from '~/services/window-restore-transition'
import useAppStore from './app'

const DOCK_ICON_BOUNCE_DURATION_MS = 624

function startDockOpeningBounce(appId: AppId) {
  const appStore = useAppStore.getState()
  if (appStore.isAppRunning(appId) || appStore.isAppLoading(appId)) return

  const loadingStartedAt = Date.now()
  appStore.startLoadingApp(appId)
  finishLoadingAppAfterCurrentBounce(appId, loadingStartedAt)
}

function finishLoadingAppAfterCurrentBounce(appId: AppId, startedAt: number) {
  const elapsed = Date.now() - startedAt
  const currentCycleElapsed = elapsed % DOCK_ICON_BOUNCE_DURATION_MS
  const delay = elapsed < DOCK_ICON_BOUNCE_DURATION_MS
    ? DOCK_ICON_BOUNCE_DURATION_MS - elapsed
    : currentCycleElapsed === 0
      ? 0
      : DOCK_ICON_BOUNCE_DURATION_MS - currentCycleElapsed

  window.setTimeout(() => {
    useAppStore.getState().finishLoadingApp(appId)
  }, delay)
}

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

function getLastMinimizedWindow(windows: WindowStore['windows']) {
  return windows
    .filter((window) => window.minimized)
    .sort((left, right) => (
      (right.minimizedAt ?? 0) - (left.minimizedAt ?? 0)
      || right.zIndex - left.zIndex
      || right.openedAt - left.openedAt
    ))[0]
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

    if (!isApplicationLoaded(appId)) {
      const appStore = useAppStore.getState()
      if (appStore.isAppLoading(appId)) return ''

      const loadingStartedAt = Date.now()
      appStore.startLoadingApp(appId)
      void preloadApplication(appId)
        .then(() => get().openApp(appId, options))
        .catch((error) => console.error(`Failed to load application "${appId}"`, error))
        .finally(() => finishLoadingAppAfterCurrentBounce(appId, loadingStartedAt))
      return ''
    }

    startDockOpeningBounce(appId)
    useAppStore.getState().launchApp(appId)

    const windowHandlers = getApplicationWindowHandlers(appId)
    if (windowHandlers?.openApp) {
      const handledWindowId = windowHandlers.openApp({
        appId,
        windows: get().windows,
        options,
        openWindow: (targetAppId, targetOptions) => get().openWindow(targetAppId, targetOptions),
        focusWindow: (windowId) => get().focusWindow(windowId),
        restoreWindow: (windowId) => get().focusWindow(windowId),
      })

      if (handledWindowId) return handledWindowId
    }

    const appWindows = getAppWindows(get().windows, appId)
    const visibleWindows = getVisibleAppWindows(get().windows, appId)

    if (visibleWindows.length > 0) {
      const frontmost = getFrontmostWindow(get().windows, appId)!
      get().focusWindow(frontmost.id)
      return frontmost.id
    }

    if (appWindows.length > 0) {
      const lastMinimized = getLastMinimizedWindow(appWindows)!
      get().focusWindow(lastMinimized.id)
      return lastMinimized.id
    }

    return get().openWindow(appId, options)
  },

  openWindow: (appId, options) => {
    const application = getApplicationById(appId)
    if (!application) {
      throw new Error(`Unknown application: ${appId}`)
    }

    if (!isApplicationLoaded(appId)) {
      const appStore = useAppStore.getState()
      if (appStore.isAppLoading(appId)) return ''

      const loadingStartedAt = Date.now()
      appStore.startLoadingApp(appId)
      void preloadApplication(appId)
        .then(() => get().openWindow(appId, options))
        .catch((error) => console.error(`Failed to load application "${appId}"`, error))
        .finally(() => finishLoadingAppAfterCurrentBounce(appId, loadingStartedAt))
      return ''
    }

    startDockOpeningBounce(appId)
    useAppStore.getState().launchApp(appId)

    const siblings = get().windows.filter((window) => window.appId === appId)
    const handlerPayload = getApplicationWindowHandlers(appId)?.resolveOpenWindowPayload?.({
      appId,
      options,
    })
    let payload = options?.payload

    if (handlerPayload) {
      payload = { ...handlerPayload, ...options?.payload }
    } else if (application.id === 'seeker') {
      payload = { windowKind: SEEKER_WINDOW_KIND.MAIN, ...options?.payload }
    }

    const newWindow = createWindowState(application, {
      title: options?.title,
      position: options?.position,
      size: options?.size,
      payload,
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

  minimizeWindow: (windowId) => {
    const window = get().windows.find((item) => item.id === windowId)
    if (!window || window.minimized) return

    const minimizedAt = Date.now()

    set((state) => {
      const { focusedTarget } = state
      const focusedMinimized = focusedTarget.type === 'window'
        && focusedTarget.windowId === windowId

      return {
        windows: state.windows.map((item) => (
          item.id === windowId ? { ...item, minimized: true, minimizedAt } : item
        )),
        activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
        focusedTarget: focusedMinimized ? { type: 'desktop' } : state.focusedTarget,
      }
    })

    useAppStore.getState().activateApp(window.appId)
  },

  updateWindowFrame: (windowId, frame) => {
    set((state) => ({
      windows: state.windows.map((window) => (
        window.id === windowId
          ? {
              ...window,
              position: frame.position,
              size: frame.size,
            }
          : window
      )),
    }))
  },

  closeWindow: (windowId) => {
    const closedWindow = get().windows.find((window) => window.id === windowId)
    if (!closedWindow) return

    const closeAction = getApplicationWindowHandlers(closedWindow.appId)?.onCloseWindow?.({
      window: closedWindow,
    })

    if (closeAction === 'quit') {
      get().quitApp(closedWindow.appId)
      return
    }

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

    const minimizedAt = Date.now()

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
          window.appId === appId
            ? { ...window, minimized: true, minimizedAt: minimizedAt + window.zIndex }
            : window
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
    useAppStore.getState().activateApp('seeker')
  },

  focusWindow: (windowId) => {
    const window = get().windows.find((item) => item.id === windowId)
    if (!window) return

    get().bringToFront(windowId)
  },

  bringToFront: (windowId) => {
    const targetWindow = get().windows.find((window) => window.id === windowId)
    const updateFocusState = () => set((state) => {
      const target = state.windows.find((window) => window.id === windowId)
      if (!target) return state

      const zIndex = getNextZIndex(state.windows)

      return {
        activeWindowId: windowId,
        focusedTarget: { type: 'window', windowId },
        windows: state.windows.map((window) =>
          window.id === windowId
            ? { ...window, zIndex, minimized: false, minimizedAt: undefined }
            : window,
        ),
      }
    })

    if (targetWindow?.minimized) prepareWindowRestoreTransition(windowId)
    updateFocusState()

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
