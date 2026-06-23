import { SEEKER_RECENTS_PATH } from '~/components/applications/Seeker/virtualFolders'
import { resolveStorageDevicePath } from '~/storages'
import {
  FS_BOOT_VOLUME_PATH,
  FS_COMPUTER_ROOT_PATH,
  FS_HOME_PATH,
  FS_NETWORK_PATH,
  joinPath,
} from '~/fs/paths'

const SIDEBAR_ITEM_PATHS: Partial<Record<string, string>> = {
  recents: SEEKER_RECENTS_PATH,
  applications: joinPath(FS_BOOT_VOLUME_PATH, 'Applications'),
  downloads: joinPath(FS_HOME_PATH, 'Downloads'),
  movies: joinPath(FS_HOME_PATH, 'Movies'),
  music: joinPath(FS_HOME_PATH, 'Music'),
  pictures: joinPath(FS_HOME_PATH, 'Pictures'),
  home: FS_HOME_PATH,
  'cloud-drive': joinPath(FS_HOME_PATH, 'Cloud Drive'),
  desktop: joinPath(FS_HOME_PATH, 'Desktop'),
  documents: joinPath(FS_HOME_PATH, 'Documents'),
  'yuzuha-website': FS_COMPUTER_ROOT_PATH,
  network: FS_NETWORK_PATH,
}

export function resolveSidebarItemPath(itemId: string): string | undefined {
  return SIDEBAR_ITEM_PATHS[itemId] ?? resolveStorageDevicePath(itemId)
}

export function isSidebarItemActive(itemId: string, currentPath: string): boolean {
  const itemPath = resolveSidebarItemPath(itemId)
  return itemPath !== undefined && itemPath === currentPath
}
