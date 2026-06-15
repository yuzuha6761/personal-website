export type AppearanceMode = 'light' | 'dark' | 'auto'

export type AccentColorId =
  | 'multi'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'gray'

export type HighlightColorId = 'pink'

export type SidebarIconSize = 'small' | 'medium' | 'large'

export type ScrollBarsVisibility = 'automatic' | 'scrolling' | 'always'

export type ScrollbarClickAction = 'next-page' | 'clicked-spot'

export interface SystemSettingsAppearanceState {
  appearance: AppearanceMode
  color: AccentColorId
  textHighlightColor: HighlightColorId
  sidebarIconSize: SidebarIconSize
  wallpaperTint: boolean
  scrollBars: ScrollBarsVisibility
  scrollbarClick: ScrollbarClickAction
}

export interface SystemSettingsStore extends SystemSettingsAppearanceState {
  setAppearance: (value: AppearanceMode) => void
  setColor: (value: AccentColorId) => void
  setTextHighlightColor: (value: HighlightColorId) => void
  setSidebarIconSize: (value: SidebarIconSize) => void
  setWallpaperTint: (value: boolean) => void
  setScrollBars: (value: ScrollBarsVisibility) => void
  setScrollbarClick: (value: ScrollbarClickAction) => void
}
