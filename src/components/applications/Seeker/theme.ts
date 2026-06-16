const SEEKER_LIGHT_THEME = {
  '--seeker-header-focused': '#fdfdfd',
  '--seeker-header-unfocused': '#f2f2f2',
  '--seeker-tabbar-focused': '#f0f0f0',
  '--seeker-tabbar-unfocused': '#e3e3e3',
  '--seeker-tab-active-focused': '#fdfdfd',
  '--seeker-tab-active-unfocused': '#f2f2f2',
  '--seeker-tab-inactive-focused': '#f0f0f0',
  '--seeker-tab-inactive-focused-hover': '#e3e3e3',
  '--seeker-tab-inactive-unfocused': '#e3e3e3',
  '--seeker-tab-inactive-unfocused-hover': '#d6d6d6',
  '--seeker-tab-add-focused': '#f0f0f0',
  '--seeker-tab-add-focused-hover': '#e3e3e3',
  '--seeker-tab-add-focused-active': '#cac9c9',
  '--seeker-tab-add-unfocused': '#e3e3e3',
  '--seeker-tab-add-unfocused-hover': '#d6d6d6',
  '--seeker-tab-active-text-focused': '#2f2f2f',
  '--seeker-tab-active-text-unfocused': '#a0a0a0',
  '--seeker-tab-inactive-text-focused': '#2f2f2f',
  '--seeker-tab-inactive-text-unfocused': '#a0a0a0',
  '--seeker-tab-add-icon-focused': '#6b6b6b',
  '--seeker-tab-add-icon-unfocused': '#a8a8a8',
} as const

const SEEKER_DARK_THEME = {
  '--seeker-header-focused': '#363636',
  '--seeker-header-unfocused': '#282828',
  '--seeker-tabbar-focused': '#1e1e1e',
  '--seeker-tabbar-unfocused': '#2e2e2e',
  '--seeker-tab-active-focused': '#363636',
  '--seeker-tab-active-unfocused': '#282828',
  '--seeker-tab-inactive-focused': '#1e1e1e',
  '--seeker-tab-inactive-focused-hover': '#2e2e2e',
  '--seeker-tab-inactive-unfocused': '#161616',
  '--seeker-tab-inactive-unfocused-hover': '#222222',
  '--seeker-tab-add-focused': '#1e1e1e',
  '--seeker-tab-add-focused-hover': '#2e2e2e',
  '--seeker-tab-add-focused-active': '#343434',
  '--seeker-tab-add-unfocused': '#161616',
  '--seeker-tab-add-unfocused-hover': '#222222',
  '--seeker-tab-active-text-focused': '#ffffff',
  '--seeker-tab-active-text-unfocused': '#696969',
  '--seeker-tab-inactive-text-focused': '#9a9a9a',
  '--seeker-tab-inactive-text-unfocused': '#575757',
  '--seeker-tab-add-icon-focused': '#9a9a9a',
  '--seeker-tab-add-icon-unfocused': '#575757',
} as const

export function applySeekerTheme(element: HTMLElement, isDarkMode: boolean) {
  const theme = isDarkMode ? SEEKER_DARK_THEME : SEEKER_LIGHT_THEME

  for (const [name, value] of Object.entries(theme)) {
    element.style.setProperty(name, value)
  }
}
