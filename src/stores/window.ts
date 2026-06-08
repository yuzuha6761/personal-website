import { create } from 'zustand'
import type { WindowStore } from '~types'
import { getApplicationById } from '../constants/appliction'
import { createWindowState, getNextZIndex } from '../services/window'

const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

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
    }))

    return newWindow.id
  },

  closeWindow: (windowId) => {
    set((state) => {
      const remaining = state.windows.filter((window) => window.id !== windowId)
      const activeClosed = state.activeWindowId === windowId

      return {
        windows: remaining,
        activeWindowId: activeClosed
          ? remaining.at(-1)?.id ?? null
          : state.activeWindowId,
      }
    })
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
        windows: state.windows.map((window) =>
          window.id === windowId ? { ...window, zIndex } : window,
        ),
      }
    })
  },
}))

export default useWindowStore
