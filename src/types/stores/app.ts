import type { AppId } from '../app'

export interface AppStore {
  runningAppIds: AppId[]
  activeAppId: AppId | null
  launchApp: (appId: AppId) => void
  quitApp: (appId: AppId) => void
  activateApp: (appId: AppId) => void
  isAppRunning: (appId: AppId) => boolean
}
