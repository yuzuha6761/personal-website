import { TextSizeEnum } from "~enums";

export interface DisplaysSettingStore {
  textSize: TextSizeEnum
  setTextSize: (value: TextSizeEnum) => void
}
