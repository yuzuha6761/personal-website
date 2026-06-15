import type { ComponentType } from 'react'
import { ChevronLeft, ChevronRight, CircleHelp } from 'lucide-react'
import { AppIcon } from '~/components/icons/AppIcon'
import { dragHandleProps } from '~/components/Window/Drag'
import Appearance from './category/Appearance'
import { settingsCategories } from './data'
import type { SettingsCategoryId } from './types'

const categoryComponents: Record<SettingsCategoryId, ComponentType> = {
  appearance: Appearance,
}

interface MainContentProps {
  activeCategoryId: SettingsCategoryId
}

function MainContent(props: MainContentProps) {
  const { activeCategoryId } = props
  const activeCategory = settingsCategories.find((category) => category.id === activeCategoryId)
  const CategoryComponent = categoryComponents[activeCategoryId]

  return (
    <main className="relative min-w-0 flex-1 bg-#f4f4f4">
      <div className="h-[3.2rem] px-[1.15rem] flex items-center gap-[.75rem]" {...dragHandleProps}>
        <div className="flex items-center gap-[.55rem] text-#7c7c7c">
          <AppIcon className="h-[1.28rem] w-[1.28rem]" icon={ChevronLeft} strokeWidth={1.8} />
          <AppIcon className="h-[1.28rem] w-[1.28rem] text-#b7b7b7" icon={ChevronRight} strokeWidth={1.8} />
        </div>
        <h1 className="m-0 text-[1rem] font-700 leading-none text-#373737">{activeCategory?.label}</h1>
      </div>

      <div className="h-[calc(100%-3.2rem)] overflow-auto px-[1.25rem] pb-[2.4rem]">
        <CategoryComponent />
      </div>

      <button
        aria-label="帮助"
        className="absolute bottom-[1.08rem] right-[1.24rem] h-[1.36rem] w-[1.36rem] rounded-full border border-#cfcfcf bg-white p-0 text-#4f4f4f shadow-[0_.08rem_.2rem_#0000001c] cursor-default flex items-center justify-center"
        type="button"
      >
        <AppIcon className="h-[.88rem] w-[.88rem]" icon={CircleHelp} strokeWidth={2.1} />
      </button>
    </main>
  )
}

export default MainContent
