import useSessionStore from './store'

export function getHomePath(): string {
  return useSessionStore.getState().getCurrentUser().homePath
}

export function getUsersDirectoryPath(): string {
  const { homePath } = useSessionStore.getState().getCurrentUser()
  const usersIndex = homePath.lastIndexOf('/Users/')
  if (usersIndex === -1) return `${homePath.split('/').slice(0, -1).join('/')}/Users`
  return homePath.slice(0, usersIndex + '/Users'.length)
}
