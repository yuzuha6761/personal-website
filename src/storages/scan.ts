import type { SidebarIcon } from '~/components/applications/Seeker/Main/types'
import { STORAGE_CATEGORY_ID_BY_FOLDER } from './categories'
import type { StorageDevice, StorageTreeNode, StorageVolumeManifest } from './types'

const volumeModules = import.meta.glob('./*/*/volume.json', {
  eager: true,
  import: 'default',
}) as Record<string, StorageVolumeManifest>

const treeModules = import.meta.glob('./*/*/tree.json', {
  eager: true,
  import: 'default',
}) as Record<string, StorageTreeNode[]>

const STORAGE_DEVICE_ICON_BY_CATEGORY: Record<string, SidebarIcon> = {
  'hard-disks': 'hard-drive',
  'external-disks': 'external-disk',
  'disc-devices': 'disc',
  'cloud-storage': 'cloud-drive',
  bonjour: 'network',
  'connected-servers': 'server',
}

function parseStorageModulePath(modulePath: string) {
  const match = modulePath.match(/^\.\/([^/]+)\/([^/]+)\/(?:volume|tree)\.json$/)
  if (!match) return undefined

  const [, categoryFolder, deviceId] = match
  const categoryId = STORAGE_CATEGORY_ID_BY_FOLDER[categoryFolder]
  if (!categoryId) return undefined

  return { categoryId, deviceId, categoryFolder }
}

export function buildStorageDevices(): StorageDevice[] {
  const devices: StorageDevice[] = []

  for (const [modulePath, volume] of Object.entries(volumeModules)) {
    const parsed = parseStorageModulePath(modulePath)
    if (!parsed) continue

    const treeModulePath = `./${parsed.categoryFolder}/${parsed.deviceId}/tree.json`
    const tree = treeModules[treeModulePath] ?? []

    devices.push({
      id: parsed.deviceId,
      categoryId: parsed.categoryId,
      name: volume.name,
      path: `/${volume.name}`,
      boot: Boolean(volume.boot),
      icon: STORAGE_DEVICE_ICON_BY_CATEGORY[parsed.categoryId] ?? 'hard-drive',
      tree,
    })
  }

  return devices.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
}
