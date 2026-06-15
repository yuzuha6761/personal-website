import { create } from 'zustand'
import type { SystemSettingsStore } from '~types'
import { DEFAULT_SYSTEM_SETTINGS_APPEARANCE } from './system-settings.constants'

const useSystemSettingsStore = create<SystemSettingsStore>((set) => ({
  ...DEFAULT_SYSTEM_SETTINGS_APPEARANCE,
  setAppearance: (appearance) => set({ appearance }),
  setColor: (color) => set({ color }),
  setTextHighlightColor: (textHighlightColor) => set({ textHighlightColor }),
  setSidebarIconSize: (sidebarIconSize) => set({ sidebarIconSize }),
  setWallpaperTint: (wallpaperTint) => set({ wallpaperTint }),
  setScrollBars: (scrollBars) => set({ scrollBars }),
  setScrollbarClick: (scrollbarClick) => set({ scrollbarClick }),
}))

export default useSystemSettingsStore
