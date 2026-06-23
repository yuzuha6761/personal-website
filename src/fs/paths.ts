import type { FsNode } from '~types'
import { getBootStorageDevice } from '~/storages'

export const FS_COMPUTER_ROOT_PATH = '/'
export const FS_NETWORK_PATH = '/网络'

const bootStorageDevice = getBootStorageDevice()

export const FS_BOOT_VOLUME_PATH = bootStorageDevice.path
/** @deprecated Use FS_BOOT_VOLUME_PATH */
export const FS_MCINTOSH_HD_PATH = FS_BOOT_VOLUME_PATH

export function joinPath(parentPath: string, name: string): string {
  if (parentPath === '/') return `/${name}`
  return `${parentPath}/${name}`
}

export const FS_HOME_PATH = joinPath(FS_BOOT_VOLUME_PATH, 'Users/yuzuha')

export function buildPathChainFromCurrent(path: string): string[] {
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

export function getPathDisplayLabel(path: string, nodes: Record<string, FsNode>): string {
  const node = nodes[path]
  if (!node) return path.split('/').at(-1) ?? path
  if (path === FS_HOME_PATH) return 'yuzuha'
  return node.name
}

export function listChildNodes(nodes: Record<string, FsNode>, directoryPath: string): FsNode[] {
  return Object.values(nodes)
    .filter((node) => node.parentPath === directoryPath)
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
}

export function collectDescendantPaths(nodes: Record<string, FsNode>, targetPath: string): string[] {
  return Object.keys(nodes).filter((path) => (
    path === targetPath || path.startsWith(`${targetPath}/`)
  ))
}
