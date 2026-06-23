import { create } from 'zustand'
import { sidebarSections, tagItems } from './data'
import { DEFAULT_SEEKER_NEW_WINDOW_PATH_OPTION } from './newWindowPath'
import type { SeekerGlobalStore } from './types'

const useSeekerGlobalStore = create<SeekerGlobalStore>((set) => ({
  sidebarSections,
  tagItems,
  collapsedSidebarSectionIds: [],
  defaultViewMode: 'list',
  newWindowPathOption: DEFAULT_SEEKER_NEW_WINDOW_PATH_OPTION,

  setSidebarItemChecked: (sectionId, itemId, checked) => {
    set((state) => ({
      sidebarSections: state.sidebarSections.map((section) => {
        if (section.id !== sectionId) return section

        return {
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId || item.indeterminate) return item
            return { ...item, checked }
          }),
        }
      }),
    }))
  },
  toggleSidebarSectionCollapsed: (sectionId) => {
    set((state) => ({
      collapsedSidebarSectionIds: state.collapsedSidebarSectionIds.includes(sectionId)
        ? state.collapsedSidebarSectionIds.filter((id) => id !== sectionId)
        : [...state.collapsedSidebarSectionIds, sectionId],
    }))
  },
  setDefaultViewMode: (defaultViewMode) => set({ defaultViewMode }),
  setNewWindowPathOption: (newWindowPathOption) => set({ newWindowPathOption }),
}))

export default useSeekerGlobalStore
