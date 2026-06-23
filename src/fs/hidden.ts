import type { FsNode } from '~types'

export function isFsNodeHidden(node: Pick<FsNode, 'name' | 'hidden'>): boolean {
  return Boolean(node.hidden) || node.name.startsWith('.')
}

export function isFsNodeVisible(node: Pick<FsNode, 'name' | 'hidden'>, showHiddenFiles: boolean): boolean {
  if (showHiddenFiles) return true
  return !isFsNodeHidden(node)
}

export function filterVisibleFsNodes<T extends Pick<FsNode, 'name' | 'hidden'>>(
  nodes: T[],
  showHiddenFiles: boolean,
): T[] {
  if (showHiddenFiles) return nodes
  return nodes.filter((node) => !isFsNodeHidden(node))
}
