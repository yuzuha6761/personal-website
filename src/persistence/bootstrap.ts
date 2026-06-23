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
import { flushAllUserFs, hydrateUserFsOverlay } from './userFs'
import {
  applyUserPrefsRecord,
  flushUserPrefs,
  loadUserPrefsRecord,
  startUserPrefsPersistence,
} from './userPrefs'
import type { RuntimeUserProfile } from './types'

let stopPrefsPersistence: (() => void) | undefined

import type { AppearanceMode } from '~types'

function resolveInitialDarkMode(appearance: AppearanceMode | undefined): boolean {
  if (appearance === 'dark') return true
  if (appearance === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export async function bootstrapPersistence(): Promise<void> {
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

  useWindowStore.getState().openApp('seeker')

  useSessionStore.getState().setReady(true)

  window.addEventListener('beforeunload', handleBeforeUnload)
}

function handleBeforeUnload() {
  void flushPersistenceState()
}

export async function flushPersistenceState(): Promise<void> {
  const allUsers = useSessionStore.getState().getAllUsers()
  const baseNodes = createInitialFsNodes(useSessionStore.getState().runtimeUsers)
  await flushAllUserFs(allUsers, baseNodes)
  await flushUserPrefs(BUILTIN_USER_ID)
  await setPersistenceItem(persistenceKeys.runtimeUsers, useSessionStore.getState().runtimeUsers)
}

export function teardownPersistence(): void {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  stopPrefsPersistence?.()
  stopPrefsPersistence = undefined
}
