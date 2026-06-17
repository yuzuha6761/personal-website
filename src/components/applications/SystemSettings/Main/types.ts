import type { LucideIcon } from 'lucide-react'

export type SettingsCategoryId = 'appearance' | 'desktop-and-dock'

export interface SettingsCategory {
  id: SettingsCategoryId
  label: string
  icon: LucideIcon
}
