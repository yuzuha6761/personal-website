import type { AppId } from '../app'

export interface AppStore {
  runningAppIds: AppId[]
  loadingAppIds: AppId[]
  activeAppId: AppId | null
  launchApp: (appId: AppId) => void
  quitApp: (appId: AppId) => void
  activateApp: (appId: AppId) => void
  startLoadingApp: (appId: AppId) => void
  finishLoadingApp: (appId: AppId) => void
  isAppRunning: (appId: AppId) => boolean
  isAppLoading: (appId: AppId) => boolean
}
