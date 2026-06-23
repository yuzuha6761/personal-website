export type FsNodeKind = 'volume' | 'folder' | 'file' | 'symlink'

export type FsFileIcon = 'folder' | 'scss' | 'tsx'

export interface FsNode {
  name: string
  path: string
  parentPath: string | null
  kind: FsNodeKind
  createdAt: number
  modifiedAt: number
  size: number
  hidden?: boolean
  targetPath?: string
}

export interface FsDirectoryEntry {
  name: string
  path: string
  resolvePath: string
  created: string
  modified: string
  size: string
  kind: string
  icon: FsFileIcon
  hidden: boolean
  navigable: boolean
  isAlias: boolean
  deviceIcon?: string
}

export interface FsStore {
  nodes: Record<string, FsNode>
  isReady: boolean
  replaceNodes: (nodes: Record<string, FsNode>) => void
  getNodeByPath: (path: string) => FsNode | undefined
  listDirectory: (path: string) => FsDirectoryEntry[]
  createFolder: (parentPath: string, name: string) => FsNode | undefined
  removeNode: (path: string) => void
}
