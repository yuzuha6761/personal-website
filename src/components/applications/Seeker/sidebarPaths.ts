import { SEEKER_RECENTS_PATH } from '~/components/applications/Seeker/virtualFolders'
import { resolveStorageDevicePath } from '~/storages'
import {
  FS_BOOT_VOLUME_PATH,
  FS_COMPUTER_ROOT_PATH,
  FS_NETWORK_PATH,
  joinPath,
} from '~/fs/paths'
import { getHomePath } from '~/session/paths'

export function resolveSidebarItemPath(itemId: string): string | undefined {
  const homePath = getHomePath()

  const sidebarItemPaths: Partial<Record<string, string>> = {
    recents: SEEKER_RECENTS_PATH,
    applications: joinPath(FS_BOOT_VOLUME_PATH, 'Applications'),
    downloads: joinPath(homePath, 'Downloads'),
    movies: joinPath(homePath, 'Movies'),
    music: joinPath(homePath, 'Music'),
    pictures: joinPath(homePath, 'Pictures'),
    home: homePath,
    'cloud-drive': joinPath(homePath, 'Cloud Drive'),
    desktop: joinPath(homePath, 'Desktop'),
    documents: joinPath(homePath, 'Documents'),
    'yuzuha-website': FS_COMPUTER_ROOT_PATH,
    network: FS_NETWORK_PATH,
  }

  return sidebarItemPaths[itemId] ?? resolveStorageDevicePath(itemId)
}

export function isSidebarItemActive(itemId: string, currentPath: string): boolean {
  const itemPath = resolveSidebarItemPath(itemId)
  return itemPath !== undefined && itemPath === currentPath
}
