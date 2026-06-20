import { useState } from 'react'
import { Checkbox, Select } from '../../../ui-kit'

function AdvancedTab() {
  const [showAllExtensions, setShowAllExtensions] = useState(true)
  const [warnBeforeExtensionChange, setWarnBeforeExtensionChange] = useState(true)
  const [warnBeforeIcloudRemove, setWarnBeforeIcloudRemove] = useState(false)
  const [warnBeforeTrashEmpty, setWarnBeforeTrashEmpty] = useState(true)
  const [removeTrashAfter30Days, setRemoveTrashAfter30Days] = useState(true)
  const [keepFoldersOnTopInWindows, setKeepFoldersOnTopInWindows] = useState(false)
  const [keepFoldersOnTopOnDesktop, setKeepFoldersOnTopOnDesktop] = useState(false)
  const [searchScope, setSearchScope] = useState('this-mac')

  return (
    <div className="px-[1.35rem] py-[1rem] text-[.84rem] text-[var(--settings-scene-text,#2f2f2f)]">
      <div className="flex flex-col gap-[.42rem]">
        <Checkbox checked={showAllExtensions} label="显示所有文件扩展名" onChange={setShowAllExtensions} />
        <Checkbox checked={warnBeforeExtensionChange} label="更改扩展名之前显示警告" onChange={setWarnBeforeExtensionChange} />
        <Checkbox checked={warnBeforeIcloudRemove} label="从 iCloud 云盘中移除前显示警告" onChange={setWarnBeforeIcloudRemove} />
        <Checkbox checked={warnBeforeTrashEmpty} label="清倒废纸篓之前显示警告" onChange={setWarnBeforeTrashEmpty} />
        <Checkbox checked={removeTrashAfter30Days} label="30 天后移除废纸篓中的项目" onChange={setRemoveTrashAfter30Days} />
      </div>

      <div className="mt-[.82rem] mb-[.42rem] font-600">将以下位置的文件夹保持在顶部：</div>
      <div className="pl-[1.1rem] flex flex-col gap-[.42rem]">
        <Checkbox
          checked={keepFoldersOnTopInWindows}
          label="按名称排序的窗口中"
          onChange={setKeepFoldersOnTopInWindows}
        />
        <Checkbox
          checked={keepFoldersOnTopOnDesktop}
          label="桌面上"
          onChange={setKeepFoldersOnTopOnDesktop}
        />
      </div>

      <div className="mt-[.82rem] mb-[.45rem] font-600">执行搜索时：</div>
      <Select
        onChange={setSearchScope}
        options={[
          { value: 'this-mac', label: '搜索这台 Mac' },
          { value: 'current-folder', label: '搜索当前文件夹' },
        ]}
        value={searchScope}
      />
    </div>
  )
}

export default AdvancedTab
