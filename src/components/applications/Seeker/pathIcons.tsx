import type { ReactNode } from 'react'
import { HardDrive, Laptop } from 'lucide-react'
import folderIcon from '~assets/common/folder.svg'
import { AppIcon } from '~/components/icons/AppIcon'
import type { ContextualMenuActionItem } from '~/components/ContextualMenu'
import { FS_COMPUTER_ROOT_PATH, FS_NETWORK_PATH } from '~/fs/paths'
import { isStorageVolumePath } from '~/storages'
import { SEEKER_RECENTS_PATH } from '~/components/applications/Seeker/virtualFolders'
import { seekerIcons } from '~/components/applications/Seeker/icons'

const PATH_MENU_ICON_CLASS = 'w-[.9rem] h-[.9rem]'
const PATH_TITLE_ICON_CLASS = 'w-[1.04rem] h-[1.04rem]'

export function getPathContextMenuIcon(
  path: string,
): Pick<ContextualMenuActionItem, 'icon' | 'iconNode'> {
  if (path === FS_COMPUTER_ROOT_PATH) {
    return { icon: Laptop }
  }

  if (isStorageVolumePath(path)) {
    return { icon: HardDrive }
  }

  if (path === FS_NETWORK_PATH) {
    return { icon: seekerIcons.globe }
  }

  if (path === SEEKER_RECENTS_PATH) {
    return { icon: seekerIcons.clock }
  }

  return {
    iconNode: <img alt="" className={PATH_MENU_ICON_CLASS} src={folderIcon} />,
  }
}

export function getPathTitleIcon(path: string, colorClass: string): ReactNode {
  if (path === FS_COMPUTER_ROOT_PATH) {
    return <AppIcon className={`${PATH_TITLE_ICON_CLASS} ${colorClass}`} icon={Laptop} strokeWidth={2} />
  }

  if (isStorageVolumePath(path)) {
    return <AppIcon className={`${PATH_TITLE_ICON_CLASS} ${colorClass}`} icon={HardDrive} strokeWidth={2} />
  }

  if (path === FS_NETWORK_PATH) {
    return <AppIcon className={`${PATH_TITLE_ICON_CLASS} ${colorClass}`} icon={seekerIcons.globe} strokeWidth={2} />
  }

  if (path === SEEKER_RECENTS_PATH) {
    return <AppIcon className={`${PATH_TITLE_ICON_CLASS} ${colorClass}`} icon={seekerIcons.clock} strokeWidth={2} />
  }

  return <img alt="" className={PATH_TITLE_ICON_CLASS} src={folderIcon} />
}
