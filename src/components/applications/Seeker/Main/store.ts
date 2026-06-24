import { create } from 'zustand'
import useFsStore from '~/fs'
import { getSeekerPathLabel } from '~/components/applications/Seeker/virtualFolders'
import useWindowStore from '~/stores/window'
import useSeekerGlobalStore from '~/components/applications/Seeker/store'
import { resolveSeekerNewWindowPath } from '~/components/applications/Seeker/newWindowPath'
import { resolveTargetSeekerMainWindowId, SEEKER_WINDOW_KIND } from '~/components/applications/Seeker/windows'
import type {
  RestoreMainWindowSnapshot,
  TabState,
  MainWindowState,
  MainWindowStore,
} from './types'
import { recordPathOpened } from './List/pathLastOpened'

const pendingRestoredSnapshots = new Map<string, RestoreMainWindowSnapshot>()

function getDefaultTabPath(): string {
  const { newWindowPathOption } = useSeekerGlobalStore.getState()
  return resolveSeekerNewWindowPath(newWindowPathOption)
}

function getInitialPathFromPayload(payload?: Record<string, unknown>): string {
  const initialPath = payload?.initialPath
  return typeof initialPath === 'string' ? initialPath : getDefaultTabPath()
}

function getPathLabel(path: string): string {
  return getSeekerPathLabel(path, useFsStore.getState().nodes)
}

interface CreateTabOptions {
  historyBack?: string[]
  historyForward?: string[]
}

function createTab(path: string, label?: string, options: CreateTabOptions = {}): TabState {
  return {
    id: crypto.randomUUID(),
    path,
    label: label ?? getPathLabel(path),
    historyBack: options.historyBack ?? [],
    historyForward: options.historyForward ?? [],
  }
}

function createWindowState(windowId: string): MainWindowState {
  const window = useWindowStore.getState().windows.find((item) => item.id === windowId)
  const initialPath = getInitialPathFromPayload(window?.payload)
  const tab = createTab(initialPath)
  const defaultViewMode = useSeekerGlobalStore.getState().defaultViewMode

  return {
    tabs: [tab],
    activeTabId: tab.id,
    viewMode: defaultViewMode,
    selection: [],
  }
}

function buildWindowStateFromSnapshot(snapshot: RestoreMainWindowSnapshot): MainWindowState {
  const activeTabIndex = Math.min(
    Math.max(0, snapshot.activeTabIndex),
    Math.max(0, snapshot.tabs.length - 1),
  )

  const tabs = snapshot.tabs.length > 0
    ? snapshot.tabs.map((tab, index) => createTab(tab.path, tab.label, {
        historyBack: tab.historyBack ?? (index === activeTabIndex ? snapshot.historyBack : undefined),
        historyForward: tab.historyForward ?? (index === activeTabIndex ? snapshot.historyForward : undefined),
      }))
    : [createTab(getDefaultTabPath())]

  const resolvedActiveTabIndex = Math.min(activeTabIndex, tabs.length - 1)

  return {
    tabs,
    activeTabId: tabs[resolvedActiveTabIndex].id,
    viewMode: snapshot.viewMode,
    selection: [],
  }
}

function getActiveTab(state: MainWindowState): TabState | undefined {
  return state.tabs.find((tab) => tab.id === state.activeTabId)
}

function updateActiveTab(
  state: MainWindowState,
  updater: (tab: TabState) => TabState,
): MainWindowState {
  const activeTab = getActiveTab(state)
  if (!activeTab) return state

  return {
    ...state,
    tabs: state.tabs.map((tab) => (
      tab.id === activeTab.id ? updater(tab) : tab
    )),
  }
}

const useMainWindowStore = create<MainWindowStore>((set, get) => ({
  windows: {},

  initWindow: (windowId) => {
    if (get().windows[windowId]) return

    const pendingSnapshot = pendingRestoredSnapshots.get(windowId)

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: pendingSnapshot
          ? buildWindowStateFromSnapshot(pendingSnapshot)
          : createWindowState(windowId),
      },
    }))
  },

  removeWindow: (windowId) => {
    pendingRestoredSnapshots.delete(windowId)

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
          },
        },
      }
    })
  },

  addTab: (windowId, path, label) => {
    recordPathOpened(path)

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
          },
        },
      }
    })
  },

  closeOtherTabs: (windowId, tabId) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState || windowState.tabs.length <= 1) return state

      const tab = windowState.tabs.find((item) => item.id === tabId)
      if (!tab) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...windowState,
            tabs: [tab],
            activeTabId: tab.id,
            selection: [],
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
        .filter((tab): tab is TabState => tab !== undefined)

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
    recordPathOpened(path)

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
              historyBack: [...tab.historyBack, activeTab.path],
              historyForward: [],
            })),
            selection: [],
          },
        },
      }
    })
  },

  goBack: (windowId) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState) return state

      const activeTab = getActiveTab(windowState)
      if (!activeTab || activeTab.historyBack.length === 0) return state

      const previousPath = activeTab.historyBack.at(-1)
      if (!previousPath) return state

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...updateActiveTab(windowState, (tab) => ({
              ...tab,
              path: previousPath,
              label: getPathLabel(previousPath),
              historyBack: tab.historyBack.slice(0, -1),
              historyForward: [activeTab.path, ...tab.historyForward],
            })),
            selection: [],
          },
        },
      }
    })
  },

  goForward: (windowId) => {
    set((state) => {
      const windowState = state.windows[windowId]
      if (!windowState) return state

      const activeTab = getActiveTab(windowState)
      if (!activeTab || activeTab.historyForward.length === 0) return state

      const nextPath = activeTab.historyForward[0]

      return {
        windows: {
          ...state.windows,
          [windowId]: {
            ...updateActiveTab(windowState, (tab) => ({
              ...tab,
              path: nextPath,
              label: getPathLabel(nextPath),
              historyBack: [...tab.historyBack, activeTab.path],
              historyForward: tab.historyForward.slice(1),
            })),
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

  restoreWindowState: (windowId, snapshot) => {
    pendingRestoredSnapshots.set(windowId, snapshot)

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: buildWindowStateFromSnapshot(snapshot),
      },
    }))
  },
}))

export function moveTabToNewWindow(sourceWindowId: string, tabId: string): void {
  const mainStore = useMainWindowStore.getState()
  const windowStore = useWindowStore.getState()
  const sourceState = mainStore.windows[sourceWindowId]
  if (!sourceState) return

  const tab = sourceState.tabs.find((item) => item.id === tabId)
  if (!tab) return

  const newWindowId = windowStore.openWindow('seeker', {
    payload: { windowKind: SEEKER_WINDOW_KIND.MAIN, initialPath: tab.path },
  })
  if (!newWindowId) return

  mainStore.initWindow(newWindowId)

  useMainWindowStore.setState((state) => {
    const newWindowState = state.windows[newWindowId]
    if (!newWindowState) return state

    return {
      windows: {
        ...state.windows,
        [newWindowId]: updateActiveTab(newWindowState, (activeTab) => ({
          ...activeTab,
          path: tab.path,
          label: tab.label,
          historyBack: [...tab.historyBack],
          historyForward: [...tab.historyForward],
        })),
      },
    }
  })

  if (sourceState.tabs.length === 1) {
    windowStore.closeWindow(sourceWindowId)
  } else {
    mainStore.closeTab(sourceWindowId, tabId)
  }

  windowStore.focusWindow(newWindowId)
}

export function addTabToTargetMainWindow(path: string = getDefaultTabPath()): void {
  const windowStore = useWindowStore.getState()
  const mainStore = useMainWindowStore.getState()
  const { windows, focusedTarget } = windowStore

  let windowId = resolveTargetSeekerMainWindowId(windows, focusedTarget)

  if (!windowId) {
    windowId = windowStore.openWindow('seeker', { payload: { windowKind: SEEKER_WINDOW_KIND.MAIN } })
  }

  mainStore.initWindow(windowId)
  mainStore.addTab(windowId, path)
  windowStore.focusWindow(windowId)
}

export default useMainWindowStore
