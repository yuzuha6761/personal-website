import { FS_BOOT_VOLUME_PATH, joinPath } from '~/fs/paths'
import type { UserProfile } from './types'

export const BUILTIN_USER_ID = 'yuzuha'

export const BUILTIN_USERS: UserProfile[] = [
  {
    id: BUILTIN_USER_ID,
    displayName: 'yuzuha',
    homePath: joinPath(joinPath(FS_BOOT_VOLUME_PATH, 'Users'), BUILTIN_USER_ID),
    builtin: true,
  },
]

export function getBuiltinUserById(userId: string): UserProfile | undefined {
  return BUILTIN_USERS.find((user) => user.id === userId)
}

export function isBuiltinUserId(userId: string): boolean {
  return BUILTIN_USERS.some((user) => user.id === userId)
}

export function createRuntimeUserProfile(id: string, displayName: string): UserProfile {
  return {
    id,
    displayName,
    homePath: joinPath(joinPath(FS_BOOT_VOLUME_PATH, 'Users'), id),
    builtin: false,
    createdAt: Date.now(),
  }
}
