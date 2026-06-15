import type { LucideIcon } from 'lucide-react'

export type SettingsCategoryId = 'appearance'

export interface SettingsCategory {
  id: SettingsCategoryId
  label: string
  icon: LucideIcon
}
