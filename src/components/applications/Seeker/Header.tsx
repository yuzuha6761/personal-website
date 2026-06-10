import { AppIcon } from '../../icons/AppIcon'
import { seekerTabs } from './data'
import { seekerIcons } from './icons'

const iconButtonClass = 'w-[1.72rem] h-[1.72rem] border-0 rounded-[.36rem] p-0 bg-transparent cursor-default flex items-center justify-center'
const historyIconClass = 'w-[.95rem] h-[.95rem] text-#808080'
const toolbarIconClass = 'w-[1.08rem] h-[1.08rem] text-#737373'
const newTabIconClass = 'w-[.9rem] h-[.9rem] text-#6b6b6b'

function Header() {
  return (
    <header className="flex-[0_0_auto] border-b border-b-#d9d9d9 bg-#f4f4f4">
      <div className="h-[3.65rem] box-border px-[.95rem] pl-[1.1rem] flex items-center">
        <div className="w-[5.1rem] gap-[1.08rem] flex items-center">
          <button className="w-4 h-[1.6rem] border-0 p-0 bg-transparent cursor-default flex items-center justify-center" aria-label="Back" type="button">
            <AppIcon className={historyIconClass} icon={seekerIcons.chevronLeft} />
          </button>
          <button className="w-4 h-[1.6rem] border-0 p-0 bg-transparent cursor-default flex items-center justify-center" aria-label="Forward" type="button">
            <AppIcon className={historyIconClass} icon={seekerIcons.chevronRight} />
          </button>
        </div>

        <div className="flex-1 min-w-[7rem] text-#444 text-[1.04rem] font-[760]">components</div>

        <div className="gap-[.48rem] flex items-center">
          <button aria-label="Icon view" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.grid} />
          </button>
          <button aria-label="List view" className={`${iconButtonClass} bg-#e7e7e7`} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.list} />
          </button>
          <button aria-label="Column view" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.columns} />
          </button>
          <button aria-label="Gallery view" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.gallery} />
          </button>
          <span className="w-px h-[1.45rem] mx-[.34rem] bg-#dadada" />
          <button aria-label="Group" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.group} />
          </button>
          <button aria-label="Share" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.share} />
          </button>
          <button aria-label="Tags" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.tag} />
          </button>
          <button aria-label="More" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.more} />
          </button>
          <button aria-label="New folder" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.plus} />
          </button>
          <button aria-label="Search" className={iconButtonClass} type="button">
            <AppIcon className={toolbarIconClass} icon={seekerIcons.search} />
          </button>
        </div>
      </div>

      <div className="h-8 border-t border-t-#dddddd bg-#eeeeee flex">
        {seekerTabs.map((tab) => (
          <button
            className={`flex-1 min-w-32 border-0 border-r border-r-#d6d6d6 px-[.8rem] text-#656565 [font:inherit] font-[620] cursor-default ${tab.active ? 'bg-#f8f8f8 text-#414141' : 'bg-#e9e9e9'}`}
            key={tab.id}
            type="button"
          >
            {tab.label}
          </button>
        ))}
        <button aria-label="New tab" className="flex-[0_0_2.6rem] border-0 p-0 bg-#eeeeee cursor-default flex items-center justify-center" type="button">
          <AppIcon className={newTabIconClass} icon={seekerIcons.plus} />
        </button>
      </div>
    </header>
  )
}

export default Header
