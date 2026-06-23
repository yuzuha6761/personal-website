import { create } from 'zustand'
import { BUILTIN_USERS, getBuiltinUserById } from './users'
import type { SessionStore } from './types'

const useSessionStore = create<SessionStore>((set, get) => ({
  currentUserId: null,
  runtimeUsers: [],
  isReady: false,

  login: (userId) => {
    const user = getBuiltinUserById(userId) ?? get().runtimeUsers.find((item) => item.id === userId)
    if (!user) {
      throw new Error(`Unknown user: ${userId}`)
    }
    set({ currentUserId: userId })
  },

  getCurrentUser: () => {
    const { currentUserId, runtimeUsers } = get()
    if (!currentUserId) {
      throw new Error('No user is logged in')
    }
    return getBuiltinUserById(currentUserId) ?? runtimeUsers.find((user) => user.id === currentUserId)!
  },

  getAllUsers: () => [...BUILTIN_USERS, ...get().runtimeUsers],

  setRuntimeUsers: (runtimeUsers) => set({ runtimeUsers }),

  setReady: (isReady) => set({ isReady }),
}))

export default useSessionStore
