import { Search } from 'lucide-react'
import { AppIcon } from '~/components/icons/AppIcon'
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
    ? 'bg-#d0cccd/68 backdrop-blur-[20px] backdrop-saturate-180'
    : 'bg-#f2f2f2'
  const selectedClass = focused
    ? 'bg-#ec72b1 text-white'
    : 'bg-#d8d8d8 text-#6e6e6e'
  const itemClass = 'flex h-[1.86rem] w-full items-center gap-[.45rem] rounded-[.34rem] border-0 px-[.36rem] text-left text-[.84rem] font-600 cursor-default'

  return (
    <aside className={`relative h-full w-[13.5rem] shrink-0 overflow-hidden ${sidebarBgClass}`}>
      <div className="absolute right-0 top-0 h-full w-px bg-#bfbfbf/58" />
      <div className="h-[3.25rem]" />
      <div className="px-[.62rem]">
        <div className="relative h-[1.78rem]" {...dragExcludeProps}>
          <AppIcon
            className="pointer-events-none absolute left-[.48rem] top-1/2 h-[.86rem] w-[.86rem] -translate-y-1/2 text-#5f5f5f"
            icon={Search}
            strokeWidth={2}
          />
          <input
            aria-label="搜索设置"
            className="h-full w-full rounded-[.34rem] border border-#bdbdbd bg-#c9c9c9/50 pl-[1.55rem] pr-[.48rem] text-[.78rem] outline-none placeholder:text-#8b8b8b"
            placeholder="搜索"
            type="text"
          />
        </div>

        {settingsCategories.map((category) => {
          const selected = category.id === activeCategoryId

          return (
            <button
              className={`mt-[.8rem] ${itemClass} ${selected ? selectedClass : 'bg-transparent text-#1f1f1f'}`}
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              type="button"
            >
              <span className="flex h-[1.18rem] w-[1.18rem] shrink-0 items-center justify-center rounded-[.24rem] bg-#1f1f1f">
                <AppIcon className="h-[.78rem] w-[.78rem] text-white" icon={category.icon} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{category.label}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default Sidebar
