const SYSTEM_LIGHT_THEME = {
  '--system-surface-base': '#f4f4f4',
  '--system-surface-elevated': '#f7f7f7',
  '--system-surface-window': '#ffffff',
  '--system-surface-window-inactive': '#f0f0f0',
  '--system-surface-window-title': '#fcfcfc',
  '--system-surface-menu': 'rgba(241, 229, 226, 0.68)',
  '--system-surface-menu-border': '#cacaca',
  '--system-surface-border': '#dddddd',
  '--system-surface-divider': 'rgba(0, 0, 0, 0.09)',
  '--system-text-primary': '#1f2933',
  '--system-text-secondary': '#373737',
  '--system-text-muted': '#777777',
  '--system-menu-icon-color': '#171717',
  '--system-color-menu-parent-highlight': 'rgba(255, 255, 255, 0.58)',
} as const

const SYSTEM_DARK_THEME = {
  '--system-surface-base': '#1e1e1e',
  '--system-surface-elevated': '#2c2c2e',
  '--system-surface-window': '#323234',
  '--system-surface-window-inactive': '#2a2a2c',
  '--system-surface-window-title': '#3a3a3c',
  '--system-surface-menu': 'rgba(44, 44, 46, 0.85)',
  '--system-surface-menu-border': '#5c5c5e',
  '--system-surface-border': '#48484a',
  '--system-surface-divider': 'rgba(255, 255, 255, 0.12)',
  '--system-text-primary': '#f5f5f7',
  '--system-text-secondary': '#d1d1d6',
  '--system-text-muted': '#8e8e93',
  '--system-menu-icon-color': '#ffffff',
  '--system-color-menu-parent-highlight': 'rgba(255, 255, 255, 0.12)',
} as const

export function applySystemTheme(element: HTMLElement, isDarkMode: boolean) {
  const theme = isDarkMode ? SYSTEM_DARK_THEME : SYSTEM_LIGHT_THEME

  for (const [name, value] of Object.entries(theme)) {
    element.style.setProperty(name, value)
  }
}
