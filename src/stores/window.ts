import { create } from 'zustand'
import type { WindowStore } from '~types'
import { getApplicationById } from '../components/applications/registry'
import { createWindowState, getNextZIndex } from '../services/window'

const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  focusedTarget: { type: 'desktop' },

  openApp: (appId, options) => {
    const application = getApplicationById(appId)
    if (!application) {
      throw new Error(`Unknown application: ${appId}`)
    }

    if (application.singleInstance) {
      const existing = get().windows.find((window) => window.appId === appId)
      if (existing) {
        get().focusWindow(existing.id)
        return existing.id
      }
    }

    return get().openWindow(appId, options)
  },

  openWindow: (appId, options) => {
    const application = getApplicationById(appId)
    if (!application) {
      throw new Error(`Unknown application: ${appId}`)
    }

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

    return newWindow.id
  },

  closeWindow: (windowId) => {
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
          window.id === windowId ? { ...window, zIndex } : window,
        ),
      }
    })
  },

  isWindowFocused: (windowId) => {
    const { focusedTarget } = get()

    return focusedTarget.type === 'window' && focusedTarget.windowId === windowId
  },
}))

export default useWindowStore
