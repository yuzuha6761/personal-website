import { useState } from 'react'
import MainContent from './MainContent'
import Sidebar from './Sidebar'
import { settingsCategories } from './data'
import type { SettingsCategoryId } from './types'

function SystemSettingsMain() {
  const [activeCategoryId, setActiveCategoryId] = useState<SettingsCategoryId>(
    settingsCategories[0]?.id ?? 'appearance',
  )

  return (
    <div className="h-full w-full bg-#f4f4f4 flex overflow-hidden">
      <Sidebar
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />
      <MainContent activeCategoryId={activeCategoryId} />
    </div>
  )
}

export default SystemSettingsMain
