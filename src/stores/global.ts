import { create } from 'zustand'
import type {GlobalStore} from '~types'

const useGlobalStore = create<GlobalStore>((set) => ({
  timestamp: 0,
  showHiddenFiles: false,
  setTimestamp: (value: number) => set(() => ({ timestamp: value })),
  setShowHiddenFiles: (showHiddenFiles) => set({ showHiddenFiles }),
  toggleShowHiddenFiles: () => set((state) => ({ showHiddenFiles: !state.showHiddenFiles })),
}))

export default useGlobalStore
