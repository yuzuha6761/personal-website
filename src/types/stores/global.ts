import { Application } from "~types";

export interface GlobalStore {
  applicationList: Application[]
  // applicationLaunchList: ApplicationLaunch[]
  activeApplicationId: string
  activeWindowId: string
  timestamp: number
  setTimestamp: (value: number) => void
}
