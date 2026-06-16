import { useMemo } from 'react'
import { AppIcon } from '~/components/icons/AppIcon'
import { useWindowFocus } from '~/components/Window/FocusContext'
import useFsStore from '~/fs'
import type { FsDirectoryEntry, FsFileIcon } from '~types'
import { seekerIcons } from '../icons'
import { useSeekerWindow } from '../useSeekerWindow'
import TabBar from './TabBar'
import { SEEKER_DEFAULT_TAB_PATH, SEEKER_TAB_CHROME, shouldShowSeekerTabBar } from './types'

function HairlineHorizontal({ className = '', color }: { className?: string; color: string }) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none ${className}`}
      height="1"
      preserveAspectRatio="none"
      viewBox="0 0 1 1"
    >
      <line
        stroke={color}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        x1="0"
        x2="1"
        y1="0.5"
        y2="0.5"
      />
    </svg>
  )
}

const MIN_EMPTY_ROWS = 10
const listGridClass = 'grid-cols-[minmax(12rem,1.15fr)_minmax(9rem,.62fr)_minmax(5.5rem,.32fr)_minmax(9rem,.55fr)]'
const rowBaseClass = `h-[1.42rem] box-border rounded-[.34rem] grid ${listGridClass}`
const fileIconClass = 'w-4 h-4'

function isFolderEntry(entry: FsDirectoryEntry): boolean {
  return entry.icon === 'folder'
}

function FileIconBadge({ focused, icon, selected }: { focused: boolean; icon: FsFileIcon; selected: boolean }) {
  if (selected && focused) {
    const selectedFolderIconClass = 'text-white'
    const selectedFileIconClass = 'text-white/90'
    const selectedScssBadgeClass = 'text-white'
    const selectedTsBadgeClass = 'text-white/90'

    return (
      <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
        <AppIcon
          className={`${fileIconClass} ${icon === 'folder' ? selectedFolderIconClass : selectedFileIconClass}`}
          icon={seekerIcons[icon]}
          strokeWidth={icon === 'folder' ? 2 : 1.75}
        />
        {icon !== 'folder' && (
          <span className={`absolute font-800 ${icon === 'scss' ? `left-[.43rem] top-[.34rem] ${selectedScssBadgeClass} text-[.42rem]` : `left-[.33rem] top-[.32rem] ${selectedTsBadgeClass} text-[.34rem]`}`}>
            {icon === 'scss' ? 'S' : 'TS'}
          </span>
        )}
      </span>
    )
  }

  const fileIconColorClass = focused ? 'text-#737373' : 'text-#b6b6b6'
  const folderIconColorClass = focused ? 'text-#3595d6' : 'text-#9fc9df'
  const scssBadgeClass = focused ? 'text-#ff4aa3' : 'text-#f1a6cb'
  const tsBadgeClass = focused ? 'text-#3595d6' : 'text-#9fc9df'

  return (
    <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
      <AppIcon
        className={`${fileIconClass} ${icon === 'folder' ? folderIconColorClass : fileIconColorClass}`}
        icon={seekerIcons[icon]}
        strokeWidth={icon === 'folder' ? 2 : 1.75}
      />
      {icon !== 'folder' && (
        <span className={`absolute font-800 ${icon === 'scss' ? `left-[.43rem] top-[.34rem] ${scssBadgeClass} text-[.42rem]` : `left-[.33rem] top-[.32rem] ${tsBadgeClass} text-[.34rem]`}`}>
          {icon === 'scss' ? 'S' : 'TS'}
        </span>
      )}
    </span>
  )
}

function List() {
  const focused = useWindowFocus()?.focused ?? true
  const {
    windowState,
    navigateTo,
    setSelection,
    setActiveTab,
    addTab,
    closeTab,
    moveTabs,
  } = useSeekerWindow()
  const activeTab = windowState?.tabs.find((tab) => tab.id === windowState.activeTabId)
  const currentPath = activeTab?.path ?? SEEKER_DEFAULT_TAB_PATH
  const tabs = windowState?.tabs ?? []
  const activeTabId = windowState?.activeTabId
  const showTabBar = shouldShowSeekerTabBar(tabs.length)
  const nodes = useFsStore((state) => state.nodes)
  const items = useMemo(
    () => useFsStore.getState().listDirectory(currentPath),
    [nodes, currentPath],
  )
  const selection = windowState?.selection ?? []
  const emptyRows = Array.from(
    { length: Math.max(0, MIN_EMPTY_ROWS - items.length) },
    (_, index) => `empty-${index}`,
  )

  const headerTextClass = focused ? 'text-#616161' : 'text-#9d9d9d'
  const headerBorderClass = focused ? 'border-r-#e3e3e3' : 'border-r-#eeeeee'
  const rowTextClass = focused ? 'text-#3b3b3d' : 'text-#8a8a8a'
  const metadataTextClass = focused ? 'text-#858585' : 'text-#9f9f9f'
  const selectedRowBgClass = focused
    ? 'bg-[var(--system-color-solid,#ef5ba1)]'
    : 'bg-#f1f1f1'
  const stripeRowClass = focused ? 'bg-#f3f3f3' : 'bg-#f4f4f4'

  const handleSelect = (path: string) => {
    setSelection([path])
  }

  const handleOpen = (entry: FsDirectoryEntry) => {
    if (!isFolderEntry(entry)) return
    navigateTo(entry.path)
  }

  const handleRowDoubleClick = (entry: FsDirectoryEntry) => {
    handleOpen(entry)
  }

  const handleAddTab = () => {
    addTab(SEEKER_DEFAULT_TAB_PATH)
  }

  const handleCloseTab = (tabId: string) => {
    closeTab(tabId)
  }

  return (
    <section className="min-h-0 flex-1 bg-white flex flex-col">
      {showTabBar && activeTabId ? (
        <TabBar
          activeTabId={activeTabId}
          focused={focused}
          onAddTab={handleAddTab}
          onCloseTab={handleCloseTab}
          onMoveTabs={moveTabs}
          onSelectTab={setActiveTab}
          tabs={tabs}
        />
      ) : null}

      <HairlineHorizontal
        className="shrink-0 w-full"
        color={SEEKER_TAB_CHROME.bottomBorder}
      />

      <div className={`shrink-0 h-[1.82rem] box-border border-b border-b-#dfdfdf grid ${listGridClass} bg-white ${headerTextClass} text-[.78rem] font-700`}>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>名称</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>修改日期</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>大小</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>种类</div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-[.62rem] py-[.45rem]">
        {items.map((item, index) => {
          const selected = selection.includes(item.path)
          const rowBgClass = selected
            ? selectedRowBgClass
            : index % 2 === 1
              ? stripeRowClass
              : 'bg-transparent'
          const nameTextClass = selected && focused ? 'text-white' : rowTextClass
          const itemMetadataTextClass = selected && focused ? 'text-white/85' : metadataTextClass

          return (
            <button
              className={`${rowBaseClass} w-full border-0 p-0 ${nameTextClass} [font:inherit] text-left cursor-default ${rowBgClass}`}
              key={item.path}
              onClick={() => handleSelect(item.path)}
              onDoubleClick={() => handleRowDoubleClick(item)}
              type="button"
            >
              <span className="min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-[.28rem]">
                <span className="w-[.48rem] h-[.72rem] shrink-0" />
                <FileIconBadge focused={focused} icon={item.icon} selected={selected} />
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
              </span>
              <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${itemMetadataTextClass}`}>{item.modified}</span>
              <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${itemMetadataTextClass}`}>{item.size}</span>
              <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${itemMetadataTextClass}`}>{item.kind}</span>
            </button>
          )
        })}
        {emptyRows.map((row, index) => (
          <div className={`${rowBaseClass} ${index % 2 === 1 ? stripeRowClass : ''}`} key={row} />
        ))}
      </div>
    </section>
  )
}

export default List
