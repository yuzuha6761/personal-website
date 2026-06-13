export type FsNodeKind = 'volume' | 'folder' | 'file'

export type FsFileIcon = 'folder' | 'scss' | 'tsx'

export interface FsNode {
  name: string
  path: string
  parentPath: string | null
  kind: FsNodeKind
  createdAt: number
  modifiedAt: number
  size: number
}

export interface FsDirectoryEntry {
  name: string
  path: string
  created: string
  modified: string
  size: string
  kind: string
  icon: FsFileIcon
}

export interface FsStore {
  nodes: Record<string, FsNode>
  getNodeByPath: (path: string) => FsNode | undefined
  listDirectory: (path: string) => FsDirectoryEntry[]
  createFolder: (parentPath: string, name: string) => FsNode | undefined
  removeNode: (path: string) => void
}
