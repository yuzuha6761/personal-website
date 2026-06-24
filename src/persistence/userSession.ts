import { preloadApplication } from '~/components/applications/registry'
import useMainWindowStore from '~/components/applications/Seeker/Main/store'
import { getSeekerWindowKind, SEEKER_WINDOW_KIND } from '~/components/applications/Seeker/windows'
import useAppStore from '~/stores/app'
import useWindowStore from '~/stores/window'
import { getPersistenceItem, persistenceKeys, setPersistenceItem } from './db'
import type { UserSessionRecord } from './types'

let isRestoringSession = false
const sessionPersistTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function captureUserSession(): UserSessionRecord {
  const windowStore = useWindowStore.getState()
  const mainStore = useMainWindowStore.getState()
  const appStore = useAppStore.getState()

  const sortedWindows = [...windowStore.windows].sort((left, right) => left.zIndex - right.zIndex)

  const { focusedTarget: currentFocus } = windowStore

  const focusedTarget = currentFocus.type === 'desktop'
    ? { type: 'desktop' as const }
    : {
        type: 'window' as const,
        index: sortedWindows.findIndex((window) => window.id === currentFocus.windowId),
      }

  const windows = sortedWindows.map((window) => {
    const entry: UserSessionRecord['windows'][number] = {
      appId: window.appId,
      title: window.title,
      position: window.position,
      size: window.size,
      minimized: window.minimized || undefined,
      payload: window.payload,
      zIndex: window.zIndex,
    }

    if (
      window.appId === 'seeker'
      && getSeekerWindowKind(window.payload) === SEEKER_WINDOW_KIND.MAIN
    ) {
      const mainState = mainStore.windows[window.id]
      if (mainState) {
        entry.seeker = {
          tabs: mainState.tabs.map((tab) => ({
            path: tab.path,
            label: tab.label,
            historyBack: tab.historyBack,
            historyForward: tab.historyForward,
          })),
          activeTabIndex: Math.max(0, mainState.tabs.findIndex((tab) => tab.id === mainState.activeTabId)),
          viewMode: mainState.viewMode,
        }
      }
    }

    return entry
  })

  return {
    version: 1,
    activeAppId: appStore.activeAppId,
    focusedTarget: focusedTarget.type === 'window' && focusedTarget.index < 0
      ? { type: 'desktop' }
      : focusedTarget,
    windows,
  }
}

export async function loadUserSessionRecord(userId: string): Promise<UserSessionRecord | null> {
  return getPersistenceItem<UserSessionRecord>(persistenceKeys.userSession(userId))
}

async function saveUserSessionRecord(userId: string, record: UserSessionRecord): Promise<void> {
  await setPersistenceItem(persistenceKeys.userSession(userId), record)
}

export function schedulePersistUserSession(userId: string): void {
  if (isRestoringSession) return

  const existingTimer = sessionPersistTimers.get(userId)
  if (existingTimer) clearTimeout(existingTimer)

  sessionPersistTimers.set(userId, setTimeout(() => {
    sessionPersistTimers.delete(userId)
    void saveUserSessionRecord(userId, captureUserSession())
  }, 800))
}

export async function flushUserSession(userId: string): Promise<void> {
  const timer = sessionPersistTimers.get(userId)
  if (timer) {
    clearTimeout(timer)
    sessionPersistTimers.delete(userId)
  }

  await saveUserSessionRecord(userId, captureUserSession())
}

export async function restoreUserSession(record: UserSessionRecord): Promise<void> {
  if (isRestoringSession) return

  isRestoringSession = true

  try {
    if (record.windows.length === 0) {
      const appId = record.activeAppId ?? 'seeker'
      await preloadApplication(appId)
      useAppStore.getState().launchApp(appId)
      useWindowStore.setState({ focusedTarget: { type: 'desktop' } })
      return
    }

    const appIds = [...new Set(record.windows.map((window) => window.appId))]
    await Promise.all(appIds.map((appId) => preloadApplication(appId)))

    const windowStore = useWindowStore.getState()
    const mainStore = useMainWindowStore.getState()
    const restoredIds: string[] = []

    for (const entry of record.windows) {
      const windowId = windowStore.openWindow(entry.appId, {
        title: entry.title,
        position: entry.position,
        size: entry.size,
        payload: entry.payload,
        zIndex: entry.zIndex,
      })

      if (!windowId) continue

      if (entry.seeker && entry.appId === 'seeker') {
        mainStore.restoreWindowState(windowId, entry.seeker)
      }

      if (entry.minimized) {
        windowStore.minimizeWindow(windowId)
      }

      restoredIds.push(windowId)
    }

    if (record.activeAppId) {
      useAppStore.getState().activateApp(record.activeAppId)
    }

    if (record.focusedTarget.type === 'desktop') {
      useWindowStore.setState({ focusedTarget: { type: 'desktop' } })
    } else {
      const windowId = restoredIds[record.focusedTarget.index]
      const entry = record.windows[record.focusedTarget.index]

      if (windowId && entry && !entry.minimized) {
        windowStore.focusWindow(windowId)
      } else {
        useWindowStore.setState({ focusedTarget: { type: 'desktop' } })
      }
    }
  } finally {
    isRestoringSession = false
  }
}

export function startUserSessionPersistence(userId: string): () => void {
  const unsubscribers = [
    useWindowStore.subscribe(() => schedulePersistUserSession(userId)),
    useMainWindowStore.subscribe(() => schedulePersistUserSession(userId)),
    useAppStore.subscribe(() => schedulePersistUserSession(userId)),
  ]

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe())
  }
}
