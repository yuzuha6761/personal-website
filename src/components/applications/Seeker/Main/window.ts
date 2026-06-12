import type { WindowDisplayOptions } from '~types'

export const mainWindowOptions = {
  fullSizeContentView: true,
  trafficLightsPosition: {
    top: 1.4,
    left: 1.4,
  },
  minSize: {
    width: 22.5,
    height: 18,
  },
} satisfies WindowDisplayOptions
