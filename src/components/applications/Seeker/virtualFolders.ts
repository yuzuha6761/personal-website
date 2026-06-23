import type { FsDirectoryEntry, FsNode } from '~types'
import { filterVisibleFsNodes } from '~/fs/hidden'
import { getPathDisplayLabel } from '~/fs/pathDisplay'
import { toDirectoryEntry } from '~/fs/metadata'
import { listFsDirectoryChildren } from '~/fs/volumes'
import { resolveFsPath } from '~/fs/symlinks'

export const SEEKER_VIRTUAL_PATH_PREFIX = 'seeker://'

export const SEEKER_RECENTS_PATH = `${SEEKER_VIRTUAL_PATH_PREFIX}recents`

interface SeekerVirtualFolderDefinition {
  label: string
}

const SEEKER_VIRTUAL_FOLDERS: Record<string, SeekerVirtualFolderDefinition> = {
  recents: { label: '最近使用' },
}

export function isSeekerVirtualPath(path: string): boolean {
  return path.startsWith(SEEKER_VIRTUAL_PATH_PREFIX)
}

export function getSeekerVirtualFolderId(path: string): string | undefined {
  if (!isSeekerVirtualPath(path)) return undefined

  const folderId = path.slice(SEEKER_VIRTUAL_PATH_PREFIX.length)
  return folderId in SEEKER_VIRTUAL_FOLDERS ? folderId : undefined
}

export function getSeekerPathLabel(path: string, nodes: Record<string, FsNode>): string {
  const folderId = getSeekerVirtualFolderId(path)
  if (folderId) {
    return SEEKER_VIRTUAL_FOLDERS[folderId].label
  }

  return getPathDisplayLabel(path, nodes)
}

export function buildSeekerPathChain(path: string): string[] {
  if (isSeekerVirtualPath(path)) {
    return [path]
  }

  const chain: string[] = []
  let current = path || '/'

  while (true) {
    chain.push(current)
    if (current === '/') break

    const slashIndex = current.lastIndexOf('/')
    current = slashIndex <= 0 ? '/' : current.slice(0, slashIndex)
  }

  return chain
}

export function listSeekerDirectory(
  path: string,
  nodes: Record<string, FsNode>,
  showHiddenFiles = false,
): FsDirectoryEntry[] {
  const folderId = getSeekerVirtualFolderId(path)
  if (!folderId) {
    const resolvedPath = resolveFsPath(nodes, path)
    return filterVisibleFsNodes(listFsDirectoryChildren(nodes, resolvedPath), showHiddenFiles)
      .map((node) => toDirectoryEntry(node, nodes))
  }

  switch (folderId) {
    case 'recents':
      return []
    default:
      return []
  }
}
