import { AppIcon } from '../../icons/AppIcon'
import { seekerItems } from './data'
import { seekerIcons } from './icons'

const emptyRows = Array.from({ length: 10 }, (_, index) => `empty-${index}`)
const listGridClass = 'grid-cols-[minmax(12rem,1.15fr)_minmax(9rem,.62fr)_minmax(5.5rem,.32fr)_minmax(9rem,.55fr)]'
const rowBaseClass = `h-[1.86rem] box-border rounded-[.34rem] grid ${listGridClass}`
const disclosureIconClass = 'w-[.48rem] h-[.48rem] text-#737373'
const fileIconClass = 'w-4 h-4 text-#737373'
const folderIconClass = `${fileIconClass} text-#3595d6`

function List() {
  return (
    <section className="min-h-0 flex-1 bg-white flex flex-col">
      <div className={`h-[1.82rem] box-border border-b border-b-#dfdfdf grid ${listGridClass} text-#616161 text-[.78rem] font-700`}>
        <div className="min-w-0 px-[.72rem] py-[.32rem] border-r border-r-#e3e3e3 overflow-hidden text-ellipsis whitespace-nowrap">名称</div>
        <div className="min-w-0 px-[.72rem] py-[.32rem] border-r border-r-#e3e3e3 overflow-hidden text-ellipsis whitespace-nowrap">修改日期</div>
        <div className="min-w-0 px-[.72rem] py-[.32rem] border-r border-r-#e3e3e3 overflow-hidden text-ellipsis whitespace-nowrap">大小</div>
        <div className="min-w-0 px-[.72rem] py-[.32rem] border-r border-r-#e3e3e3 overflow-hidden text-ellipsis whitespace-nowrap">种类</div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-[.62rem] py-[.45rem]">
        {seekerItems.map((item, index) => (
          <button
            className={`${rowBaseClass} w-full border-0 p-0 text-#3b3b3d [font:inherit] text-left cursor-default ${item.selected || index % 2 === 1 ? 'bg-#f2f2f2' : 'bg-transparent'}`}
            key={item.id}
            type="button"
          >
            <span className="min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-[.28rem]">
              <span className="w-[.48rem] h-[.72rem] flex items-center justify-center">
                {item.expanded && <AppIcon className={disclosureIconClass} icon={seekerIcons.chevronRight} strokeWidth={2.5} />}
              </span>
              <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
                <AppIcon
                  className={item.icon === 'folder' ? folderIconClass : fileIconClass}
                  icon={seekerIcons[item.icon]}
                  strokeWidth={item.icon === 'folder' ? 2 : 1.75}
                />
                {item.icon !== 'folder' && (
                  <span className={`absolute font-800 ${item.icon === 'scss' ? 'left-[.43rem] top-[.34rem] text-#ff4aa3 text-[.42rem]' : 'left-[.33rem] top-[.32rem] text-#3595d6 text-[.34rem]'}`}>
                    {item.icon === 'scss' ? 'S' : 'TS'}
                  </span>
                )}
              </span>
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
            </span>
            <span className="min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-#858585">{item.modified}</span>
            <span className="min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-#858585">{item.size}</span>
            <span className="min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-#858585">{item.kind}</span>
          </button>
        ))}
        {emptyRows.map((row, index) => (
          <div className={`${rowBaseClass} ${index % 2 === 1 ? 'bg-#f3f3f3' : ''}`} key={row} />
        ))}
      </div>
    </section>
  )
}

export default List
