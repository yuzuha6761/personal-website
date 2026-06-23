import type { StorageTreeNode } from '~/storages/types'

const builtinUserTreeModules = import.meta.glob(
  '../storages/hard-drive/mcintosh-hd/users/*/tree.json',
  { eager: true, import: 'default' },
) as Record<string, StorageTreeNode[]>

function resolveUserTreeModulePath(userId: string) {
  return `../storages/hard-drive/mcintosh-hd/users/${userId}/tree.json`
}

export function getBuiltinUserHomeTree(userId: string): StorageTreeNode[] {
  return builtinUserTreeModules[resolveUserTreeModulePath(userId)] ?? []
}

export function getRuntimeUserHomeTemplate(): StorageTreeNode[] {
  return getBuiltinUserHomeTree('_template')
}
