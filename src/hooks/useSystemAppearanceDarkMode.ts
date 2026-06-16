import { useEffect, useMemo } from 'react'
import { useDarkMode, useMediaQuery } from 'usehooks-ts'
import useSystemSettingsStore from '~/stores/settings/system-settings'

const DARK_MODE_STORAGE_KEY = 'personal-website-appearance-dark-mode'

export function useSystemAppearanceDarkMode() {
  const appearance = useSystemSettingsStore((state) => state.appearance)
  const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)', { initializeWithValue: true })
  const { set } = useDarkMode({
    localStorageKey: DARK_MODE_STORAGE_KEY,
    initializeWithValue: true,
  })

  const isDarkMode = useMemo(() => {
    if (appearance === 'dark') return true
    if (appearance === 'light') return false
    return isDarkOS
  }, [appearance, isDarkOS])

  useEffect(() => {
    set(isDarkMode)
  }, [appearance, isDarkMode, isDarkOS, set])

  return isDarkMode
}
