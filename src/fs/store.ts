import { create } from 'zustand'
import type { FsNode, FsStore } from '~types'
import { toDirectoryEntry } from './metadata'
import { collectDescendantPaths, joinPath, listChildNodes } from './paths'
import { createInitialFsNodes } from './seed'

const useFsStore = create<FsStore>((set, get) => ({
  nodes: createInitialFsNodes(),

  getNodeByPath: (path) => get().nodes[path],

  listDirectory: (path) => {
    const directory = get().getNodeByPath(path)
    if (!directory || directory.kind === 'file') return []

    return listChildNodes(get().nodes, path).map(toDirectoryEntry)
  },

  createFolder: (parentPath, name) => {
    const parent = get().getNodeByPath(parentPath)
    if (!parent || parent.kind === 'file') return undefined

    const path = joinPath(parentPath, name)
    if (get().getNodeByPath(path)) return undefined

    const now = Date.now()
    const folder: FsNode = {
      name,
      path,
      parentPath,
      kind: 'folder',
      createdAt: now,
      modifiedAt: now,
      size: 0,
    }

    set((state) => ({
      nodes: {
        ...state.nodes,
        [path]: folder,
      },
    }))

    return folder
  },

  removeNode: (path) => {
    const target = get().getNodeByPath(path)
    if (!target || target.parentPath === null) return

    const pathsToRemove = collectDescendantPaths(get().nodes, path)

    set((state) => {
      const nextNodes = { ...state.nodes }
      for (const nodePath of pathsToRemove) {
        delete nextNodes[nodePath]
      }
      return { nodes: nextNodes }
    })
  },
}))

export default useFsStore
