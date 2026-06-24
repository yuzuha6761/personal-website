import { setBaseFsNodes } from '~/fs/baseNodes'
import { createInitialFsNodes } from '~/fs/seed'
import { applyFsOverlay } from '~/fs/overlay'
import useFsStore from '~/fs/store'
import { BUILTIN_USER_ID } from '~/session/users'
import useSessionStore from '~/session/store'
import useWindowStore from '~/stores/window'
import useAppStore from '~/stores/app'
import {
  getPersistenceItem,
  PERSISTENCE_SCHEMA_VERSION,
  persistenceKeys,
  setPersistenceItem,
} from './db'
import { extractBaseHomeNodes } from './rebase'
import {
  flushAllUserFs,
  hydrateUserFsOverlay,
} from './userFs'
import {
  applyUserPrefsRecord,
  flushUserPrefs,
  loadUserPrefsRecord,
  startUserPrefsPersistence,
} from './userPrefs'
import {
  flushUserSession,
  loadUserSessionRecord,
  restoreUserSession,
  startUserSessionPersistence,
} from './userSession'
import type { RuntimeUserProfile } from './types'

let stopPrefsPersistence: (() => void) | undefined
let stopSessionPersistence: (() => void) | undefined
let bootstrapPromise: Promise<void> | null = null
let beforeUnloadRegistered = false

import type { AppearanceMode } from '~types'

function resolveInitialDarkMode(appearance: AppearanceMode | undefined): boolean {
  if (appearance === 'dark') return true
  if (appearance === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

async function runBootstrapPersistence(): Promise<void> {
  const storedSchemaVersion = await getPersistenceItem<number>(persistenceKeys.schemaVersion)
  if (storedSchemaVersion !== PERSISTENCE_SCHEMA_VERSION) {
    await setPersistenceItem(persistenceKeys.schemaVersion, PERSISTENCE_SCHEMA_VERSION)
  }

  const runtimeUsers = await getPersistenceItem<RuntimeUserProfile[]>(persistenceKeys.runtimeUsers) ?? []
  useSessionStore.getState().setRuntimeUsers(runtimeUsers)

  const baseNodes = createInitialFsNodes(runtimeUsers)
  setBaseFsNodes(baseNodes)
  let mergedNodes = { ...baseNodes }

  const allUsers = useSessionStore.getState().getAllUsers()

  for (const user of allUsers) {
    const baseHomeNodes = extractBaseHomeNodes(baseNodes, user.homePath)
    const overlay = await hydrateUserFsOverlay(user.id, baseHomeNodes)
    mergedNodes = applyFsOverlay(mergedNodes, user.homePath, overlay)
  }

  useFsStore.getState().replaceNodes(mergedNodes)

  useSessionStore.getState().login(BUILTIN_USER_ID)

  const prefs = await loadUserPrefsRecord(BUILTIN_USER_ID)
  applyUserPrefsRecord(
    prefs,
    resolveInitialDarkMode(prefs?.systemSettings?.appearance),
  )

  stopPrefsPersistence?.()
  stopPrefsPersistence = startUserPrefsPersistence(BUILTIN_USER_ID)

  useAppStore.setState({
    runningAppIds: [],
    loadingAppIds: [],
    activeAppId: null,
  })

  useWindowStore.setState({
    windows: [],
    activeWindowId: null,
    focusedTarget: { type: 'desktop' },
  })

  const session = await loadUserSessionRecord(BUILTIN_USER_ID)
  if (session) {
    await restoreUserSession(session)
  } else {
    useAppStore.getState().launchApp('seeker')
  }

  stopSessionPersistence?.()
  stopSessionPersistence = startUserSessionPersistence(BUILTIN_USER_ID)

  useSessionStore.getState().setReady(true)

  if (!beforeUnloadRegistered) {
    window.addEventListener('beforeunload', handleBeforeUnload)
    beforeUnloadRegistered = true
  }
}

export function bootstrapPersistence(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrapPersistence()
  }

  return bootstrapPromise
}

function handleBeforeUnload() {
  void flushPersistenceState()
}

export async function flushPersistenceState(): Promise<void> {
  const allUsers = useSessionStore.getState().getAllUsers()
  const baseNodes = createInitialFsNodes(useSessionStore.getState().runtimeUsers)
  await flushAllUserFs(allUsers, baseNodes)
  await flushUserPrefs(BUILTIN_USER_ID)
  await flushUserSession(BUILTIN_USER_ID)
  await setPersistenceItem(persistenceKeys.runtimeUsers, useSessionStore.getState().runtimeUsers)
}

export function teardownPersistence(): void {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  beforeUnloadRegistered = false
  bootstrapPromise = null
  stopPrefsPersistence?.()
  stopPrefsPersistence = undefined
  stopSessionPersistence?.()
  stopSessionPersistence = undefined
}
