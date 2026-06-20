export function applySystemTheme(element: HTMLElement, isDarkMode: boolean) {
  element.dataset.resolvedAppearance = isDarkMode ? 'dark' : 'light'
  element.classList.toggle('dark', isDarkMode)
  element.style.colorScheme = isDarkMode ? 'dark' : 'light'
}
