import type { FsNode, FsNodeKind } from '~types'
import { joinPath } from './paths'
import seedTree from './seed.json'

interface FsSeedNode {
  name: string
  kind: FsNodeKind
  path?: string
  createdAt?: string
  modifiedAt?: string
  size?: number
  children?: FsSeedNode[]
}

function parseTimestamp(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? fallback : timestamp
}

function flattenSeedTree(
  seed: FsSeedNode,
  parent: FsNode | null,
  nodes: Record<string, FsNode>,
  fallbackTimestamp: number,
): FsNode {
  const path = seed.path ?? (parent ? joinPath(parent.path, seed.name) : seed.name)
  const createdAt = parseTimestamp(seed.createdAt, fallbackTimestamp)
  const modifiedAt = parseTimestamp(seed.modifiedAt, createdAt)

  const node: FsNode = {
    name: seed.name,
    path,
    parentPath: parent?.path ?? null,
    kind: seed.kind,
    createdAt,
    modifiedAt,
    size: seed.kind === 'file' ? (seed.size ?? 0) : 0,
  }

  nodes[path] = node

  for (const child of seed.children ?? []) {
    flattenSeedTree(child, node, nodes, createdAt)
  }

  return node
}

export function createInitialFsNodes(): Record<string, FsNode> {
  const nodes: Record<string, FsNode> = {}
  const fallbackTimestamp = Date.parse('2025-06-12T06:50:00.000Z')
  flattenSeedTree(seedTree as FsSeedNode, null, nodes, fallbackTimestamp)
  return nodes
}
