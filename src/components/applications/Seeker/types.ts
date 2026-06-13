import type { SeekerSidebarSection, SeekerViewMode } from './Main/types'

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
