import type { FsNode, FsNodeKind } from '~types'
import { getAllStorageDevices } from '~/storages'
import type { StorageTreeNode } from '~/storages/types'
import { FS_COMPUTER_ROOT_PATH, FS_NETWORK_PATH, joinPath } from './paths'
import { resolveSymlinkTargetPath } from './symlinks'

function parseTimestamp(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? fallback : timestamp
}

function createFsNode(
  name: string,
  path: string,
  parentPath: string | null,
  kind: FsNodeKind,
  timestamp: number,
  size = 0,
): FsNode {
  return {
    name,
    path,
    parentPath,
    kind,
    createdAt: timestamp,
    modifiedAt: timestamp,
    size,
  }
}

function flattenStorageTree(
  seed: StorageTreeNode,
  parent: FsNode,
  nodes: Record<string, FsNode>,
  fallbackTimestamp: number,
  volumePath: string,
): void {
  const path = joinPath(parent.path, seed.name)
  const createdAt = parseTimestamp(seed.createdAt, fallbackTimestamp)
  const modifiedAt = parseTimestamp(seed.modifiedAt, createdAt)

  const node: FsNode = {
    name: seed.name,
    path,
    parentPath: parent.path,
    kind: seed.kind,
    createdAt,
    modifiedAt,
    size: seed.kind === 'file' ? (seed.size ?? 0) : 0,
    hidden: seed.hidden,
    targetPath: seed.kind === 'symlink' && seed.target
      ? resolveSymlinkTargetPath(seed.target, volumePath, path)
      : undefined,
  }

  nodes[path] = node

  if (seed.kind === 'symlink') return

  for (const child of seed.children ?? []) {
    flattenStorageTree(child, node, nodes, createdAt, volumePath)
  }
}

export function createInitialFsNodes(): Record<string, FsNode> {
  const nodes: Record<string, FsNode> = {}
  const fallbackTimestamp = Date.parse('2025-06-12T06:50:00.000Z')

  nodes[FS_COMPUTER_ROOT_PATH] = createFsNode(
    'yuzuha website',
    FS_COMPUTER_ROOT_PATH,
    null,
    'volume',
    fallbackTimestamp,
  )

  nodes[FS_NETWORK_PATH] = createFsNode(
    '网络',
    FS_NETWORK_PATH,
    FS_COMPUTER_ROOT_PATH,
    'folder',
    fallbackTimestamp,
  )

  for (const device of getAllStorageDevices()) {
    const createdAt = fallbackTimestamp
    const volumeNode = createFsNode(
      device.name,
      device.path,
      FS_COMPUTER_ROOT_PATH,
      'volume',
      createdAt,
    )

    nodes[device.path] = volumeNode

    for (const child of device.tree) {
      flattenStorageTree(child, volumeNode, nodes, createdAt, device.path)
    }
  }

  return nodes
}
