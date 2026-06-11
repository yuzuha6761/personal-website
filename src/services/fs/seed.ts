import type { FsNode } from '~types'

function createNode(
  node: Omit<FsNode, 'childIds'> & { childIds?: string[] },
): FsNode {
  return {
    childIds: [],
    ...node,
  }
}

export function createInitialFsNodes(): Record<string, FsNode> {
  const nodes: Record<string, FsNode> = {}

  const addNode = (node: FsNode) => {
    nodes[node.id] = node
  }

  const mac = createNode({
    id: 'volume-mac',
    name: '雪ちゃん的 Mac',
    path: '/',
    parentId: null,
    kind: 'volume',
  })

  const home = createNode({
    id: 'home',
    name: 'yuki',
    path: '~',
    parentId: mac.id,
    kind: 'folder',
  })

  const desktop = createNode({
    id: 'desktop-folder',
    name: 'Desktop',
    path: '~/Desktop',
    parentId: home.id,
    kind: 'folder',
  })

  const documents = createNode({
    id: 'documents-folder',
    name: 'Documents',
    path: '~/Documents',
    parentId: home.id,
    kind: 'folder',
  })

  const downloads = createNode({
    id: 'downloads-folder',
    name: 'Downloads',
    path: '~/Downloads',
    parentId: home.id,
    kind: 'folder',
  })

  const components = createNode({
    id: 'components-folder',
    name: 'components',
    path: '~/components',
    parentId: home.id,
    kind: 'folder',
  })

  const applications = createNode({
    id: 'applications-folder',
    name: 'applications',
    path: '~/components/applications',
    parentId: components.id,
    kind: 'folder',
    modified: '今天 14:50',
    icon: 'folder',
  })

  const componentFiles: Array<Omit<FsNode, 'childIds'>> = [
    {
      id: 'application-window-styles',
      name: 'ApplicationWindow.module.scss',
      path: '~/components/ApplicationWindow.module.scss',
      parentId: components.id,
      kind: 'file',
      modified: '今天 14:51',
      size: '1 KB',
      fileKind: 'SASS file',
      icon: 'scss',
    },
    {
      id: 'application-window',
      name: 'ApplicationWindow.tsx',
      path: '~/components/ApplicationWindow.tsx',
      parentId: components.id,
      kind: 'file',
      modified: '今天 14:50',
      size: '2 KB',
      fileKind: 'React source code',
      icon: 'tsx',
    },
    {
      id: 'desktop-file',
      name: 'Desktop.tsx',
      path: '~/components/Desktop.tsx',
      parentId: components.id,
      kind: 'file',
      modified: '今天 14:50',
      size: '1 KB',
      fileKind: 'React source code',
      icon: 'tsx',
    },
    {
      id: 'dock-styles',
      name: 'Dock.module.scss',
      path: '~/components/Dock.module.scss',
      parentId: components.id,
      kind: 'file',
      modified: '2025年4月18日 12:27',
      size: '3 KB',
      fileKind: 'SASS file',
      icon: 'scss',
    },
    {
      id: 'dock',
      name: 'Dock.tsx',
      path: '~/components/Dock.tsx',
      parentId: components.id,
      kind: 'file',
      modified: '今天 14:50',
      size: '2 KB',
      fileKind: 'React source code',
      icon: 'tsx',
    },
    {
      id: 'menu-bar-styles',
      name: 'MenuBar.module.scss',
      path: '~/components/MenuBar.module.scss',
      parentId: components.id,
      kind: 'file',
      modified: '2025年4月18日 12:27',
      size: '1 KB',
      fileKind: 'SASS file',
      icon: 'scss',
    },
    {
      id: 'menu-bar',
      name: 'MenuBar.tsx',
      path: '~/components/MenuBar.tsx',
      parentId: components.id,
      kind: 'file',
      modified: '2025年4月18日 12:27',
      size: '2 KB',
      fileKind: 'React source code',
      icon: 'tsx',
    },
  ]

  mac.childIds = [home.id]
  home.childIds = [desktop.id, documents.id, downloads.id, components.id]
  components.childIds = [
    applications.id,
    ...componentFiles.map((file) => file.id),
  ]
  applications.childIds = []

  addNode(mac)
  addNode(home)
  addNode(desktop)
  addNode(documents)
  addNode(downloads)
  addNode(components)
  addNode(applications)
  componentFiles.forEach((file) => addNode(createNode(file)))

  return nodes
}
