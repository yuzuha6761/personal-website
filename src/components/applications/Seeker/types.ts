import type { SidebarSection, ViewMode } from './Main/types'
import type { SeekerDirectorySortByRecord, SeekerListSortOption } from './listContextMenu'
import type { SeekerListColumnId } from './listColumnLayout'
import type { SeekerNewWindowPathOption } from './newWindowPath'

export interface SeekerTagItem {
  id: string
  label: string
  color: string
}

export interface SeekerGlobalStore {
  sidebarSections: SidebarSection[]
  tagItems: SeekerTagItem[]
  collapsedSidebarSectionIds: string[]
  defaultViewMode: ViewMode
  newWindowPathOption: SeekerNewWindowPathOption
  directorySortBy: SeekerDirectorySortByRecord
  listColumnOrder: SeekerListColumnId[]
  setSidebarItemChecked: (sectionId: string, itemId: string, checked: boolean) => void
  toggleSidebarSectionCollapsed: (sectionId: string) => void
  setDefaultViewMode: (viewMode: ViewMode) => void
  setNewWindowPathOption: (option: SeekerNewWindowPathOption) => void
  setDirectorySortBy: (path: string, sortBy: SeekerListSortOption, ascending?: boolean) => void
  setListColumnOrder: (order: SeekerListColumnId[]) => void
}
