import type { FsNode } from '~types'

let baseNodes: Record<string, FsNode> = {}

export function setBaseFsNodes(nodes: Record<string, FsNode>): void {
  baseNodes = nodes
}

export function getBaseFsNodes(): Record<string, FsNode> {
  return baseNodes
}
