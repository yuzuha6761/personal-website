import { create } from 'zustand'
import type { ShellStore } from '~types'
import { wallpaper as defaultWallpaper } from '../constants/preloadAssets'

const useShellStore = create<ShellStore>((set) => ({
  wallpaper: defaultWallpaper,
  useStacks: false,
  sortBy: 'none',
  iconPositions: {},

  setWallpaper: (wallpaper) => set({ wallpaper }),
  setUseStacks: (useStacks) => set({ useStacks }),
  setSortBy: (sortBy) => set({ sortBy }),
  setIconPosition: (nodeId, position) => set((state) => ({
    iconPositions: {
      ...state.iconPositions,
      [nodeId]: position,
    },
  })),
  removeIconPosition: (nodeId) => set((state) => {
    const nextIconPositions = { ...state.iconPositions }
    delete nextIconPositions[nodeId]
    return { iconPositions: nextIconPositions }
  }),
}))

export default useShellStore
