import { useState } from 'react'
import { AppIcon } from '../../../icons/AppIcon'
import { seekerIcons } from '../icons'
import { Checkbox } from '../../../ui-kit'

interface SidebarItemConfig {
  id: string
  label: string
  icon: keyof typeof seekerIcons
  checked?: boolean
  indeterminate?: boolean
}

interface SidebarSectionConfig {
  id: string
  title: string
  items: SidebarItemConfig[]
}

const initialSections: SidebarSectionConfig[] = [
  {
    id: 'favorites',
    title: '个人收藏',
    items: [
      { id: 'recents', label: '最近使用', icon: 'clock', checked: true },
      { id: 'airdrop', label: '隔空投送', icon: 'airdrop', checked: true },
      { id: 'applications', label: '应用程序', icon: 'applications', checked: true },
      { id: 'desktop', label: '桌面', icon: 'desktop', checked: true },
      { id: 'documents', label: '文稿', icon: 'document', checked: true },
      { id: 'downloads', label: '下载', icon: 'downloads', checked: true },
    ],
  },
  {
    id: 'icloud',
    title: 'iCloud',
    items: [
      { id: 'icloud-drive', label: 'iCloud 云盘', icon: 'cloud-drive', checked: true },
      { id: 'shared', label: '共享', icon: 'shared', checked: true },
    ],
  },
  {
    id: 'locations',
    title: '位置',
    items: [
      { id: 'my-mac', label: '我的 Mac', icon: 'computer' },
      { id: 'hard-disks', label: '硬盘', icon: 'computer', indeterminate: true },
      { id: 'external-disks', label: '外置磁盘', icon: 'computer', checked: true },
      { id: 'network', label: '网络', icon: 'network', checked: true },
    ],
  },
  {
    id: 'tags',
    title: '标签',
    items: [
      { id: 'red', label: '红色', icon: 'tag', checked: true },
      { id: 'orange', label: '橙色', icon: 'tag', checked: true },
      { id: 'yellow', label: '黄色', icon: 'tag', checked: true },
      { id: 'green', label: '绿色', icon: 'tag', checked: true },
      { id: 'blue', label: '蓝色', icon: 'tag', checked: true },
      { id: 'purple', label: '紫色', icon: 'tag', checked: true },
      { id: 'gray', label: '灰色', icon: 'tag', checked: true },
    ],
  },
]

function SidebarTab() {
  const [sections, setSections] = useState(initialSections)

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections((currentSections) => currentSections.map((section) => {
      if (section.id !== sectionId) return section

      return {
        ...section,
        items: section.items.map((item) => {
          if (item.id !== itemId || item.indeterminate) return item
          return { ...item, checked: !item.checked }
        }),
      }
    }))
  }

  return (
    <div className="px-[1.35rem] py-[1rem] text-[.84rem] text-#2f2f2f">
      <div className="mb-[.55rem] font-600">在边栏显示这些项目：</div>

      <div className="rounded-[.42rem] border border-#d5d5d5 bg-#f7f7f7 px-[.72rem] py-[.55rem]">
        {sections.map((section) => (
          <section className="mb-[.55rem] last:mb-0" key={section.id}>
            <div className="mb-[.25rem] text-[.76rem] font-700 text-#8a8a8a">{section.title}</div>
            {section.items.map((item) => (
              <div className="h-[1.72rem] flex items-center gap-[.45rem]" key={item.id}>
                <Checkbox
                  checked={item.checked}
                  indeterminate={item.indeterminate}
                  onChange={() => toggleItem(section.id, item.id)}
                />
                <AppIcon className="w-[.95rem] h-[.95rem] text-#8f8f8f" icon={seekerIcons[item.icon]} strokeWidth={1.75} />
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

export default SidebarTab
