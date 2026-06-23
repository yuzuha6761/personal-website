import type { FsNode } from '~types'
import type { FsOverlay } from '~/fs/overlay'
import type { UserProfile } from '~/session/types'
import type { SeekerNewWindowPathOption } from '~/components/applications/Seeker/newWindowPath'
import type { SeekerSidebarSection, SeekerViewMode } from '~/components/applications/Seeker/Main/types'
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
    sidebarSections?: SeekerSidebarSection[]
    collapsedSidebarSectionIds?: string[]
    defaultViewMode?: SeekerViewMode
    newWindowPathOption?: SeekerNewWindowPathOption
  }
  dock?: UserDockPrefs
}

export type RuntimeUserProfile = UserProfile
