import type { SeekerListSortOption } from '~/components/applications/Seeker/listContextMenu'
import { getHomePath } from '~/session/paths'

export type { SeekerListSortOption }

export function getDefaultTabPath(): string {
  return getHomePath()
}

export const TAB_CHROME = {
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

export function shouldShowTabBar(tabCount: number): boolean {
  return tabCount > 1
}

export type ViewMode = 'icon' | 'list' | 'column' | 'gallery'

export type SidebarIcon =
  | 'airdrop'
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
  | 'hard-drive'
  | 'external-disk'
  | 'disc'
  | 'server'
  | 'network'
  | 'globe'
  | 'tag'

export interface SidebarItem {
  id: string
  label: string
  icon: SidebarIcon
  active?: boolean
  checked?: boolean
  indeterminate?: boolean
}

export interface SidebarSection {
  id: string
  title?: string
  items: SidebarItem[]
}

export interface TabState {
  id: string
  path: string
  label: string
  historyBack: string[]
  historyForward: string[]
}

export interface MainWindowState {
  tabs: TabState[]
  activeTabId: string
  viewMode: ViewMode
  selection: string[]
}

export interface MainWindowStore {
  windows: Record<string, MainWindowState>
  initWindow: (windowId: string) => void
  removeWindow: (windowId: string) => void
  setActiveTab: (windowId: string, tabId: string) => void
  addTab: (windowId: string, path: string, label?: string) => void
  closeTab: (windowId: string, tabId: string) => void
  closeOtherTabs: (windowId: string, tabId: string) => void
  moveTabs: (windowId: string, tabIds: string[]) => void
  navigateTo: (windowId: string, path: string) => void
  goBack: (windowId: string) => void
  goForward: (windowId: string) => void
  setViewMode: (windowId: string, viewMode: ViewMode) => void
  setSelection: (windowId: string, selection: string[]) => void
  restoreWindowState: (windowId: string, snapshot: RestoreMainWindowSnapshot) => void
}

export interface RestoreMainWindowSnapshot {
  tabs: {
    path: string
    label?: string
    historyBack?: string[]
    historyForward?: string[]
  }[]
  activeTabIndex: number
  viewMode: ViewMode
  /** @deprecated Migrated to per-tab history on restore */
  historyBack?: string[]
  /** @deprecated Migrated to per-tab history on restore */
  historyForward?: string[]
}
