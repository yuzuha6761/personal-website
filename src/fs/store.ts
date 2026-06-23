import { create } from 'zustand'
import type { FsNode, FsStore } from '~types'
import useGlobalStore from '~/stores/global'
import { schedulePersistUserFs, getMemoryFsOverlay, setMemoryFsOverlay } from '~/persistence/userFs'
import { extractBaseHomeNodes } from '~/persistence/rebase'
import useSessionStore from '~/session/store'
import { toDirectoryEntry } from './metadata'
import { filterVisibleFsNodes } from './hidden'
import { collectDescendantPaths, joinPath } from './paths'
import { resolveFsPath } from './symlinks'
import { listFsDirectoryChildren, resolveVolumesMountNode } from './volumes'
import { getBaseFsNodes } from './baseNodes'
import { recordFsNodeCreation, recordFsNodeRemoval } from './overlay'

const useFsStore = create<FsStore>((set, get) => ({
  nodes: {},
  isReady: false,

  replaceNodes: (nodes) => set({ nodes, isReady: true }),

  getNodeByPath: (path) => get().nodes[path] ?? resolveVolumesMountNode(get().nodes, path),

  listDirectory: (path) => {
    const resolvedPath = resolveFsPath(get().nodes, path)
    const directory = get().nodes[resolvedPath]
    if (!directory || directory.kind === 'file') return []

    const showHiddenFiles = useGlobalStore.getState().showHiddenFiles
    return filterVisibleFsNodes(listFsDirectoryChildren(get().nodes, resolvedPath), showHiddenFiles)
      .map((node) => toDirectoryEntry(node, get().nodes))
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

    persistFsCreation(folder)

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

    persistFsRemoval(pathsToRemove)
  },
}))

function persistFsCreation(node: FsNode) {
  if (!useSessionStore.getState().currentUserId) return

  const user = useSessionStore.getState().getCurrentUser()
  if (node.path !== user.homePath && !node.path.startsWith(`${user.homePath}/`)) return

  const baseNodes = getBaseFsNodes()
  const baseHomeNodes = extractBaseHomeNodes(baseNodes, user.homePath)
  const overlay = recordFsNodeCreation(getMemoryFsOverlay(user.id), node, baseNodes)

  setMemoryFsOverlay(user.id, overlay)
  schedulePersistUserFs(user, overlay, baseHomeNodes)
}

function persistFsRemoval(removedPaths: string[]) {
  if (!useSessionStore.getState().currentUserId) return

  const user = useSessionStore.getState().getCurrentUser()
  const touchesHome = removedPaths.some((path) => (
    path === user.homePath || path.startsWith(`${user.homePath}/`)
  ))
  if (!touchesHome) return

  const baseNodes = getBaseFsNodes()
  const baseHomeNodes = extractBaseHomeNodes(baseNodes, user.homePath)
  let overlay = getMemoryFsOverlay(user.id)

  for (const path of removedPaths) {
    overlay = recordFsNodeRemoval(overlay, path, baseNodes)
  }

  setMemoryFsOverlay(user.id, overlay)
  schedulePersistUserFs(user, overlay, baseHomeNodes)
}

export default useFsStore
