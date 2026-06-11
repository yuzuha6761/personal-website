import { AppIcon } from '../../../icons/AppIcon'
import { seekerItems } from '../data'
import { seekerIcons } from '../icons'

const emptyRows = Array.from({ length: 10 }, (_, index) => `empty-${index}`)
const listGridClass = 'grid-cols-[minmax(12rem,1.15fr)_minmax(9rem,.62fr)_minmax(5.5rem,.32fr)_minmax(9rem,.55fr)]'
const rowBaseClass = `h-[1.86rem] box-border rounded-[.34rem] grid ${listGridClass}`
const disclosureIconClass = 'w-[.48rem] h-[.48rem]'
const fileIconClass = 'w-4 h-4'

interface ListProps {
  focused: boolean
}

function List(props: ListProps) {
  const { focused } = props
  const headerTextClass = focused ? 'text-#616161' : 'text-#9d9d9d'
  const headerBorderClass = focused ? 'border-r-#e3e3e3' : 'border-r-#eeeeee'
  const rowTextClass = focused ? 'text-#3b3b3d' : 'text-#8a8a8a'
  const metadataTextClass = focused ? 'text-#858585' : 'text-#9f9f9f'
  const selectedRowClass = focused ? 'bg-#f2f2f2' : 'bg-#f1f1f1'
  const stripeRowClass = focused ? 'bg-#f3f3f3' : 'bg-#f4f4f4'
  const disclosureColorClass = focused ? 'text-#737373' : 'text-#acacac'
  const fileIconColorClass = focused ? 'text-#737373' : 'text-#b6b6b6'
  const folderIconColorClass = focused ? 'text-#3595d6' : 'text-#9fc9df'
  const scssBadgeClass = focused ? 'text-#ff4aa3' : 'text-#f1a6cb'
  const tsBadgeClass = focused ? 'text-#3595d6' : 'text-#9fc9df'

  return (
    <section className="min-h-0 flex-1 bg-white flex flex-col">
      <div className={`h-[1.82rem] box-border border-b border-b-#dfdfdf grid ${listGridClass} ${headerTextClass} text-[.78rem] font-700`}>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>名称</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>修改日期</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>大小</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>种类</div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-[.62rem] py-[.45rem]">
        {seekerItems.map((item, index) => (
          <button
            className={`${rowBaseClass} w-full border-0 p-0 ${rowTextClass} [font:inherit] text-left cursor-default ${item.selected || index % 2 === 1 ? selectedRowClass : 'bg-transparent'}`}
            key={item.id}
            type="button"
          >
            <span className="min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-[.28rem]">
              <span className="w-[.48rem] h-[.72rem] flex items-center justify-center">
                {item.expanded && <AppIcon className={`${disclosureIconClass} ${disclosureColorClass}`} icon={seekerIcons.chevronRight} strokeWidth={2.5} />}
              </span>
              <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
                <AppIcon
                  className={`${fileIconClass} ${item.icon === 'folder' ? folderIconColorClass : fileIconColorClass}`}
                  icon={seekerIcons[item.icon]}
                  strokeWidth={item.icon === 'folder' ? 2 : 1.75}
                />
                {item.icon !== 'folder' && (
                  <span className={`absolute font-800 ${item.icon === 'scss' ? `left-[.43rem] top-[.34rem] ${scssBadgeClass} text-[.42rem]` : `left-[.33rem] top-[.32rem] ${tsBadgeClass} text-[.34rem]`}`}>
                    {item.icon === 'scss' ? 'S' : 'TS'}
                  </span>
                )}
              </span>
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
            </span>
            <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${metadataTextClass}`}>{item.modified}</span>
            <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${metadataTextClass}`}>{item.size}</span>
            <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${metadataTextClass}`}>{item.kind}</span>
          </button>
        ))}
        {emptyRows.map((row, index) => (
          <div className={`${rowBaseClass} ${index % 2 === 1 ? stripeRowClass : ''}`} key={row} />
        ))}
      </div>
    </section>
  )
}

export default List
