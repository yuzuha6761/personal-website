import {
  FS_BOOT_VOLUME_PATH,
  FS_COMPUTER_ROOT_PATH,
  FS_HOME_PATH,
  joinPath,
} from '~/fs/paths'
import { getBootStorageDevice } from '~/storages'
import { SEEKER_RECENTS_PATH } from '~/components/applications/Seeker/virtualFolders'

export type SeekerNewWindowPathOption =
  | 'yuzuha-website'
  | 'mcintosh-hd'
  | 'yuzuha'
  | 'desktop'
  | 'documents'
  | 'recents'
  | 'cloud-drive'

export const DEFAULT_SEEKER_NEW_WINDOW_PATH_OPTION: SeekerNewWindowPathOption = 'yuzuha'

const bootStorageDevice = getBootStorageDevice()

const SEEKER_NEW_WINDOW_PATH_BY_OPTION: Record<SeekerNewWindowPathOption, string> = {
  'yuzuha-website': FS_COMPUTER_ROOT_PATH,
  'mcintosh-hd': FS_BOOT_VOLUME_PATH,
  yuzuha: FS_HOME_PATH,
  desktop: joinPath(FS_HOME_PATH, 'Desktop'),
  documents: joinPath(FS_HOME_PATH, 'Documents'),
  recents: SEEKER_RECENTS_PATH,
  'cloud-drive': joinPath(FS_HOME_PATH, 'Cloud Drive'),
}

export function resolveSeekerNewWindowPath(option: SeekerNewWindowPathOption): string {
  return SEEKER_NEW_WINDOW_PATH_BY_OPTION[option]
}

export function getBootStorageDeviceLabel(): string {
  return bootStorageDevice.name
}

export function getBootStorageDeviceId(): string {
  return bootStorageDevice.id
}
