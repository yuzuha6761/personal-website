import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { HardDrive, Laptop } from 'lucide-react'
import folderIcon from '~assets/common/folder.svg'
import { AppIcon } from '~/components/icons/AppIcon'
import { seekerIcons } from '~/components/applications/Seeker/icons'
import type { SeekerNewWindowPathOption } from '~/components/applications/Seeker/newWindowPath'
import { getBootStorageDeviceLabel } from '~/components/applications/Seeker/newWindowPath'
import useSeekerGlobalStore from '~/components/applications/Seeker/store'
import { Checkbox, Select, type SelectOption } from '~/components/ui-kit'

function selectMenuIcon(icon: LucideIcon, className = 'text-#3595d6') {
  return <AppIcon className={`w-[.95rem] h-[.95rem] ${className}`} icon={icon} strokeWidth={2} />
}

function selectFolderIcon() {
  return <img alt="" className="w-[.95rem] h-[.95rem]" src={folderIcon} />
}

function selectFolderMenuIcon() {
  return <img alt="" className="w-[.9rem] h-[.9rem]" src={folderIcon} />
}

function GeneralTab() {
  const [desktopItems, setDesktopItems] = useState({
    hardDisks: false,
    externalDisks: true,
    cds: true,
    servers: false,
  })
  const newWindowPathOption = useSeekerGlobalStore((state) => state.newWindowPathOption)
  const setNewWindowPathOption = useSeekerGlobalStore((state) => state.setNewWindowPathOption)
  const [syncDesktopDocuments, setSyncDesktopDocuments] = useState(false)
  const [openInTabs, setOpenInTabs] = useState(true)

  const newWindowPathOptions = useMemo<SelectOption[]>(() => [
    {
      value: 'yuzuha-website',
      label: 'yuzuha website',
      menuIcon: Laptop,
      icon: selectMenuIcon(Laptop, 'text-[var(--settings-scene-text,#2f2f2f)]'),
    },
    {
      value: 'mcintosh-hd',
      label: getBootStorageDeviceLabel(),
      menuIcon: HardDrive,
      icon: selectMenuIcon(HardDrive, 'text-[var(--settings-scene-text,#2f2f2f)]'),
    },
    { type: 'separator', id: 'new-window-path-divider-1' },
    {
      value: 'yuzuha',
      label: 'yuzuha',
      menuIconNode: selectFolderMenuIcon(),
      icon: selectFolderIcon(),
    },
    {
      value: 'desktop',
      label: '桌面',
      menuIconNode: selectFolderMenuIcon(),
      icon: selectFolderIcon(),
    },
    {
      value: 'documents',
      label: '文稿',
      menuIconNode: selectFolderMenuIcon(),
      icon: selectFolderIcon(),
    },
    {
      value: 'recents',
      label: '最近使用',
      menuIcon: seekerIcons.clock,
      icon: selectMenuIcon(seekerIcons.clock, 'text-[var(--settings-scene-text,#6b7280)]'),
    },
    {
      value: 'cloud-drive',
      label: '云盘',
      menuIcon: seekerIcons['cloud-drive'],
      icon: selectMenuIcon(seekerIcons['cloud-drive']),
    },
    { type: 'separator', id: 'new-window-path-divider-2' },
    {
      value: 'other',
      label: '其他...',
      disabled: true,
    },
  ], [])

  return (
    <div className="bg-[var(--settings-scene-content-bg)] px-[1.35rem] py-[1rem] text-[.84rem] text-[var(--settings-scene-text,#2f2f2f)]">
      <section className="mb-[1.15rem]">
        <div className="mb-[.45rem] font-600">在桌面上显示这些项目：</div>
        <div className="flex flex-col gap-[.35rem] pl-[1.2rem]">
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
      </section>

      <section className="mb-[1.15rem]">
        <div className="mb-[.45rem] font-600">开启新“Seeker”窗口时打开：</div>
        <div className="px-[1.2rem]">
          <Select
            onChange={(value) => setNewWindowPathOption(value as SeekerNewWindowPathOption)}
            options={newWindowPathOptions}
            value={newWindowPathOption}
          />
        </div>
      </section>

      <section className="mb-[.85rem]">
        <Checkbox
          checked={syncDesktopDocuments}
          disabled
          description="你的“桌面与文稿”文件夹正与云盘同步。你也可以从其他设备访问。"
          label="同步“桌面与文稿”文件夹"
          onChange={setSyncDesktopDocuments}
        />
      </section>

      <section>
        <Checkbox
          checked={openInTabs}
          label="在标签页（而不是新窗口）中打开文件夹"
          onChange={setOpenInTabs}
        />
      </section>
    </div>
  )
}

export default GeneralTab
