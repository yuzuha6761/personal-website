import { create } from 'zustand'
import { sidebarSections, tagItems } from './data'
import type { SeekerGlobalStore } from './types'

const useSeekerGlobalStore = create<SeekerGlobalStore>((set) => ({
  sidebarSections,
  tagItems,
  collapsedSidebarSectionIds: [],
  showHiddenFiles: false,
  defaultViewMode: 'list',

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
  setShowHiddenFiles: (showHiddenFiles) => set({ showHiddenFiles }),
  setDefaultViewMode: (defaultViewMode) => set({ defaultViewMode }),
}))

export default useSeekerGlobalStore
