import type { FsNode } from '~types'

export function joinPath(parentPath: string, name: string): string {
  if (parentPath === '/') return `/${name}`
  return `${parentPath}/${name}`
}

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
  if (path === '/Users/yuzuha') return 'yuzuha'
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
