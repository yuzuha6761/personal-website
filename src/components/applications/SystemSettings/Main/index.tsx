import { useLayoutEffect, useRef, useState } from 'react'
import MainContent from './MainContent'
import Sidebar from './Sidebar'
import { settingsCategories } from './data'
import type { SettingsCategoryId } from './types'
import { useSystemAppearanceDarkMode } from '~/hooks/useSystemAppearanceDarkMode'
import { applySystemSettingsTheme } from '../theme'

function SystemSettingsMain() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDarkMode = useSystemAppearanceDarkMode()
  const [activeCategoryId, setActiveCategoryId] = useState<SettingsCategoryId>(
    settingsCategories[0]?.id ?? 'appearance',
  )

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    applySystemSettingsTheme(container, isDarkMode)
  }, [isDarkMode])

  return (
    <div ref={containerRef} className="h-full w-full bg-[var(--system-surface-base)] flex overflow-hidden">
      <Sidebar
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />
      <MainContent activeCategoryId={activeCategoryId} />
    </div>
  )
}

export default SystemSettingsMain
