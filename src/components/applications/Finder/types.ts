export type FinderSidebarIcon =
  | 'recents'
  | 'applications'
  | 'movies'
  | 'music'
  | 'pictures'
  | 'downloads'
  | 'home'
  | 'icloud'
  | 'document'
  | 'desktop'
  | 'shared'
  | 'computer'
  | 'network'

export type FinderItemIcon = 'folder' | 'scss' | 'tsx'

export interface FinderSidebarItem {
  id: string
  label: string
  icon: FinderSidebarIcon
  active?: boolean
}

export interface FinderSidebarSection {
  id: string
  title?: string
  items: FinderSidebarItem[]
}

export interface FinderTab {
  id: string
  label: string
  active?: boolean
}

export interface FinderListItem {
  id: string
  name: string
  modified: string
  size: string
  kind: string
  icon: FinderItemIcon
  expanded?: boolean
  selected?: boolean
}
