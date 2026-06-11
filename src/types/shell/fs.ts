export type FsNodeKind = 'volume' | 'folder' | 'file'

export type FsFileIcon = 'folder' | 'scss' | 'tsx'

export interface FsNode {
  id: string
  name: string
  path: string
  parentId: string | null
  kind: FsNodeKind
  childIds: string[]
  modified?: string
  size?: string
  fileKind?: string
  icon?: FsFileIcon
}

export interface FsDirectoryEntry {
  id: string
  name: string
  modified: string
  size: string
  kind: string
  icon: FsFileIcon
}

export interface FsStore {
  nodes: Record<string, FsNode>
  getNodeByPath: (path: string) => FsNode | undefined
  getNodeById: (id: string) => FsNode | undefined
  listDirectory: (path: string) => FsDirectoryEntry[]
  createFolder: (parentPath: string, name: string) => FsNode | undefined
  removeNode: (path: string) => void
}
