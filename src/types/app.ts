export type AppId = string

export interface ApplicationWindowDisplayOptions {
  fullSizeContentView?: boolean
  trafficLightsPosition?: { top?: number; left?: number }
  zoomDisabled?: boolean
  minimizeDisabled?: boolean
  resizable?: boolean
}

export interface ApplicationManifest extends ApplicationWindowDisplayOptions {
  name: string
  defaultSizeX?: number
  defaultSizeY?: number
  singleInstance?: boolean
  addIconSafeArea?: boolean
}

export interface Application {
  id: AppId
  icon: string
  name: string
  defaultSizeX?: number
  defaultSizeY?: number
  singleInstance?: boolean
  addIconSafeArea: boolean
}
