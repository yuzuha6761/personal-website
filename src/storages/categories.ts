import type { StorageCategoryId } from './types'

export const STORAGE_FOLDER_BY_CATEGORY_ID: Record<StorageCategoryId, string> = {
  'hard-disks': 'hard-drive',
  'external-disks': 'external-disk',
  'disc-devices': 'disc-devices',
  'cloud-storage': 'cloud-storage',
  bonjour: 'bonjour',
  'connected-servers': 'connected-servers',
}

export const STORAGE_CATEGORY_ID_BY_FOLDER: Record<string, StorageCategoryId> = Object.fromEntries(
  Object.entries(STORAGE_FOLDER_BY_CATEGORY_ID).map(([categoryId, folder]) => [folder, categoryId as StorageCategoryId]),
) as Record<string, StorageCategoryId>

export const STORAGE_CATEGORY_IDS = Object.keys(STORAGE_FOLDER_BY_CATEGORY_ID) as StorageCategoryId[]

export function isStorageCategoryId(value: string): value is StorageCategoryId {
  return value in STORAGE_FOLDER_BY_CATEGORY_ID
}
