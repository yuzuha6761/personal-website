export type SeekerSidebarIcon =
  | 'clock'
  | 'applications'
  | 'movies'
  | 'music'
  | 'pictures'
  | 'downloads'
  | 'home'
  | 'cloud-drive'
  | 'document'
  | 'desktop'
  | 'shared'
  | 'computer'
  | 'network'

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
