import {
  FS_BOOT_VOLUME_PATH,
  FS_COMPUTER_ROOT_PATH,
  joinPath,
} from '~/fs/paths'
import { getHomePath } from '~/session/paths'
import useSessionStore from '~/session/store'
import { getBootStorageDevice } from '~/storages'
import { SEEKER_RECENTS_PATH } from '~/components/applications/Seeker/virtualFolders'

export type SeekerNewWindowPathOption =
  | 'yuzuha-website'
  | 'mcintosh-hd'
  | 'home'
  | 'desktop'
  | 'documents'
  | 'recents'
  | 'cloud-drive'

export const DEFAULT_SEEKER_NEW_WINDOW_PATH_OPTION: SeekerNewWindowPathOption = 'home'

const bootStorageDevice = getBootStorageDevice()

export function resolveSeekerNewWindowPath(option: SeekerNewWindowPathOption): string {
  const homePath = getHomePath()

  const paths: Record<SeekerNewWindowPathOption, string> = {
    'yuzuha-website': FS_COMPUTER_ROOT_PATH,
    'mcintosh-hd': FS_BOOT_VOLUME_PATH,
    home: homePath,
    desktop: joinPath(homePath, 'Desktop'),
    documents: joinPath(homePath, 'Documents'),
    recents: SEEKER_RECENTS_PATH,
    'cloud-drive': joinPath(homePath, 'Cloud Drive'),
  }

  return paths[option]
}

export function getBootStorageDeviceLabel(): string {
  return bootStorageDevice.name
}

export function getBootStorageDeviceId(): string {
  return bootStorageDevice.id
}

export function getCurrentUserHomeLabel(): string {
  try {
    return useSessionStore.getState().getCurrentUser().displayName
  } catch {
    return 'yuzuha'
  }
}
