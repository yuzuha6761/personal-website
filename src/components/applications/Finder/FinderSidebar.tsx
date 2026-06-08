import { sidebarSections, tagItems } from './data'
import { sidebarIconMap } from './icons'

const sidebarItemClass = 'w-full h-[1.98rem] border-0 rounded-[.34rem] p-0 text-#4a494b bg-transparent [font:inherit] text-[.9rem] font-[560] leading-none cursor-default flex items-center'
const sidebarIconClass = 'flex-[0_0_1.42rem] w-[.9rem] h-[.9rem] mr-[.3rem] object-contain [filter:invert(31%)_sepia(96%)_saturate(2715%)_hue-rotate(305deg)_brightness(105%)_contrast(102%)]'

function FinderSidebar() {
  return (
    <aside className="relative flex-[0_0_10.65rem] h-full overflow-hidden bg-#d0cccd border-r border-r-#bbb8ba">
      <div className="h-[3.85rem]" />
      <div className="h-[calc(100%-3.25rem)] overflow-hidden pt-0 pr-[.75rem] pb-[.9rem] pl-[.9rem]">
        {sidebarSections.map((section) => (
          <section className="mb-[1.08rem]" key={section.id}>
            {section.title && <div className="mb-[.25rem] text-#8c8a8d text-[.78rem] font-700">{section.title}</div>}
            {section.items.map((item) => (
              <button className={sidebarItemClass} key={item.id} type="button">
                <img className={sidebarIconClass} src={sidebarIconMap[item.icon]} alt="" />
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </section>
        ))}

        <section className="mb-[1.08rem]">
          <div className="mb-[.34rem] text-#8c8a8d text-[.74rem] font-700">标签</div>
          {tagItems.map((tag) => (
            <button className={sidebarItemClass} key={tag.id} type="button">
              <span className="flex-[0_0_.55rem] h-[.55rem] mr-[.58rem] ml-[.22rem] rounded-full" style={{ backgroundColor: tag.color }} />
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tag.label}</span>
            </button>
          ))}
        </section>
      </div>
    </aside>
  )
}

export default FinderSidebar
