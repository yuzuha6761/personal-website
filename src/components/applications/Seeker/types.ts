export type SeekerSidebarIcon =
  | 'clock'
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

export type SeekerItemIcon = 'folder' | 'scss' | 'tsx'

export interface SeekerSidebarItem {
  id: string
  label: string
  icon: SeekerSidebarIcon
  active?: boolean
}

export interface SeekerSidebarSection {
  id: string
  title?: string
  items: SeekerSidebarItem[]
}

export interface SeekerTab {
  id: string
  label: string
  active?: boolean
}

export interface SeekerListItem {
  id: string
  name: string
  modified: string
  size: string
  kind: string
  icon: SeekerItemIcon
  expanded?: boolean
  selected?: boolean
}
