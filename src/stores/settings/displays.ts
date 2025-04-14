import { create } from 'zustand'
import type {DisplaysSettingStore} from '~types'
import {TextSizeEnum} from "~enums";

const useDisplaysSettingStore = create<DisplaysSettingStore>((set) => ({
  textSize: TextSizeEnum.DEFAULT,
  setTextSize: (value) => set(() => ({ textSize: value }))
}))

export default useDisplaysSettingStore
