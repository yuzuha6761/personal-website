import { create } from 'zustand'
import { sidebarSections, tagItems } from '../data'
import type { SeekerGlobalStore } from './types'

const useSeekerGlobalStore = create<SeekerGlobalStore>((set) => ({
  sidebarSections,
  tagItems,
  showHiddenFiles: false,
  defaultViewMode: 'list',

  setShowHiddenFiles: (showHiddenFiles) => set({ showHiddenFiles }),
  setDefaultViewMode: (defaultViewMode) => set({ defaultViewMode }),
}))

export default useSeekerGlobalStore
