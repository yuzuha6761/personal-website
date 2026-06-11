import type { SeekerSidebarSection } from '../types'

export type SeekerViewMode = 'icon' | 'list' | 'column' | 'gallery'

export interface SeekerTagItem {
  id: string
  label: string
  color: string
}

export interface SeekerGlobalStore {
  sidebarSections: SeekerSidebarSection[]
  tagItems: SeekerTagItem[]
  showHiddenFiles: boolean
  defaultViewMode: SeekerViewMode
  setShowHiddenFiles: (showHiddenFiles: boolean) => void
  setDefaultViewMode: (viewMode: SeekerViewMode) => void
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
  navigateTo: (windowId: string, path: string) => void
  goBack: (windowId: string) => void
  goForward: (windowId: string) => void
  setViewMode: (windowId: string, viewMode: SeekerViewMode) => void
  setSelection: (windowId: string, selection: string[]) => void
}
