import { create } from 'zustand'
import type {DockSettingStore} from '~types'
import {DockPositionEnum} from "~enums";

const useDockSettingStore = create<DockSettingStore>((set) => ({
  position: DockPositionEnum.BOTTOM,
  size: '5rem',
  setPosition: (value) => set(() => ({ position: value })),
  pinnedApplicationIds: ['finder', 'launchpad']
}))

export default useDockSettingStore
