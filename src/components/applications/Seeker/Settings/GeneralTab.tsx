import { useState } from 'react'
import { Folder } from 'lucide-react'
import { AppIcon } from '../../../icons/AppIcon'
import { Checkbox, Select } from '../../../ui-kit'

function GeneralTab() {
  const [desktopItems, setDesktopItems] = useState({
    hardDisks: false,
    externalDisks: true,
    cds: true,
    servers: false,
  })
  const [newWindowPath, setNewWindowPath] = useState('yuzuha')
  const [syncDesktopDocuments, setSyncDesktopDocuments] = useState(true)
  const [openInTabs, setOpenInTabs] = useState(true)

  return (
    <div className="px-[1.35rem] py-[1rem] text-[.84rem] text-[var(--settings-scene-text,#2f2f2f)]">
      <div className="mb-[.72rem] font-600">在桌面上显示这些项目：</div>
      <div className="flex flex-col gap-[.42rem] mb-[1rem]">
        <Checkbox
          checked={desktopItems.hardDisks}
          label="硬盘"
          onChange={(checked) => setDesktopItems((state) => ({ ...state, hardDisks: checked }))}
        />
        <Checkbox
          checked={desktopItems.externalDisks}
          label="外置磁盘"
          onChange={(checked) => setDesktopItems((state) => ({ ...state, externalDisks: checked }))}
        />
        <Checkbox
          checked={desktopItems.cds}
          label="CD、DVD 和 iPod"
          onChange={(checked) => setDesktopItems((state) => ({ ...state, cds: checked }))}
        />
        <Checkbox
          checked={desktopItems.servers}
          label="已连接的服务器"
          onChange={(checked) => setDesktopItems((state) => ({ ...state, servers: checked }))}
        />
      </div>

      <div className="mb-[.45rem] font-600">开启新“Seeker”窗口时打开：</div>
      <Select
        onChange={setNewWindowPath}
        options={[
          {
            value: 'yuzuha',
            label: 'yuzuha',
            menuIcon: Folder,
            icon: <AppIcon className="w-[.95rem] h-[.95rem] text-#3595d6" icon={Folder} strokeWidth={2} />,
          },
          {
            value: 'components',
            label: 'components',
            menuIcon: Folder,
            icon: <AppIcon className="w-[.95rem] h-[.95rem] text-#3595d6" icon={Folder} strokeWidth={2} />,
          },
        ]}
        value={newWindowPath}
      />

      <div className="mt-[1rem] flex flex-col gap-[.35rem]">
        <Checkbox
          checked={syncDesktopDocuments}
          label="同步“桌面与文稿”文件夹"
          onChange={setSyncDesktopDocuments}
        />
        <div className="pl-[1.55rem] text-[.76rem] leading-[1.2rem] text-[var(--settings-scene-muted-text,#8a8a8a)]">
          你的“桌面与文稿”文件夹正与 iCloud 云盘同步。你也可以从其他设备访问。
        </div>
      </div>

      <div className="mt-[.72rem]">
        <Checkbox
          checked={openInTabs}
          label="在标签页（而不是新窗口）中打开文件夹"
          onChange={setOpenInTabs}
        />
      </div>
    </div>
  )
}

export default GeneralTab
