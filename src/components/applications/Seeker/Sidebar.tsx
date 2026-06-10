import { AppIcon } from '../../icons/AppIcon'
import { sidebarSections, tagItems } from './data'
import { seekerIcons } from './icons'

const sidebarItemClass = 'w-full h-[1.98rem] border-0 rounded-[.34rem] p-0 bg-transparent [font:inherit] text-[.9rem] font-[560] leading-none cursor-default flex items-center'
const sidebarIconClass = 'flex-[0_0_1.42rem] w-[.9rem] h-[.9rem] mr-[.3rem]'

interface SidebarProps {
  focused: boolean
}

function Sidebar(props: SidebarProps) {
  const { focused } = props
  const sidebarBgClass = focused ? 'bg-#d0cccd' : 'bg-#e2e2e2'
  const sidebarBorderClass = focused ? 'border-r-#bbb8ba' : 'border-r-#d5d5d5'
  const sidebarTitleClass = focused ? 'text-#8c8a8d' : 'text-#a3a3a3'
  const sidebarTextClass = focused ? 'text-#4a494b' : 'text-#a2a2a2'
  const sidebarIconColorClass = focused ? 'text-#c13584' : 'text-#ffb3da'

  return (
    <aside className={`relative flex-[0_0_10.65rem] h-full overflow-hidden border-r ${sidebarBgClass} ${sidebarBorderClass}`}>
      <div className="h-[3.85rem]" />
      <div className="h-[calc(100%-3.25rem)] overflow-hidden pt-0 pr-[.75rem] pb-[.9rem] pl-[.9rem]">
        {sidebarSections.map((section) => (
          <section className="mb-[1.08rem]" key={section.id}>
            {section.title && <div className={`mb-[.25rem] ${sidebarTitleClass} text-[.78rem] font-700`}>{section.title}</div>}
            {section.items.map((item) => (
              <button className={`${sidebarItemClass} ${sidebarTextClass}`} key={item.id} type="button">
                <AppIcon className={`${sidebarIconClass} ${sidebarIconColorClass}`} icon={seekerIcons[item.icon]} />
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </section>
        ))}

        <section className="mb-[1.08rem]">
          <div className={`mb-[.34rem] ${sidebarTitleClass} text-[.74rem] font-700`}>标签</div>
          {tagItems.map((tag) => (
            <button className={`${sidebarItemClass} ${sidebarTextClass}`} key={tag.id} type="button">
              <span
                className="flex-[0_0_.55rem] h-[.55rem] mr-[.58rem] ml-[.22rem] rounded-full"
                style={{ backgroundColor: tag.color, opacity: focused ? 1 : 0.42 }}
              />
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tag.label}</span>
            </button>
          ))}
        </section>
      </div>
    </aside>
  )
}

export default Sidebar
