import type { AccentColorId, HighlightColorId } from '~types'

export interface AccentColorOption {
  id: AccentColorId
  label: string
  value: string
}

export interface HighlightColorOption {
  id: HighlightColorId
  label: string
  swatchClassName: string
}

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  { id: 'multi', label: '多色', value: 'conic-gradient(#ff4d72, #ffb52f, #37b56b, #1687f6, #9b51cf, #ff4d72)' },
  { id: 'blue', label: '蓝色', value: '#0a84ff' },
  { id: 'purple', label: '紫色', value: '#9b4fba' },
  { id: 'pink', label: '粉色', value: '#ef5ba1' },
  { id: 'red', label: '红色', value: '#ff453a' },
  { id: 'orange', label: '橙色', value: '#ff9f0a' },
  { id: 'yellow', label: '黄色', value: '#ffc726' },
  { id: 'green', label: '绿色', value: '#4fb34f' },
  { id: 'gray', label: '灰色', value: '#9a9a9a' },
]

export const HIGHLIGHT_COLOR_OPTIONS: HighlightColorOption[] = [
  {
    id: 'pink',
    label: '粉色',
    swatchClassName: 'h-[.82rem] w-[1.42rem] border border-#dfa1c2 bg-#ffc4df',
  },
]

export const SIDEBAR_ICON_SIZE_OPTIONS = [
  { value: 'small' as const, label: '小' },
  { value: 'medium' as const, label: '中' },
  { value: 'large' as const, label: '大' },
]

export const DEFAULT_SYSTEM_SETTINGS_APPEARANCE = {
  appearance: 'auto',
  color: 'pink',
  textHighlightColor: 'pink',
  sidebarIconSize: 'medium',
  wallpaperTint: true,
  scrollBars: 'scrolling',
  scrollbarClick: 'next-page',
} as const
