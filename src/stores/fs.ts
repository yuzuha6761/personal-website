import { create } from 'zustand'
import type { FsDirectoryEntry, FsNode, FsStore } from '~types'
import { createInitialFsNodes } from '../services/fs/seed'

function toDirectoryEntry(node: FsNode): FsDirectoryEntry {
  return {
    id: node.id,
    name: node.name,
    modified: node.modified ?? '--',
    size: node.kind === 'folder' ? '--' : (node.size ?? '--'),
    kind: node.kind === 'folder' ? '文件夹' : (node.fileKind ?? '文件'),
    icon: node.icon ?? 'folder',
  }
}

const useFsStore = create<FsStore>((set, get) => ({
  nodes: createInitialFsNodes(),

  getNodeByPath: (path) => {
    return Object.values(get().nodes).find((node) => node.path === path)
  },

  getNodeById: (id) => get().nodes[id],

  listDirectory: (path) => {
    const directory = get().getNodeByPath(path)
    if (!directory || directory.kind === 'file') return []

    return directory.childIds
      .map((childId) => get().nodes[childId])
      .filter((node): node is FsNode => Boolean(node))
      .map(toDirectoryEntry)
  },

  createFolder: (parentPath, name) => {
    const parent = get().getNodeByPath(parentPath)
    if (!parent || parent.kind === 'file') return undefined

    const path = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`
    if (get().getNodeByPath(path)) return undefined

    const folder: FsNode = {
      id: crypto.randomUUID(),
      name,
      path,
      parentId: parent.id,
      kind: 'folder',
      childIds: [],
      modified: '今天',
      icon: 'folder',
    }

    set((state) => ({
      nodes: {
        ...state.nodes,
        [folder.id]: folder,
        [parent.id]: {
          ...parent,
          childIds: [...parent.childIds, folder.id],
        },
      },
    }))

    return folder
  },

  removeNode: (path) => {
    const target = get().getNodeByPath(path)
    if (!target || !target.parentId) return

    const parent = get().nodes[target.parentId]
    if (!parent) return

    const removeIds = new Set<string>()
    const collectIds = (nodeId: string) => {
      removeIds.add(nodeId)
      const node = get().nodes[nodeId]
      node?.childIds.forEach(collectIds)
    }
    collectIds(target.id)

    set((state) => {
      const nextNodes = { ...state.nodes }

      for (const nodeId of removeIds) {
        delete nextNodes[nodeId]
      }

      nextNodes[parent.id] = {
        ...parent,
        childIds: parent.childIds.filter((childId) => childId !== target.id),
      }

      return { nodes: nextNodes }
    })
  },
}))

export default useFsStore
