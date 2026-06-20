export function applySeekerTheme(element: HTMLElement, isDarkMode: boolean) {
  element.dataset.seekerAppearance = isDarkMode ? 'dark' : 'light'
}
