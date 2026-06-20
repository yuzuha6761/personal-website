import { DockPositionEnum } from '~enums'
import {
  ACCENT_COLOR_OPTIONS,
  HIGHLIGHT_COLOR_OPTIONS,
} from '~/stores/settings/system-settings.constants'
import useDockSettingStore from '~/stores/settings/dock'
import { applySystemTheme } from './theme'
import type { DockPosition, SystemSettingsAppearanceState } from '~types'

const SIDEBAR_ICON_SIZE_REM = {
  small: '.78rem',
  medium: '.9rem',
  large: '1.02rem',
} as const

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function resolveColorValue(color: SystemSettingsAppearanceState['color']) {
  return ACCENT_COLOR_OPTIONS.find((option) => option.id === color)?.value ?? ACCENT_COLOR_OPTIONS[3].value
}

function resolveSolidColorHex(color: SystemSettingsAppearanceState['color']) {
  const option = ACCENT_COLOR_OPTIONS.find((item) => item.id === color) ?? ACCENT_COLOR_OPTIONS[3]

  if (option.id === 'multi' || !option.value.startsWith('#')) {
    return '#ef5ba1'
  }

  return option.value
}

function parseHexColor(hex: string) {
  const normalized = hex.replace('#', '')

  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function formatHexColor(red: number, green: number, blue: number) {
  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0')

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

function mixHexColors(baseHex: string, mixHex: string, mixWeight: number) {
  const base = parseHexColor(baseHex)
  const mix = parseHexColor(mixHex)
  const baseWeight = 1 - mixWeight

  return formatHexColor(
    base.red * baseWeight + mix.red * mixWeight,
    base.green * baseWeight + mix.green * mixWeight,
    base.blue * baseWeight + mix.blue * mixWeight,
  )
}

function resolveSidebarIconColorFocused(color: SystemSettingsAppearanceState['color']) {
  return mixHexColors(resolveSolidColorHex(color), '#000000', 0.22)
}

function resolveSidebarIconColorMuted(color: SystemSettingsAppearanceState['color']) {
  return mixHexColors(resolveSolidColorHex(color), '#ffffff', 0.45)
}

function resolveColorMenuHighlight(color: SystemSettingsAppearanceState['color'], alpha: number) {
  return hexToRgba(resolveSolidColorHex(color), alpha)
}

function resolveTextHighlightColorValue(textHighlightColor: SystemSettingsAppearanceState['textHighlightColor']) {
  const option = HIGHLIGHT_COLOR_OPTIONS.find((item) => item.id === textHighlightColor)
  if (!option) return '#ffc4df'

  if (option.id === 'pink') return '#ffc4df'
  return '#ffc4df'
}

function toDockPositionEnum(position: DockPosition) {
  switch (position) {
    case 'left':
      return DockPositionEnum.LEFT
    case 'right':
      return DockPositionEnum.RIGHT
    default:
      return DockPositionEnum.BOTTOM
  }
}

export function applySystemSettingsDock(position: DockPosition) {
  useDockSettingStore.getState().setPosition(toDockPositionEnum(position))
}

export function applySystemSettingsAppearance(
  state: SystemSettingsAppearanceState,
  options: { isDarkMode: boolean },
) {
  const root = document.documentElement
  const { isDarkMode } = options

  root.dataset.appearance = state.appearance
  root.dataset.scrollBars = state.scrollBars
  root.dataset.scrollbarClick = state.scrollbarClick
  root.dataset.wallpaperTint = state.wallpaperTint ? 'true' : 'false'
  applySystemTheme(root, isDarkMode)
  root.style.setProperty('--system-color', resolveColorValue(state.color))
  root.style.setProperty('--system-color-solid', resolveSolidColorHex(state.color))
  root.style.setProperty('--system-sidebar-icon-color', resolveSidebarIconColorFocused(state.color))
  root.style.setProperty('--system-sidebar-icon-color-muted', resolveSidebarIconColorMuted(state.color))
  root.style.setProperty('--system-color-menu-highlight', resolveColorMenuHighlight(state.color, 0.75))
  root.style.setProperty('--system-text-highlight-color', resolveTextHighlightColorValue(state.textHighlightColor))
  root.style.setProperty('--system-sidebar-icon-size', SIDEBAR_ICON_SIZE_REM[state.sidebarIconSize])
}
