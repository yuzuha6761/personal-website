import type { FsNode } from '~types'
import type { FsOverlay } from '~/fs/overlay'
import type { UserProfile } from '~/session/types'
import type { SeekerNewWindowPathOption } from '~/components/applications/Seeker/newWindowPath'
import type { SidebarSection, ViewMode } from '~/components/applications/Seeker/Main/types'
import type { SeekerDirectorySortByRecord } from '~/components/applications/Seeker/listContextMenu'
import type { SeekerListColumnId } from '~/components/applications/Seeker/listColumnLayout'
import type {
  SystemSettingsDesktopDockState,
  SystemSettingsAppearanceState,
} from '~types'
import type { ShellStore } from '~types'
import type { AppId } from '~/types/app'
import type { DockPositionEnum } from '~enums'

export interface UserFsRecord {
  version: 1
  baseRevision: string
  strategy: 'overlay' | 'homeSnapshot'
  overlay?: FsOverlay
  homeSnapshot?: Record<string, FsNode>
  compactedAt?: number
}

export interface UserDockPrefs {
  position: DockPositionEnum
  size: string
  pinnedApplicationIds: AppId[]
}

export type PersistedSystemSettings = SystemSettingsAppearanceState & SystemSettingsDesktopDockState

export interface UserPrefsRecord {
  version: 1
  showHiddenFiles?: boolean
  systemSettings?: PersistedSystemSettings
  shell?: Pick<ShellStore, 'wallpaper' | 'useStacks' | 'sortBy' | 'iconPositions'>
  seekerGlobal?: {
    sidebarSections?: SidebarSection[]
    collapsedSidebarSectionIds?: string[]
    defaultViewMode?: ViewMode
    newWindowPathOption?: SeekerNewWindowPathOption
    directorySortBy?: SeekerDirectorySortByRecord
    listColumnOrder?: SeekerListColumnId[]
  }
  dock?: UserDockPrefs
}

export type RuntimeUserProfile = UserProfile

export interface PersistedSeekerTab {
  path: string
  label?: string
  historyBack?: string[]
  historyForward?: string[]
}

export interface PersistedMainWindowState {
  tabs: PersistedSeekerTab[]
  activeTabIndex: number
  viewMode: ViewMode
  /** @deprecated Migrated to per-tab history on restore */
  historyBack?: string[]
  /** @deprecated Migrated to per-tab history on restore */
  historyForward?: string[]
}

export interface PersistedWindowEntry {
  appId: AppId
  title?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  minimized?: boolean
  payload?: Record<string, unknown>
  zIndex: number
  seeker?: PersistedMainWindowState
}

export type PersistedFocusTarget =
  | { type: 'desktop' }
  | { type: 'window'; index: number }

export interface UserSessionRecord {
  version: 1
  activeAppId: AppId | null
  focusedTarget: PersistedFocusTarget
  windows: PersistedWindowEntry[]
}
