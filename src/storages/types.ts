import type { FsNodeKind } from '~types'
import type { SidebarIcon } from '~/components/applications/Seeker/Main/types'

export type StorageCategoryId =
  | 'hard-disks'
  | 'external-disks'
  | 'disc-devices'
  | 'cloud-storage'
  | 'bonjour'
  | 'connected-servers'

export interface StorageVolumeManifest {
  name: string
  boot?: boolean
  createdAt?: string
  modifiedAt?: string
}

export interface StorageTreeNode {
  name: string
  kind: FsNodeKind
  hidden?: boolean
  target?: string
  createdAt?: string
  modifiedAt?: string
  size?: number
  children?: StorageTreeNode[]
}

export interface StorageDevice {
  id: string
  categoryId: StorageCategoryId
  name: string
  path: string
  boot: boolean
  icon: SidebarIcon
  tree: StorageTreeNode[]
}
