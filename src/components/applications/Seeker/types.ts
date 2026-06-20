import type { SeekerSidebarSection, SeekerViewMode } from './Main/types'

export interface SeekerTagItem {
  id: string
  label: string
  color: string
}

export interface SeekerGlobalStore {
  sidebarSections: SeekerSidebarSection[]
  tagItems: SeekerTagItem[]
  collapsedSidebarSectionIds: string[]
  showHiddenFiles: boolean
  defaultViewMode: SeekerViewMode
  setSidebarItemChecked: (sectionId: string, itemId: string, checked: boolean) => void
  toggleSidebarSectionCollapsed: (sectionId: string) => void
  setShowHiddenFiles: (showHiddenFiles: boolean) => void
  setDefaultViewMode: (viewMode: SeekerViewMode) => void
}
