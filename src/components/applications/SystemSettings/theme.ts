export function applySystemSettingsTheme(element: HTMLElement, isDarkMode: boolean) {
  element.dataset.systemSettingsAppearance = isDarkMode ? 'dark' : 'light'
}
