import type { FsDirectoryEntry, FsFileIcon, FsNode, FsNodeKind } from '~types'
import { isFsNodeHidden } from './hidden'
import { isFsNodeNavigable, resolveFsNavigationPath } from './symlinks'
import { getVolumesMountDeviceIcon } from './volumes'

const FILE_KIND_BY_EXTENSION: Record<string, string> = {
  scss: 'SASS file',
  sass: 'SASS file',
  css: 'CSS style sheet',
  tsx: 'React source code',
  ts: 'TypeScript source code',
  jsx: 'JavaScript source code',
  js: 'JavaScript source code',
  json: 'JSON document',
  md: 'Markdown document',
  svg: 'SVG image',
  png: 'PNG image',
  jpg: 'JPEG image',
  jpeg: 'JPEG image',
  pdf: 'PDF document',
  txt: 'Plain text document',
}

function getExtension(name: string): string {
  const index = name.lastIndexOf('.')
  if (index <= 0) return ''
  return name.slice(index + 1).toLowerCase()
}

export function resolveFsFileIcon(name: string, kind: FsNodeKind): FsFileIcon {
  if (kind === 'folder' || kind === 'volume' || kind === 'symlink') return 'folder'

  const extension = getExtension(name)
  if (extension === 'scss' || extension === 'sass') return 'scss'
  return 'tsx'
}

export function resolveFsKindLabel(name: string, kind: FsNodeKind): string {
  if (kind === 'volume') return '宗卷'
  if (kind === 'folder') return '文件夹'
  if (kind === 'symlink') return '替身'

  const extension = getExtension(name)
  return FILE_KIND_BY_EXTENSION[extension] ?? '文件'
}

export function formatFsBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`

  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`

  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`

  return `${(mb / 1024).toFixed(1)} GB`
}

export function formatFsTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const time = `${hours}:${minutes}`

  if (date.toDateString() === now.toDateString()) {
    return `今天 ${time}`
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${time}`
}

export function toDirectoryEntry(node: FsNode, nodes: Record<string, FsNode>): FsDirectoryEntry {
  return {
    name: node.name,
    path: node.path,
    resolvePath: resolveFsNavigationPath(node, nodes),
    created: formatFsTimestamp(node.createdAt),
    modified: formatFsTimestamp(node.modifiedAt),
    size: node.kind === 'file' ? formatFsBytes(node.size) : '--',
    kind: resolveFsKindLabel(node.name, node.kind),
    icon: resolveFsFileIcon(node.name, node.kind),
    hidden: isFsNodeHidden(node),
    navigable: isFsNodeNavigable(node, nodes),
    isAlias: node.kind === 'symlink',
    deviceIcon: getVolumesMountDeviceIcon(node),
  }
}
