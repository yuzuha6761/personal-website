import type { SeekerSidebarSection, SeekerViewMode } from './Main/types'
import type { SeekerNewWindowPathOption } from './newWindowPath'

export interface SeekerTagItem {
  id: string
  label: string
  color: string
}

export interface SeekerGlobalStore {
  sidebarSections: SeekerSidebarSection[]
  tagItems: SeekerTagItem[]
  collapsedSidebarSectionIds: string[]
  defaultViewMode: SeekerViewMode
  newWindowPathOption: SeekerNewWindowPathOption
  setSidebarItemChecked: (sectionId: string, itemId: string, checked: boolean) => void
  toggleSidebarSectionCollapsed: (sectionId: string) => void
  setDefaultViewMode: (viewMode: SeekerViewMode) => void
  setNewWindowPathOption: (option: SeekerNewWindowPathOption) => void
}
