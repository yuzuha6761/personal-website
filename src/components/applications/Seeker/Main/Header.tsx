import { AppIcon } from '../../../icons/AppIcon'
import { useWindowFocus } from '../../../Window/FocusContext'
import { seekerTabs } from '../data'
import { seekerIcons } from '../icons'

const iconButtonClass = 'w-[1.72rem] h-[1.72rem] border-0 rounded-[.36rem] p-0 bg-transparent cursor-default flex items-center justify-center'
const historyIconClass = 'w-[.95rem] h-[.95rem]'
const toolbarIconClass = 'w-[1.08rem] h-[1.08rem]'
const newTabIconClass = 'w-[.9rem] h-[.9rem]'

function Header() {
  const focused = useWindowFocus()?.focused ?? true
  const historyIconColorClass = focused ? 'text-#808080' : 'text-#b8b8b8'
  const toolbarIconColorClass = focused ? 'text-#737373' : 'text-#adadad'
  const newTabIconColorClass = focused ? 'text-#6b6b6b' : 'text-#a8a8a8'
  const titleColorClass = focused ? 'text-#444' : 'text-#a2a2a2'
  const separatorColorClass = focused ? 'bg-#dadada' : 'bg-#e2e2e2'
  const selectedViewButtonClass = focused ? 'bg-#e7e7e7' : 'bg-#e0e0e0'
  const headerBgClass = focused ? 'bg-#f4f4f4' : 'bg-#efefef'
  const tabsBgClass = focused ? 'bg-#eeeeee' : 'bg-#dedede'
  const tabBorderClass = focused ? 'border-r-#d6d6d6' : 'border-r-#d1d1d1'
  const newTabBgClass = focused ? 'bg-#eeeeee' : 'bg-#dedede'

  return (
    <header className={`flex-[0_0_auto] border-b border-b-#d9d9d9 ${headerBgClass}`}>
      <div className="h-[3.65rem] box-border px-[.95rem] pl-[1.1rem] flex items-center">
        <div className="w-[5.1rem] gap-[1.08rem] flex items-center">
          <button className="w-4 h-[1.6rem] border-0 p-0 bg-transparent cursor-default flex items-center justify-center" aria-label="Back" type="button">
            <AppIcon className={`${historyIconClass} ${historyIconColorClass}`} icon={seekerIcons.chevronLeft} />
          </button>
          <button className="w-4 h-[1.6rem] border-0 p-0 bg-transparent cursor-default flex items-center justify-center" aria-label="Forward" type="button">
            <AppIcon className={`${historyIconClass} ${historyIconColorClass}`} icon={seekerIcons.chevronRight} />
          </button>
        </div>

        <div className={`flex-1 min-w-[7rem] ${titleColorClass} text-[1.04rem] font-[760]`}>components</div>

        <div className="gap-[.48rem] flex items-center">
          <button aria-label="Icon view" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.grid} />
          </button>
          <button aria-label="List view" className={`${iconButtonClass} ${selectedViewButtonClass}`} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.list} />
          </button>
          <button aria-label="Column view" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.columns} />
          </button>
          <button aria-label="Gallery view" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.gallery} />
          </button>
          <span className={`w-px h-[1.45rem] mx-[.34rem] ${separatorColorClass}`} />
          <button aria-label="Group" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.group} />
          </button>
          <button aria-label="Share" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.share} />
          </button>
          <button aria-label="Tags" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.tag} />
          </button>
          <button aria-label="More" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.more} />
          </button>
          <button aria-label="New folder" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.plus} />
          </button>
          <button aria-label="Search" className={iconButtonClass} type="button">
            <AppIcon className={`${toolbarIconClass} ${toolbarIconColorClass}`} icon={seekerIcons.search} />
          </button>
        </div>
      </div>

      <div className={`h-8 border-t border-t-#dddddd ${tabsBgClass} flex`}>
        {seekerTabs.map((tab) => (
          <button
            className={`flex-1 min-w-32 border-0 border-r ${tabBorderClass} px-[.8rem] [font:inherit] font-[620] cursor-default ${
              tab.active
                ? focused ? 'bg-#f8f8f8 text-#414141' : 'bg-#f3f3f3 text-#a0a0a0'
                : focused ? 'bg-#e9e9e9 text-#656565' : 'bg-#dedede text-#a7a7a7'
            }`}
            key={tab.id}
            type="button"
          >
            {tab.label}
          </button>
        ))}
        <button aria-label="New tab" className={`flex-[0_0_2.6rem] border-0 p-0 ${newTabBgClass} cursor-default flex items-center justify-center`} type="button">
          <AppIcon className={`${newTabIconClass} ${newTabIconColorClass}`} icon={seekerIcons.plus} />
        </button>
      </div>
    </header>
  )
}

export default Header
