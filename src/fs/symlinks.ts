import type { FsNode } from '~types'
import { joinPath } from './paths'

const MAX_SYMLINK_DEPTH = 16

export function resolveSymlinkTargetPath(
  target: string,
  volumePath: string,
  linkPath: string,
): string {
  if (target.startsWith('/')) return target
  if (target.startsWith('private/') || target === 'private') {
    return joinPath(volumePath, target)
  }

  const parentPath = linkPath.slice(0, linkPath.lastIndexOf('/')) || '/'
  return joinPath(parentPath, target)
}

export function resolveFsPath(nodes: Record<string, FsNode>, path: string): string {
  let current = path

  for (let depth = 0; depth < MAX_SYMLINK_DEPTH; depth += 1) {
    const node = nodes[current]
    if (!node || node.kind !== 'symlink' || !node.targetPath) return current
    current = node.targetPath
  }

  return current
}

export function isFsNodeNavigable(node: FsNode, nodes: Record<string, FsNode>): boolean {
  if (node.kind === 'folder' || node.kind === 'volume') return true
  if (node.kind !== 'symlink' || !node.targetPath) return false

  const target = nodes[node.targetPath]
  return target?.kind === 'folder' || target?.kind === 'volume'
}

export function resolveFsNavigationPath(node: FsNode, nodes: Record<string, FsNode>): string {
  if (node.kind === 'symlink' && node.targetPath) {
    return resolveFsPath(nodes, node.targetPath)
  }

  if (node.kind === 'symlink') {
    return resolveFsPath(nodes, node.path)
  }

  return node.path
}
