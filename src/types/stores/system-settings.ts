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

export type ScrollBarsVisibility = 'scrolling' | 'always'

export type ScrollbarClickAction = 'next-page' | 'clicked-spot'

export type DockPosition = 'bottom' | 'left' | 'right'

export type WindowMinimizeEffect = 'genie' | 'scale'

export type DoubleClickTitleBarAction = 'zoom' | 'minimize' | 'none'

export type WallpaperClickAction = 'always' | 'only-stage-manager'

export type StageManagerWindowDisplay = 'all-at-once' | 'one-at-a-time'

export type WidgetStyle = 'automatic' | 'monochrome' | 'full-color'

export type DocumentTabsPreference = 'fullscreen' | 'always' | 'never'

export interface SystemSettingsAppearanceState {
  appearance: AppearanceMode
  color: AccentColorId
  textHighlightColor: HighlightColorId
  sidebarIconSize: SidebarIconSize
  wallpaperTint: boolean
  scrollBars: ScrollBarsVisibility
  scrollbarClick: ScrollbarClickAction
}

export interface SystemSettingsDesktopDockState {
  dockSize: number
  dockMagnification: number
  dockPosition: DockPosition
  minimizeEffect: WindowMinimizeEffect
  doubleClickTitleBarAction: DoubleClickTitleBarAction
  minimizeWindowsIntoApplicationIcon: boolean
  autoHideDock: boolean
  animateOpeningApplications: boolean
  showIndicatorsForOpenApplications: boolean
  showSuggestedAndRecentApplicationsInDock: boolean
  showDesktopItemsOnDesktop: boolean
  showDesktopItemsInStageManager: boolean
  wallpaperClickAction: WallpaperClickAction
  stageManager: boolean
  showRecentAppsInStageManager: boolean
  stageManagerWindowDisplay: StageManagerWindowDisplay
  showWidgetsOnDesktop: boolean
  showWidgetsInStageManager: boolean
  widgetStyle: WidgetStyle
  useIphoneWidgets: boolean
  defaultWebBrowser: string
  documentTabsPreference: DocumentTabsPreference
  askToKeepChangesWhenClosingDocuments: boolean
  closeWindowsWhenQuittingApplication: boolean
  tileWindowsByDraggingToScreenEdges: boolean
  tileWindowsByDraggingToMenuBar: boolean
  tileWindowsByHoldingOption: boolean
  tiledWindowsHaveMargins: boolean
  automaticallyRearrangeSpaces: boolean
  switchToSpaceWithOpenWindows: boolean
  groupWindowsByApplication: boolean
  displaysHaveSeparateSpaces: boolean
  dragWindowsToTopForMissionControl: boolean
}

export interface SystemSettingsStore extends SystemSettingsAppearanceState, SystemSettingsDesktopDockState {
  setAppearance: (value: AppearanceMode) => void
  setColor: (value: AccentColorId) => void
  setTextHighlightColor: (value: HighlightColorId) => void
  setSidebarIconSize: (value: SidebarIconSize) => void
  setWallpaperTint: (value: boolean) => void
  setScrollBars: (value: ScrollBarsVisibility) => void
  setScrollbarClick: (value: ScrollbarClickAction) => void
  setDockSize: (value: number) => void
  setDockMagnification: (value: number) => void
  setDockPosition: (value: DockPosition) => void
  setMinimizeEffect: (value: WindowMinimizeEffect) => void
  setDoubleClickTitleBarAction: (value: DoubleClickTitleBarAction) => void
  setMinimizeWindowsIntoApplicationIcon: (value: boolean) => void
  setAutoHideDock: (value: boolean) => void
  setAnimateOpeningApplications: (value: boolean) => void
  setShowIndicatorsForOpenApplications: (value: boolean) => void
  setShowSuggestedAndRecentApplicationsInDock: (value: boolean) => void
  setShowDesktopItemsOnDesktop: (value: boolean) => void
  setShowDesktopItemsInStageManager: (value: boolean) => void
  setWallpaperClickAction: (value: WallpaperClickAction) => void
  setStageManager: (value: boolean) => void
  setShowRecentAppsInStageManager: (value: boolean) => void
  setStageManagerWindowDisplay: (value: StageManagerWindowDisplay) => void
  setShowWidgetsOnDesktop: (value: boolean) => void
  setShowWidgetsInStageManager: (value: boolean) => void
  setWidgetStyle: (value: WidgetStyle) => void
  setUseIphoneWidgets: (value: boolean) => void
  setDefaultWebBrowser: (value: string) => void
  setDocumentTabsPreference: (value: DocumentTabsPreference) => void
  setAskToKeepChangesWhenClosingDocuments: (value: boolean) => void
  setCloseWindowsWhenQuittingApplication: (value: boolean) => void
  setTileWindowsByDraggingToScreenEdges: (value: boolean) => void
  setTileWindowsByDraggingToMenuBar: (value: boolean) => void
  setTileWindowsByHoldingOption: (value: boolean) => void
  setTiledWindowsHaveMargins: (value: boolean) => void
  setAutomaticallyRearrangeSpaces: (value: boolean) => void
  setSwitchToSpaceWithOpenWindows: (value: boolean) => void
  setGroupWindowsByApplication: (value: boolean) => void
  setDisplaysHaveSeparateSpaces: (value: boolean) => void
  setDragWindowsToTopForMissionControl: (value: boolean) => void
}
