import type { FsNode } from '~types'
import type { UserProfile } from '~/session/types'
import { diffHomeTrees, EMPTY_FS_OVERLAY, type FsOverlay } from '~/fs/overlay'
import { getPersistenceItem, persistenceKeys, setPersistenceItem } from './db'
import {
  createEmptyUserFsRecord,
  extractBaseHomeNodes,
  rebaseUserFsRecord,
  userFsRecordFromOverlay,
} from './rebase'
import type { UserFsRecord } from './types'

const overlaysByUser = new Map<string, FsOverlay>()
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function getMemoryFsOverlay(userId: string): FsOverlay {
  return overlaysByUser.get(userId) ?? EMPTY_FS_OVERLAY
}

export function setMemoryFsOverlay(userId: string, overlay: FsOverlay): void {
  overlaysByUser.set(userId, overlay)
}

export async function loadUserFsRecord(userId: string): Promise<UserFsRecord | null> {
  return getPersistenceItem<UserFsRecord>(persistenceKeys.userFs(userId))
}

export async function saveUserFsRecord(userId: string, record: UserFsRecord): Promise<void> {
  await setPersistenceItem(persistenceKeys.userFs(userId), record)
}

export async function hydrateUserFsOverlay(
  userId: string,
  baseHomeNodes: Record<string, FsNode>,
): Promise<FsOverlay> {
  const storedRecord = await loadUserFsRecord(userId)
  let record = storedRecord ?? createEmptyUserFsRecord()
  const rebasedRecord = rebaseUserFsRecord(record, baseHomeNodes)

  const overlay = rebasedRecord.strategy === 'homeSnapshot' && rebasedRecord.homeSnapshot
    ? diffHomeTrees(baseHomeNodes, rebasedRecord.homeSnapshot)
    : rebasedRecord.overlay ?? EMPTY_FS_OVERLAY

  setMemoryFsOverlay(userId, overlay)

  if (!storedRecord || storedRecord.baseRevision !== rebasedRecord.baseRevision) {
    await saveUserFsRecord(userId, rebasedRecord)
  }

  return overlay
}

export function schedulePersistUserFs(
  user: UserProfile,
  overlay: FsOverlay,
  baseHomeNodes: Record<string, FsNode>,
): void {
  setMemoryFsOverlay(user.id, overlay)

  const existingTimer = persistTimers.get(user.id)
  if (existingTimer) clearTimeout(existingTimer)

  persistTimers.set(user.id, setTimeout(() => {
    persistTimers.delete(user.id)
    void flushUserFs(user, overlay, baseHomeNodes)
  }, 800))
}

export async function flushUserFs(
  user: UserProfile,
  overlay: FsOverlay,
  baseHomeNodes: Record<string, FsNode>,
): Promise<void> {
  const record = userFsRecordFromOverlay(overlay, user, baseHomeNodes)
  await saveUserFsRecord(user.id, record)
}

export async function flushAllUserFs(
  users: UserProfile[],
  baseNodes: Record<string, FsNode>,
): Promise<void> {
  const pendingTimers = [...persistTimers.values()]
  pendingTimers.forEach((timer) => clearTimeout(timer))
  persistTimers.clear()

  await Promise.all(users.map(async (user) => {
    const overlay = getMemoryFsOverlay(user.id)
    const baseHomeNodes = extractBaseHomeNodes(baseNodes, user.homePath)
    await flushUserFs(user, overlay, baseHomeNodes)
  }))
}

export function cancelScheduledUserFsPersist(userId: string): void {
  const timer = persistTimers.get(userId)
  if (!timer) return
  clearTimeout(timer)
  persistTimers.delete(userId)
}
