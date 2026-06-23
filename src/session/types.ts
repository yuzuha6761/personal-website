export interface UserProfile {
  id: string
  displayName: string
  homePath: string
  builtin: boolean
  createdAt?: number
}

export interface SessionStore {
  currentUserId: string | null
  runtimeUsers: UserProfile[]
  isReady: boolean

  login: (userId: string) => void
  getCurrentUser: () => UserProfile
  getAllUsers: () => UserProfile[]
  setRuntimeUsers: (users: UserProfile[]) => void
  setReady: (ready: boolean) => void
}
