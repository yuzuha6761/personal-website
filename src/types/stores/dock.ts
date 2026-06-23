import type { AppId } from '~/types/app'
import { DockPositionEnum } from "~enums";

export interface DockSettingStore {
  position: DockPositionEnum
  size: string
  setPosition: (value: DockPositionEnum) => void
  pinnedApplicationIds: AppId[]
}
