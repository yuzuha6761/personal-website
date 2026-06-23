import type { FsNode } from '~types'
import { getAllStorageDevices } from '~/storages'
import type { StorageDevice } from '~/storages/types'
import { FS_BOOT_VOLUME_PATH, joinPath, listChildNodes } from './paths'

export function getFsVolumesPath(): string {
  return joinPath(FS_BOOT_VOLUME_PATH, 'Volumes')
}

export function isFsVolumesPath(path: string): boolean {
  return path === getFsVolumesPath()
}

export function buildVolumesMountNode(device: StorageDevice, timestamp: number): FsNode {
  const volumesPath = getFsVolumesPath()

  return {
    name: device.name,
    path: joinPath(volumesPath, device.name),
    parentPath: volumesPath,
    kind: 'symlink',
    targetPath: device.path,
    createdAt: timestamp,
    modifiedAt: timestamp,
    size: 0,
  }
}

export function listVolumesMountNodes(fallbackTimestamp: number): FsNode[] {
  return getAllStorageDevices()
    .map((device: StorageDevice) => buildVolumesMountNode(device, fallbackTimestamp))
    .sort((left: FsNode, right: FsNode) => left.name.localeCompare(right.name, 'zh-CN'))
}

export function resolveVolumesMountNode(
  nodes: Record<string, FsNode>,
  path: string,
): FsNode | undefined {
  const volumesPath = getFsVolumesPath()
  if (!path.startsWith(`${volumesPath}/`)) return undefined

  const mountName = path.slice(volumesPath.length + 1)
  if (!mountName || mountName.includes('/')) return undefined

  const device = getAllStorageDevices().find((entry: StorageDevice) => entry.name === mountName)
  if (!device) return undefined

  const timestamp = nodes[volumesPath]?.createdAt ?? Date.parse('2025-06-12T06:50:00.000Z')
  const mountNode = buildVolumesMountNode(device, timestamp)
  return mountNode.path === path ? mountNode : undefined
}

export function isFsVolumesMountNode(node: FsNode): boolean {
  return node.kind === 'symlink' && Boolean(node.parentPath && isFsVolumesPath(node.parentPath))
}

export function getVolumesMountDeviceIcon(node: FsNode): StorageDevice['icon'] | undefined {
  if (!isFsVolumesMountNode(node) || !node.targetPath) return undefined

  return getAllStorageDevices().find((device: StorageDevice) => device.path === node.targetPath)?.icon
}

export function listFsDirectoryChildren(
  nodes: Record<string, FsNode>,
  directoryPath: string,
): FsNode[] {
  if (isFsVolumesPath(directoryPath)) {
    const timestamp = nodes[directoryPath]?.createdAt ?? Date.parse('2025-06-12T06:50:00.000Z')
    return listVolumesMountNodes(timestamp)
  }

  return listChildNodes(nodes, directoryPath)
}
