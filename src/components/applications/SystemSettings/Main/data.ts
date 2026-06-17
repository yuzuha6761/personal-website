import { Monitor, Palette } from 'lucide-react'
import type { SettingsCategory } from './types'

export const settingsCategories: SettingsCategory[] = [
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'desktop-and-dock', label: '桌面与程序坞', icon: Monitor },
]
