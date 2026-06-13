import { create } from 'zustand'
import useFsStore, { getPathDisplayLabel } from '~/fs'
import useWindowStore from '~stores/window'
import useSeekerGlobalStore from '../store'
import { resolveTargetSeekerMainWindowId, SEEKER_WINDOW_KIND } from '../windows'
import type {
  SeekerTabState,
  SeekerWindowState,
  SeekerWindowStore,
} from './types'
import { SEEKER_DEFAULT_TAB_PATH as DEFAULT_PATH } from './types'

function getInitialPathFromPayload(payload?: Record<string, unknown>): string {
  const initialPath = payload?.initialPath
  return typeof initialPath === 'string' ? initialPath : DEFAULT_PATH
}

function getPathLabel(path: string): string {
  return getPathDisplayLabel(path, useFsStore.getState().nodes)
}

function createTab(path: string, label?: string): SeekerTabState {
  return {
    id: crypto.randomUUID(),
    path,
    label: label ?? getPathLabel(path),
  }
}

function createWindowState(windowId: string): SeekerWindowState {
  const window = useWindowStore.getState().windows.find((item) => item.id === windowId)
  const initialPath = getInitialPathFromPayload(window?.payload)
  const tab = createTab(initialPath)
  const defaultViewMode = useSeekerGlobalStore.getState().defaultViewMode

  return {
    tabs: [tab],
    activeTabId: tab.id,
    viewMode: defaultViewMode,
    selection: [],
    historyBack: [],
    historyForward: [],
  }
}

function getActiveTab(state: SeekerWindowState): SeekerTabState | undefined {
  return state.tabs.find((tab) => tab.id === state.activeTabId)
}

function updateActiveTab(
  state: SeekerWindowState,
  updater: (tab: SeekerTabState) => SeekerTabState,
): SeekerWindowState {
  const activeTab = getActiveTab(state)
  if (!activeTab) return state

  return {
    ...state,
    tabs: state.tabs.map((tab) => (
      tab.id === activeTab.id ? updater(tab) : tab
    )),
  }
}

const useSeekerWindowStore = create<SeekerWindowStore>((set, get) => ({
  windows: {},

  initWindow: (windowId) => {
    if (get().windows[windowId]) return

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: createWindowState(windowId),
      },
    }))
  },

  removeWindow: (windowId) => {
    set((state) => {
      if (!state.windows[windowId]) return state

      const nextWindows = { ...state.windows }
      delete nextWindows[windowId]
      return { windows: nextWindows }
    })
  },

  setActiveTab: (windowId, tabId) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState || !windowState.tabs.some((tab) => tab.id === tabId)) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...windowState,
            activeTabId: tabId,
            selection: [],
            historyBack: [],
            historyForward: [],
          },
        },
      }
    })
  },

  addTab: (windowId, path, label) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState) return state

      const tab = createTab(path, label)
      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...windowState,
            tabs: [...windowState.tabs, tab],
            activeTabId: tab.id,
            selection: [],
            historyBack: [],
            historyForward: [],
          },
        },
      }
    })
  },

  closeTab: (windowId, tabId) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState || windowState.tabs.length <= 1) return state

      const nextTabs = windowState.tabs.filter((tab) => tab.id !== tabId)
      const activeTabId = windowState.activeTabId === tabId
        ? nextTabs.at(-1)?.id ?? windowState.activeTabId
        : windowState.activeTabId

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...windowState,
            tabs: nextTabs,
            activeTabId,
            selection: [],
            historyBack: [],
            historyForward: [],
          },
        },
      }
    })
  },

  moveTabs: (windowId, tabIds) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState || tabIds.length !== windowState.tabs.length) return state

      const tabById = new Map(windowState.tabs.map((tab) => [tab.id, tab]))
      const nextTabs = tabIds
        .map((id) => tabById.get(id))
        .filter((tab): tab is SeekerTabState => tab !== undefined)

      if (nextTabs.length !== windowState.tabs.length) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...windowState,
            tabs: nextTabs,
          },
        },
      }
    })
  },

  navigateTo: (windowId, path) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState) return state

      const activeTab = getActiveTab(windowState)
      if (!activeTab || activeTab.path === path) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...updateActiveTab(windowState, (tab) => ({
              ...tab,
              path,
              label: getPathLabel(path),
            })),
            historyBack: [...windowState.historyBack, activeTab.path],
            historyForward: [],
            selection: [],
          },
        },
      }
    })
  },

  goBack: (windowId) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState || windowState.historyBack.length === 0) return state

      const activeTab = getActiveTab(windowState)
      if (!activeTab) return state

      const previousPath = windowState.historyBack.at(-1)
      if (!previousPath) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...updateActiveTab(windowState, (tab) => ({
              ...tab,
              path: previousPath,
              label: getPathLabel(previousPath),
            })),
            historyBack: windowState.historyBack.slice(0, -1),
            historyForward: [activeTab.path, ...windowState.historyForward],
            selection: [],
          },
        },
      }
    })
  },

  goForward: (windowId) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState || windowState.historyForward.length === 0) return state

      const activeTab = getActiveTab(windowState)
      if (!activeTab) return state

      const nextPath = windowState.historyForward[0]

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...updateActiveTab(windowState, (tab) => ({
              ...tab,
              path: nextPath,
              label: getPathLabel(nextPath),
            })),
            historyBack: [...windowState.historyBack, activeTab.path],
            historyForward: windowState.historyForward.slice(1),
            selection: [],
          },
        },
      }
    })
  },

  setViewMode: (windowId, viewMode) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...windowState,
            viewMode,
          },
        },
      }
    })
  },

  setSelection: (windowId, selection) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...windowState,
            selection,
          },
        },
      }
    })
  },
}))

export function addTabToTargetMainWindow(path: string = DEFAULT_PATH): void {
  const windowStore = useWindowStore.getState()
  const seekerStore = useSeekerWindowStore.getState()
  const { windows, focusedTarget } = windowStore

  let windowId = resolveTargetSeekerMainWindowId(windows, focusedTarget)

  if (!windowId) {
    windowId = windowStore.openWindow('seeker', { payload: { windowKind: SEEKER_WINDOW_KIND.MAIN } })
  }

  seekerStore.initWindow(windowId)
  seekerStore.addTab(windowId, path)
  windowStore.focusWindow(windowId)
}

export default useSeekerWindowStore
