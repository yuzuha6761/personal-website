import { create } from 'zustand'
import type { AppStore } from '~types'

const useAppStore = create<AppStore>((set, get) => ({
  runningAppIds: ['seeker'],
  activeAppId: 'seeker',

  launchApp: (appId) => {
    set((state) => ({
      runningAppIds: state.runningAppIds.includes(appId)
        ? state.runningAppIds
        : [...state.runningAppIds, appId],
      activeAppId: appId,
    }))
  },

  quitApp: (appId) => {
    set((state) => {
      const runningAppIds = state.runningAppIds.filter((id) => id !== appId)
      const activeAppId = state.activeAppId === appId
        ? runningAppIds.at(-1) ?? null
        : state.activeAppId

      return { runningAppIds, activeAppId }
    })
  },

  activateApp: (appId) => {
    if (!get().runningAppIds.includes(appId)) return
    set({ activeAppId: appId })
  },

  isAppRunning: (appId) => get().runningAppIds.includes(appId),
}))

export default useAppStore
