import { Search } from 'lucide-react'
import { AppIcon } from '~/components/icons/AppIcon'
import { Scrollbar } from '~/components/ui-kit'
import { dragExcludeProps } from '~/components/Window/Drag'
import { useWindowFocus } from '~/components/Window/FocusContext'
import { settingsCategories } from './data'
import type { SettingsCategoryId } from './types'

interface SidebarProps {
  activeCategoryId: SettingsCategoryId
  onSelectCategory: (categoryId: SettingsCategoryId) => void
}

function Sidebar(props: SidebarProps) {
  const { activeCategoryId, onSelectCategory } = props
  const focused = useWindowFocus()?.focused ?? true
  const sidebarBgClass = focused
    ? 'bg-[var(--system-settings-sidebar-focused)] backdrop-blur-[20px] backdrop-saturate-180'
    : 'bg-[var(--system-settings-sidebar-unfocused)]'
  const selectedClass = focused
    ? 'bg-[var(--system-settings-sidebar-selected-focused)] text-white'
    : 'bg-[var(--system-settings-sidebar-selected-unfocused)] text-[var(--system-settings-sidebar-selected-unfocused-text)]'
  const itemClass = 'flex h-[1.86rem] w-full items-center gap-[.45rem] rounded-[.34rem] border-0 px-[.36rem] text-left text-[.84rem] font-600 cursor-default'

  return (
    <aside className={`relative flex h-full w-[13.5rem] shrink-0 flex-col overflow-hidden ${sidebarBgClass}`}>
      <div className="absolute right-0 top-0 h-full w-px bg-[var(--system-settings-sidebar-border)]" />
      <div className="h-[3.25rem] shrink-0" />
      <div className="shrink-0 px-[.62rem]" {...dragExcludeProps}>
        <div className="relative h-[1.78rem]">
          <AppIcon
            className="pointer-events-none absolute left-[.48rem] top-1/2 h-[.86rem] w-[.86rem] -translate-y-1/2 text-[var(--system-settings-sidebar-search-icon)]"
            icon={Search}
            strokeWidth={2}
          />
          <input
            aria-label="搜索设置"
            className="h-full w-full rounded-[.34rem] border border-[var(--system-settings-sidebar-search-border)] bg-[var(--system-settings-sidebar-search-bg)] pl-[1.55rem] pr-[.48rem] text-[.78rem] outline-none placeholder:text-[var(--system-settings-sidebar-search-placeholder)]"
            placeholder="搜索"
            type="text"
          />
        </div>
      </div>

      <Scrollbar className="min-h-0 flex-1" contentClassName="px-[.62rem] pb-[.62rem]">
        {settingsCategories.map((category) => {
          const selected = category.id === activeCategoryId

          return (
            <button
              className={`mt-[.8rem] ${itemClass} ${selected ? selectedClass : 'bg-transparent text-[var(--system-settings-sidebar-item-text)]'}`}
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              type="button"
            >
              <span className="flex h-[1.18rem] w-[1.18rem] shrink-0 items-center justify-center rounded-[.24rem] bg-[var(--system-settings-sidebar-category-icon-bg)]">
                <AppIcon className="h-[.78rem] w-[.78rem] text-white" icon={category.icon} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{category.label}</span>
            </button>
          )
        })}
      </Scrollbar>
    </aside>
  )
}

export default Sidebar
