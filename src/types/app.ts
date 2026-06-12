export type AppId = string

export interface WindowRemSize {
  width?: number
  height?: number
}

export interface WindowDisplayOptions {
  fullSizeContentView?: boolean
  trafficLightsPosition?: { top?: number; left?: number }
  zoomDisabled?: boolean
  minimizeDisabled?: boolean
  resizable?: boolean
  minSize?: WindowRemSize
  size?: WindowRemSize
}

export interface ApplicationManifest extends WindowDisplayOptions {
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
