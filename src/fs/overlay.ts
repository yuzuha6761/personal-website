import type { FsNode } from '~types'
import { collectDescendantPaths } from './paths'

export interface FsOverlay {
  created: Record<string, FsNode>
  removed: string[]
}

export const EMPTY_FS_OVERLAY: FsOverlay = {
  created: {},
  removed: [],
}

export function extractHomeSubtree(
  nodes: Record<string, FsNode>,
  homePath: string,
): Record<string, FsNode> {
  const subtree: Record<string, FsNode> = {}
  const homeNode = nodes[homePath]
  if (!homeNode) return subtree

  subtree[homePath] = homeNode

  for (const path of Object.keys(nodes)) {
    if (path.startsWith(`${homePath}/`)) {
      subtree[path] = nodes[path]
    }
  }

  return subtree
}

export function applyFsOverlay(
  baseNodes: Record<string, FsNode>,
  homePath: string,
  overlay: FsOverlay,
): Record<string, FsNode> {
  const nextNodes = { ...baseNodes }
  const removedSet = new Set<string>()

  for (const path of overlay.removed) {
    if (!path.startsWith(homePath) && path !== homePath) continue

    for (const descendantPath of collectDescendantPaths(nextNodes, path)) {
      removedSet.add(descendantPath)
      delete nextNodes[descendantPath]
    }
  }

  for (const [path, node] of Object.entries(overlay.created)) {
    if (!path.startsWith(homePath) && path !== homePath) continue
    if (removedSet.has(path)) continue
    nextNodes[path] = node
  }

  return nextNodes
}

export function diffHomeTrees(
  baseHomeNodes: Record<string, FsNode>,
  effectiveHomeNodes: Record<string, FsNode>,
): FsOverlay {
  const created: Record<string, FsNode> = {}
  const removed: string[] = []

  for (const [path, node] of Object.entries(effectiveHomeNodes)) {
    if (!baseHomeNodes[path]) {
      created[path] = node
    }
  }

  for (const path of Object.keys(baseHomeNodes)) {
    if (!effectiveHomeNodes[path]) {
      removed.push(path)
    }
  }

  return { created, removed }
}

export function applyFsOverlayToEffectiveHome(
  baseHomeNodes: Record<string, FsNode>,
  overlay: FsOverlay,
): Record<string, FsNode> {
  const homePath = Object.keys(baseHomeNodes).find((path) => {
    const node = baseHomeNodes[path]
    return node.parentPath?.endsWith('/Users') ?? false
  }) ?? Object.keys(baseHomeNodes)[0]

  if (!homePath) return { ...baseHomeNodes }

  return extractHomeSubtree(
    applyFsOverlay(baseHomeNodes, homePath, overlay),
    homePath,
  )
}

export function compactFsOverlay(
  overlay: FsOverlay,
  baseHomeNodes: Record<string, FsNode>,
): FsOverlay {
  const effective = applyFsOverlayToEffectiveHome(baseHomeNodes, overlay)
  return diffHomeTrees(baseHomeNodes, effective)
}

export function recordFsNodeCreation(
  overlay: FsOverlay,
  node: FsNode,
  baseNodes: Record<string, FsNode>,
): FsOverlay {
  const nextRemoved = overlay.removed.filter((path) => (
    path !== node.path && !path.startsWith(`${node.path}/`)
  ))

  if (baseNodes[node.path]) {
    return {
      created: { ...overlay.created, [node.path]: node },
      removed: nextRemoved,
    }
  }

  return {
    created: { ...overlay.created, [node.path]: node },
    removed: nextRemoved,
  }
}

export function recordFsNodeRemoval(
  overlay: FsOverlay,
  path: string,
  baseNodes: Record<string, FsNode>,
): FsOverlay {
  const nextCreated = { ...overlay.created }
  delete nextCreated[path]

  for (const createdPath of Object.keys(nextCreated)) {
    if (createdPath.startsWith(`${path}/`)) {
      delete nextCreated[createdPath]
    }
  }

  if (baseNodes[path] || Object.keys(baseNodes).some((basePath) => basePath.startsWith(`${path}/`))) {
    const removed = overlay.removed.includes(path)
      ? overlay.removed
      : [...overlay.removed, path]
    return { created: nextCreated, removed }
  }

  return { created: nextCreated, removed: overlay.removed }
}

export function homeSnapshotToOverlay(
  baseHomeNodes: Record<string, FsNode>,
  homeSnapshot: Record<string, FsNode>,
): FsOverlay {
  return diffHomeTrees(baseHomeNodes, homeSnapshot)
}
