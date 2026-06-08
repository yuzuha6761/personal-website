export type AppId = 'finder' | 'launchpad' | 'system-settings'

export interface Application {
  id: AppId
  name: string
  icon: string
  defaultSizeX?: number
  defaultSizeY?: number
  singleInstance?: boolean
}
