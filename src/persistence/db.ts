import localforage from 'localforage'

export const persistenceDb = localforage.createInstance({
  name: import.meta.env.DEV ? 'personal-website-dev' : 'personal-website',
})

export const PERSISTENCE_SCHEMA_VERSION = 1

export const persistenceKeys = {
  schemaVersion: 'meta:schemaVersion',
  runtimeUsers: 'session:runtimeUsers',
  userFs: (userId: string) => `users:${userId}:fs`,
  userPrefs: (userId: string) => `users:${userId}:prefs`,
  userSession: (userId: string) => `users:${userId}:session`,
} as const

export async function getPersistenceItem<T>(key: string): Promise<T | null> {
  return persistenceDb.getItem<T>(key)
}

export async function setPersistenceItem<T>(key: string, value: T): Promise<void> {
  await persistenceDb.setItem(key, value)
}

export async function removePersistenceItemsByPrefix(prefix: string): Promise<void> {
  const keys = await persistenceDb.keys()
  await Promise.all(
    keys
      .filter((key) => key.startsWith(prefix))
      .map((key) => persistenceDb.removeItem(key)),
  )
}
