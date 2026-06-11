import { Minus } from 'lucide-react'
import { AppIcon } from '../../../icons/AppIcon'
import { Stepper } from '../../../ui-kit'

const tagItems = [
  { id: 'red', label: '红色', color: '#ff6b67' },
  { id: 'orange', label: '橙色', color: '#ffb45b' },
  { id: 'yellow', label: '黄色', color: '#ffd66b' },
  { id: 'green', label: '绿色', color: '#7bd889' },
  { id: 'blue', label: '蓝色', color: '#75b7ff' },
  { id: 'purple', label: '紫色', color: '#c48ce4' },
  { id: 'gray', label: '灰色', color: '#b6b6b6' },
  { id: 'work', label: 'Work', color: '#ffffff' },
  { id: 'home', label: 'Home', color: '#ffffff' },
  { id: 'important', label: 'Important', color: '#ffffff' },
]

const favoriteTags = tagItems.slice(0, 7)

function TagsTab() {
  return (
    <div className="px-[1.35rem] py-[1rem] text-[.84rem] text-#2f2f2f">
      <div className="mb-[.55rem] font-600">在边栏显示这些标签：</div>

      <div className="rounded-[.42rem] border border-#d5d5d5 overflow-hidden bg-white">
        {tagItems.map((tag, index) => (
          <div
            className={`h-[1.72rem] px-[.62rem] flex items-center gap-[.55rem] ${
              index % 2 === 0 ? 'bg-white' : 'bg-#f7f7f7'
            }`}
            key={tag.id}
          >
            <span
              className="w-[.72rem] h-[.72rem] rounded-full border border-#d0d0d0"
              style={{ backgroundColor: tag.color }}
            />
            <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tag.label}</span>
            <button
              aria-label={`Remove ${tag.label}`}
              className="w-[1.15rem] h-[1.15rem] border-0 rounded-[.22rem] bg-#c13584 p-0 cursor-default flex items-center justify-center"
              type="button"
            >
              <AppIcon className="w-[.58rem] h-[.58rem] text-white" icon={Minus} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-[.55rem]">
        <Stepper />
      </div>

      <div className="mt-[.72rem] text-[.76rem] leading-[1.2rem] text-#8a8a8a">
        将你的个人收藏标签拖移到下方区域，以便在“Seeker”菜单中快速使用它们。
      </div>

      <div className="mt-[.55rem] rounded-[.42rem] border border-#d5d5d5 bg-white px-[.72rem] py-[.62rem]">
        <div className="text-[.76rem] text-#8a8a8a mb-[.45rem]">标签...</div>
        <div className="flex items-center justify-center gap-[.55rem] py-[.35rem]">
          {favoriteTags.map((tag) => (
            <span
              className="w-[.82rem] h-[.82rem] rounded-full border border-#d0d0d0"
              key={tag.id}
              style={{ backgroundColor: tag.color }}
            />
          ))}
        </div>
        <div className="text-center text-[.76rem] text-#8a8a8a mt-[.35rem]">个人收藏标签</div>
      </div>
    </div>
  )
}

export default TagsTab
