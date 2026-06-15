export const SEEKER_DEFAULT_TAB_PATH = '/Users/yuzuha'

export const SEEKER_TAB_CHROME = {
  activeBackground: '#f4f4f4',
  inactiveBackground: '#e6e5e5',
  inactiveHoverBackground: '#d8d7d7',
  inactiveCloseBackground: '#d4d3d3',
  inactiveCloseBackgroundOnTabHover: '#c6c5c5',
  inactiveCloseBackgroundHover: '#b5b4b4',
  inactiveCloseBackgroundActive: '#8a8989',
  divider: '#d5d4d4',
  bottomBorder: '#d9d9d9',
} as const

export function shouldShowSeekerTabBar(tabCount: number): boolean {
  return tabCount > 1
}

export type SeekerViewMode = 'icon' | 'list' | 'column' | 'gallery'

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

export interface SeekerTabState {
  id: string
  path: string
  label: string
}

export interface SeekerWindowState {
  tabs: SeekerTabState[]
  activeTabId: string
  viewMode: SeekerViewMode
  selection: string[]
  historyBack: string[]
  historyForward: string[]
}

export interface SeekerWindowStore {
  windows: Record<string, SeekerWindowState>
  initWindow: (windowId: string) => void
  removeWindow: (windowId: string) => void
  setActiveTab: (windowId: string, tabId: string) => void
  addTab: (windowId: string, path: string, label?: string) => void
  closeTab: (windowId: string, tabId: string) => void
  moveTabs: (windowId: string, tabIds: string[]) => void
  navigateTo: (windowId: string, path: string) => void
  goBack: (windowId: string) => void
  goForward: (windowId: string) => void
  setViewMode: (windowId: string, viewMode: SeekerViewMode) => void
  setSelection: (windowId: string, selection: string[]) => void
}
