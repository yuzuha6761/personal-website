import type { ApplicationManifest } from '~types'

export default {
  name: 'System Settings',
  defaultSizeX: 716,
  defaultSizeY: 654,
  singleInstance: true,
  addIconSafeArea: false,
  fullSizeContentView: true,
  trafficLightsPosition: { top: 1.16, left: 1.16 },
  zoomDisabled: true,
  resizable: false,
} satisfies ApplicationManifest
