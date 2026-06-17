import type { AccentColorId, HighlightColorId } from '~types'
import type {
  DockPosition,
  DocumentTabsPreference,
  DoubleClickTitleBarAction,
  StageManagerWindowDisplay,
  WallpaperClickAction,
  WidgetStyle,
  WindowMinimizeEffect,
} from '~types'

export interface AccentColorOption {
  id: AccentColorId
  label: string
  value: string
}

export interface HighlightColorOption {
  id: HighlightColorId
  label: string
  swatchClassName: string
}

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  { id: 'multi', label: '多色', value: 'conic-gradient(#ff4d72, #ffb52f, #37b56b, #1687f6, #9b51cf, #ff4d72)' },
  { id: 'blue', label: '蓝色', value: '#0a84ff' },
  { id: 'purple', label: '紫色', value: '#9b4fba' },
  { id: 'pink', label: '粉色', value: '#ef5ba1' },
  { id: 'red', label: '红色', value: '#ff453a' },
  { id: 'orange', label: '橙色', value: '#ff9f0a' },
  { id: 'yellow', label: '黄色', value: '#ffc726' },
  { id: 'green', label: '绿色', value: '#4fb34f' },
  { id: 'gray', label: '灰色', value: '#9a9a9a' },
]

export const HIGHLIGHT_COLOR_OPTIONS: HighlightColorOption[] = [
  {
    id: 'pink',
    label: '粉色',
    swatchClassName: 'h-[.82rem] w-[1.42rem] border border-#dfa1c2 bg-#ffc4df',
  },
]

export const SIDEBAR_ICON_SIZE_OPTIONS = [
  { value: 'small' as const, label: '小' },
  { value: 'medium' as const, label: '中' },
  { value: 'large' as const, label: '大' },
]

export const DOCK_POSITION_OPTIONS = [
  { value: 'bottom' as DockPosition, label: '底部' },
  { value: 'left' as DockPosition, label: '左边' },
  { value: 'right' as DockPosition, label: '右边' },
]

export const WINDOW_MINIMIZE_EFFECT_OPTIONS = [
  { value: 'genie' as WindowMinimizeEffect, label: '神奇效果' },
  { value: 'scale' as WindowMinimizeEffect, label: '缩放效果' },
]

export const DOUBLE_CLICK_TITLE_BAR_ACTION_OPTIONS = [
  { value: 'zoom' as DoubleClickTitleBarAction, label: '缩放' },
  { value: 'minimize' as DoubleClickTitleBarAction, label: '最小化' },
  { value: 'none' as DoubleClickTitleBarAction, label: '不执行任何操作' },
]

export const WALLPAPER_CLICK_ACTION_OPTIONS = [
  { value: 'always' as WallpaperClickAction, label: '始终' },
  { value: 'only-stage-manager' as WallpaperClickAction, label: '仅在前台调度中' },
]

export const STAGE_MANAGER_WINDOW_DISPLAY_OPTIONS = [
  { value: 'all-at-once' as StageManagerWindowDisplay, label: '一次全部' },
  { value: 'one-at-a-time' as StageManagerWindowDisplay, label: '一次一个' },
]

export const WIDGET_STYLE_OPTIONS = [
  { value: 'automatic' as WidgetStyle, label: '自动' },
  { value: 'monochrome' as WidgetStyle, label: '单色' },
  { value: 'full-color' as WidgetStyle, label: '全彩色' },
]

export const DEFAULT_WEB_BROWSER_OPTIONS = [
  { value: 'google-chrome', label: 'Google Chrome.app' },
  { value: 'safari', label: 'Safari.app' },
]

export const DOCUMENT_TABS_PREFERENCE_OPTIONS = [
  { value: 'fullscreen' as DocumentTabsPreference, label: '在全屏幕视图下' },
  { value: 'always' as DocumentTabsPreference, label: '始终' },
  { value: 'never' as DocumentTabsPreference, label: '永不' },
]

export const DEFAULT_SYSTEM_SETTINGS = {
  appearance: 'auto',
  color: 'pink',
  textHighlightColor: 'pink',
  sidebarIconSize: 'medium',
  wallpaperTint: true,
  scrollBars: 'scrolling',
  scrollbarClick: 'next-page',
  dockSize: 20,
  dockMagnification: 30,
  dockPosition: 'bottom',
  minimizeEffect: 'genie',
  doubleClickTitleBarAction: 'zoom',
  minimizeWindowsIntoApplicationIcon: false,
  autoHideDock: false,
  animateOpeningApplications: true,
  showIndicatorsForOpenApplications: true,
  showSuggestedAndRecentApplicationsInDock: true,
  showDesktopItemsOnDesktop: true,
  showDesktopItemsInStageManager: false,
  wallpaperClickAction: 'always',
  stageManager: false,
  showRecentAppsInStageManager: true,
  stageManagerWindowDisplay: 'all-at-once',
  showWidgetsOnDesktop: true,
  showWidgetsInStageManager: true,
  widgetStyle: 'automatic',
  useIphoneWidgets: true,
  defaultWebBrowser: 'google-chrome',
  documentTabsPreference: 'fullscreen',
  askToKeepChangesWhenClosingDocuments: false,
  closeWindowsWhenQuittingApplication: false,
  tileWindowsByDraggingToScreenEdges: true,
  tileWindowsByDraggingToMenuBar: true,
  tileWindowsByHoldingOption: true,
  tiledWindowsHaveMargins: false,
  automaticallyRearrangeSpaces: true,
  switchToSpaceWithOpenWindows: true,
  groupWindowsByApplication: false,
  displaysHaveSeparateSpaces: true,
  dragWindowsToTopForMissionControl: true,
} as const

export const DEFAULT_SYSTEM_SETTINGS_APPEARANCE = DEFAULT_SYSTEM_SETTINGS
