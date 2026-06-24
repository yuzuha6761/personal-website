import type { FsDirectoryEntry, FsNode } from '~types'
import { getPathLastOpenedAt } from './pathLastOpened'
import type { SeekerListSortOption } from '../../listContextMenu'

const LOCALE = 'zh-CN'

function compareFolderFirst(left: FsDirectoryEntry, right: FsDirectoryEntry): number {
  if (left.navigable === right.navigable) return 0
  return left.navigable ? -1 : 1
}

function compareName(left: FsDirectoryEntry, right: FsDirectoryEntry): number {
  return left.name.localeCompare(right.name, LOCALE, { sensitivity: 'base' })
}

function getNode(nodes: Record<string, FsNode>, entry: FsDirectoryEntry): FsNode | undefined {
  return nodes[entry.path]
}

export function sortItems(
  items: FsDirectoryEntry[],
  nodes: Record<string, FsNode>,
  sortBy: SeekerListSortOption,
  ascending = true,
): FsDirectoryEntry[] {
  if (sortBy === 'sort-none') {
    return items
  }

  const direction = ascending ? 1 : -1

  return [...items].sort((left, right) => {
    const folderCmp = compareFolderFirst(left, right)
    if (folderCmp !== 0) return folderCmp

    const leftNode = getNode(nodes, left)
    const rightNode = getNode(nodes, right)

    let cmp = 0

    switch (sortBy) {
      case 'sort-name':
        cmp = compareName(left, right)
        break
      case 'sort-kind':
        cmp = left.kind.localeCompare(right.kind, LOCALE, { sensitivity: 'base' }) || compareName(left, right)
        break
      case 'sort-date-opened': {
        const leftOpened = getPathLastOpenedAt(left.path, leftNode?.modifiedAt ?? 0)
        const rightOpened = getPathLastOpenedAt(right.path, rightNode?.modifiedAt ?? 0)
        cmp = leftOpened - rightOpened
        break
      }
      case 'sort-added':
      case 'sort-created':
        cmp = (leftNode?.createdAt ?? 0) - (rightNode?.createdAt ?? 0)
        break
      case 'sort-modified':
        cmp = (leftNode?.modifiedAt ?? 0) - (rightNode?.modifiedAt ?? 0)
        break
      case 'sort-size':
        cmp = (leftNode?.size ?? 0) - (rightNode?.size ?? 0)
        break
      case 'sort-tags':
        cmp = compareName(left, right)
        break
      default:
        cmp = 0
    }

    return (cmp || compareName(left, right)) * direction
  })
}
