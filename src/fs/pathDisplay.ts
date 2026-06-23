import type { FsNode } from '~types'
import { getHomePath } from '~/session/paths'
import useSessionStore from '~/session/store'
import { getLegacyHomePath } from './paths'

export function getPathDisplayLabel(path: string, nodes: Record<string, FsNode>): string {
  const node = nodes[path]
  if (!node) return path.split('/').at(-1) ?? path

  try {
    const homePath = useSessionStore.getState().currentUserId ? getHomePath() : getLegacyHomePath()
    if (path === homePath) {
      return useSessionStore.getState().getCurrentUser().displayName
    }
  } catch {
    if (path === getLegacyHomePath()) return 'yuzuha'
  }

  return node.name
}
