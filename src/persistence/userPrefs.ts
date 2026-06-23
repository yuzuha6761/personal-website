import useGlobalStore from '~/stores/global'
import useShellStore from '~/stores/shell'
import useSystemSettingsStore from '~/stores/settings/system-settings'
import useDockSettingStore from '~/stores/settings/dock'
import useSeekerGlobalStore from '~/components/applications/Seeker/store'
import { DEFAULT_SYSTEM_SETTINGS_APPEARANCE } from '~/stores/settings/system-settings.constants'
import { wallpaper as defaultWallpaper } from '~/constants/preloadAssets'
import { DockPositionEnum } from '~enums'
import { applySystemSettingsAppearance, applySystemSettingsDock } from '~/services/system-settings'
import { getPersistenceItem, persistenceKeys, setPersistenceItem } from './db'
import type { PersistedSystemSettings, UserDockPrefs, UserPrefsRecord } from './types'

function pickSystemSettings(): PersistedSystemSettings {
  const state = useSystemSettingsStore.getState()
  const {
    appearance,
    color,
    textHighlightColor,
    sidebarIconSize,
    wallpaperTint,
    scrollBars,
    scrollbarClick,
    dockSize,
    dockMagnification,
    dockPosition,
    minimizeEffect,
    doubleClickTitleBarAction,
    minimizeWindowsIntoApplicationIcon,
    autoHideDock,
    animateOpeningApplications,
    showIndicatorsForOpenApplications,
    showSuggestedAndRecentApplicationsInDock,
    showDesktopItemsOnDesktop,
    showDesktopItemsInStageManager,
    wallpaperClickAction,
    stageManager,
    showRecentAppsInStageManager,
    stageManagerWindowDisplay,
    showWidgetsOnDesktop,
    showWidgetsInStageManager,
    widgetStyle,
    useIphoneWidgets,
    defaultWebBrowser,
    documentTabsPreference,
    askToKeepChangesWhenClosingDocuments,
    closeWindowsWhenQuittingApplication,
    tileWindowsByDraggingToScreenEdges,
    tileWindowsByDraggingToMenuBar,
    tileWindowsByHoldingOption,
    tiledWindowsHaveMargins,
    automaticallyRearrangeSpaces,
    switchToSpaceWithOpenWindows,
    groupWindowsByApplication,
    displaysHaveSeparateSpaces,
    dragWindowsToTopForMissionControl,
  } = state

  return {
    appearance,
    color,
    textHighlightColor,
    sidebarIconSize,
    wallpaperTint,
    scrollBars,
    scrollbarClick,
    dockSize,
    dockMagnification,
    dockPosition,
    minimizeEffect,
    doubleClickTitleBarAction,
    minimizeWindowsIntoApplicationIcon,
    autoHideDock,
    animateOpeningApplications,
    showIndicatorsForOpenApplications,
    showSuggestedAndRecentApplicationsInDock,
    showDesktopItemsOnDesktop,
    showDesktopItemsInStageManager,
    wallpaperClickAction,
    stageManager,
    showRecentAppsInStageManager,
    stageManagerWindowDisplay,
    showWidgetsOnDesktop,
    showWidgetsInStageManager,
    widgetStyle,
    useIphoneWidgets,
    defaultWebBrowser,
    documentTabsPreference,
    askToKeepChangesWhenClosingDocuments,
    closeWindowsWhenQuittingApplication,
    tileWindowsByDraggingToScreenEdges,
    tileWindowsByDraggingToMenuBar,
    tileWindowsByHoldingOption,
    tiledWindowsHaveMargins,
    automaticallyRearrangeSpaces,
    switchToSpaceWithOpenWindows,
    groupWindowsByApplication,
    displaysHaveSeparateSpaces,
    dragWindowsToTopForMissionControl,
  }
}

function pickDockPrefs(): UserDockPrefs {
  const { position, size, pinnedApplicationIds } = useDockSettingStore.getState()
  return { position, size, pinnedApplicationIds }
}

export function captureUserPrefsRecord(): UserPrefsRecord {
  const {
    wallpaper,
    useStacks,
    sortBy,
    iconPositions,
  } = useShellStore.getState()

  const {
    sidebarSections,
    collapsedSidebarSectionIds,
    defaultViewMode,
    newWindowPathOption,
  } = useSeekerGlobalStore.getState()

  return {
    version: 1,
    showHiddenFiles: useGlobalStore.getState().showHiddenFiles,
    systemSettings: pickSystemSettings(),
    shell: { wallpaper, useStacks, sortBy, iconPositions },
    seekerGlobal: {
      sidebarSections,
      collapsedSidebarSectionIds,
      defaultViewMode,
      newWindowPathOption,
    },
    dock: pickDockPrefs(),
  }
}

export async function loadUserPrefsRecord(userId: string): Promise<UserPrefsRecord | null> {
  return getPersistenceItem<UserPrefsRecord>(persistenceKeys.userPrefs(userId))
}

export async function saveUserPrefsRecord(userId: string, record: UserPrefsRecord): Promise<void> {
  await setPersistenceItem(persistenceKeys.userPrefs(userId), record)
}

export function applyUserPrefsRecord(record: UserPrefsRecord | null, isDarkMode: boolean): void {
  const systemSettings = {
    ...DEFAULT_SYSTEM_SETTINGS_APPEARANCE,
    ...record?.systemSettings,
  }

  useSystemSettingsStore.setState(systemSettings)

  useShellStore.setState({
    wallpaper: record?.shell?.wallpaper ?? defaultWallpaper,
    useStacks: record?.shell?.useStacks ?? false,
    sortBy: record?.shell?.sortBy ?? 'none',
    iconPositions: record?.shell?.iconPositions ?? {},
  })

  if (record?.seekerGlobal) {
    const legacyOption = record.seekerGlobal.newWindowPathOption as string | undefined
    const newWindowPathOption = legacyOption === 'yuzuha' ? 'home' : record.seekerGlobal.newWindowPathOption

    useSeekerGlobalStore.setState((state) => ({
      ...state,
      ...record.seekerGlobal,
      sidebarSections: record.seekerGlobal?.sidebarSections ?? state.sidebarSections,
      newWindowPathOption: newWindowPathOption ?? state.newWindowPathOption,
    }))
  }

  useGlobalStore.setState({
    showHiddenFiles: record?.showHiddenFiles ?? false,
  })

  useDockSettingStore.setState({
    position: record?.dock?.position ?? DockPositionEnum.BOTTOM,
    size: record?.dock?.size ?? '5rem',
    pinnedApplicationIds: record?.dock?.pinnedApplicationIds ?? ['seeker', 'launchpad', 'system-settings'],
  })

  applySystemSettingsAppearance(systemSettings, { isDarkMode })
  applySystemSettingsDock(systemSettings.dockPosition)
}

const prefsPersistTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function schedulePersistUserPrefs(userId: string): void {
  const existingTimer = prefsPersistTimers.get(userId)
  if (existingTimer) clearTimeout(existingTimer)

  prefsPersistTimers.set(userId, setTimeout(() => {
    prefsPersistTimers.delete(userId)
    void saveUserPrefsRecord(userId, captureUserPrefsRecord())
  }, 800))
}

export async function flushUserPrefs(userId: string): Promise<void> {
  const timer = prefsPersistTimers.get(userId)
  if (timer) {
    clearTimeout(timer)
    prefsPersistTimers.delete(userId)
  }

  await saveUserPrefsRecord(userId, captureUserPrefsRecord())
}

export function startUserPrefsPersistence(userId: string): () => void {
  const unsubscribers = [
    useSystemSettingsStore.subscribe(() => schedulePersistUserPrefs(userId)),
    useShellStore.subscribe(() => schedulePersistUserPrefs(userId)),
    useSeekerGlobalStore.subscribe(() => schedulePersistUserPrefs(userId)),
    useGlobalStore.subscribe(() => schedulePersistUserPrefs(userId)),
    useDockSettingStore.subscribe(() => schedulePersistUserPrefs(userId)),
  ]

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe())
  }
}
