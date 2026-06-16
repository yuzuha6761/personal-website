import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import folderIcon from '~assets/common/folder.svg'
import { AppIcon } from '~/components/icons/AppIcon'
import { useWindowFocus } from '~/components/Window/FocusContext'
import useFsStore from '~/fs'
import type { FsDirectoryEntry, FsFileIcon } from '~types'
import { seekerIcons } from '../icons'
import { useSeekerWindow } from '../useSeekerWindow'
import TabBar from './TabBar'
import { SEEKER_DEFAULT_TAB_PATH, shouldShowSeekerTabBar } from './types'

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

const ROW_HEIGHT_REM = 1.42
const listGridClass = 'grid-cols-[minmax(12rem,1.15fr)_minmax(9rem,.62fr)_minmax(5.5rem,.32fr)_minmax(9rem,.55fr)]'
const rowBaseClass = `h-[1.42rem] box-border grid ${listGridClass}`
const rowRadiusClass = 'rounded-[.34rem]'
const fileIconClass = 'w-4 h-4'
const listRowLightClass = 'bg-[var(--seeker-list-row-light)]'
const listRowDarkClass = 'bg-[var(--seeker-list-row-dark)]'

function getListRowStripeClass(index: number) {
  return index % 2 === 1 ? listRowDarkClass : listRowLightClass
}

type SelectionDragState = {
  additive: boolean
  anchorIndex: number | null
  baseSelection: Set<string>
  cleanup: () => void
  currentIndex: number | null
  itemPaths: string[]
}

function isFolderEntry(entry: FsDirectoryEntry): boolean {
  return entry.icon === 'folder'
}

function FileIconBadge({ icon, selected }: { icon: FsFileIcon; selected: boolean }) {
  if (icon === 'folder') {
    return (
      <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
        <img alt="" className={fileIconClass} src={folderIcon} />
      </span>
    )
  }

  if (selected) {
    const selectedFileIconClass = 'text-white/90'
    const selectedScssBadgeClass = 'text-white'
    const selectedTsBadgeClass = 'text-white/90'

    return (
      <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
        <AppIcon
          className={`${fileIconClass} ${selectedFileIconClass}`}
          icon={seekerIcons[icon]}
          strokeWidth={1.75}
        />
        <span className={`absolute font-800 ${icon === 'scss' ? `left-[.43rem] top-[.34rem] ${selectedScssBadgeClass} text-[.42rem]` : `left-[.33rem] top-[.32rem] ${selectedTsBadgeClass} text-[.34rem]`}`}>
          {icon === 'scss' ? 'S' : 'TS'}
        </span>
      </span>
    )
  }

  const fileIconColorClass = 'text-#737373'
  const scssBadgeClass = 'text-#ff4aa3'
  const tsBadgeClass = 'text-#3595d6'

  return (
    <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
      <AppIcon
        className={`${fileIconClass} ${fileIconColorClass}`}
        icon={seekerIcons[icon]}
        strokeWidth={1.75}
      />
      <span className={`absolute font-800 ${icon === 'scss' ? `left-[.43rem] top-[.34rem] ${scssBadgeClass} text-[.42rem]` : `left-[.33rem] top-[.32rem] ${tsBadgeClass} text-[.34rem]`}`}>
        {icon === 'scss' ? 'S' : 'TS'}
      </span>
    </span>
  )
}

function List() {
  const listRef = useRef<HTMLDivElement>(null)
  const selectionDragRef = useRef<SelectionDragState | null>(null)
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
  const itemPaths = useMemo(() => items.map((item) => item.path), [items])
  const selection = windowState?.selection ?? []
  const [fillerRowCount, setFillerRowCount] = useState(0)
  const emptyRows = useMemo(
    () => Array.from({ length: fillerRowCount }, (_, index) => `empty-${index}`),
    [fillerRowCount],
  )

  const headerTextClass = 'text-#616161'
  const headerBorderClass = focused ? 'border-r-#e3e3e3' : 'border-r-#eeeeee'
  const fileNameTextClass = 'text-[var(--seeker-list-name-text)]'
  const metadataTextClass = 'text-[var(--seeker-list-metadata-text)]'
  const selectedRowBgClass = focused
    ? 'bg-[var(--system-color-solid,#ef5ba1)]'
    : 'bg-[var(--seeker-list-selected-unfocused)]'
  const selectedJoinDividerColor = focused
    ? 'color-mix(in srgb, var(--system-color-solid,#ef5ba1) 85%, white)'
    : '#d1d1d2'

  useEffect(() => {
    return () => {
      selectionDragRef.current?.cleanup()
    }
  }, [])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const updateFillerRows = () => {
      const styles = getComputedStyle(list)
      const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const rowHeight = ROW_HEIGHT_REM * rootFontSize
      const totalRows = Math.ceil((list.clientHeight - paddingY) / rowHeight)
      setFillerRowCount(Math.max(0, totalRows - items.length))
    }

    updateFillerRows()
    const observer = new ResizeObserver(updateFillerRows)
    observer.observe(list)
    return () => observer.disconnect()
  }, [items.length])

  const getRowIndexFromPoint = (clientX: number, clientY: number) => {
    const list = listRef.current
    const target = document.elementFromPoint(clientX, clientY)
    const row = target instanceof Element
      ? target.closest<HTMLElement>('[data-seeker-file-row-index]')
      : null

    if (!list || !row || !list.contains(row)) return null

    const rowIndex = Number(row.dataset.seekerFileRowIndex)
    return Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < itemPaths.length
      ? rowIndex
      : null
  }

  const getSelectionForRange = (dragState: SelectionDragState, currentIndex: number) => {
    const anchorIndex = dragState.anchorIndex ?? currentIndex
    const [startIndex, endIndex] = anchorIndex < currentIndex
      ? [anchorIndex, currentIndex]
      : [currentIndex, anchorIndex]
    const rangePaths = dragState.itemPaths.slice(startIndex, endIndex + 1)

    if (!dragState.additive) return rangePaths

    const nextSelection = new Set(dragState.baseSelection)
    for (const path of rangePaths) {
      if (dragState.baseSelection.has(path)) {
        nextSelection.delete(path)
      }
      else {
        nextSelection.add(path)
      }
    }

    return [...nextSelection]
  }

  const applyDragSelection = (dragState: SelectionDragState, currentIndex: number) => {
    dragState.anchorIndex ??= currentIndex
    dragState.currentIndex = currentIndex
    setSelection(getSelectionForRange(dragState, currentIndex))
  }

  const handleNameSelect = (path: string, event: ReactMouseEvent) => {
    if (!event.metaKey) {
      setSelection([path])
      return
    }

    const nextSelection = new Set(selection)
    if (nextSelection.has(path)) {
      nextSelection.delete(path)
    }
    else {
      nextSelection.add(path)
    }

    setSelection([...nextSelection])
  }

  const handleListMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (event.target instanceof Element && event.target.closest('[data-seeker-file-name]')) return

    event.preventDefault()

    selectionDragRef.current?.cleanup()

    const dragState: SelectionDragState = {
      additive: event.metaKey,
      anchorIndex: null,
      baseSelection: new Set(selection),
      cleanup: () => {},
      currentIndex: null,
      itemPaths,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rowIndex = getRowIndexFromPoint(moveEvent.clientX, moveEvent.clientY)
      if (rowIndex === null || rowIndex === dragState.currentIndex) return
      applyDragSelection(dragState, rowIndex)
    }

    const handleMouseUp = () => {
      dragState.cleanup()
      if (selectionDragRef.current === dragState) {
        selectionDragRef.current = null
      }
    }

    dragState.cleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    selectionDragRef.current = dragState
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    const rowIndex = getRowIndexFromPoint(event.clientX, event.clientY)
    if (rowIndex !== null) {
      applyDragSelection(dragState, rowIndex)
      return
    }

    if (!dragState.additive) {
      setSelection([])
    }
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
    <section className={`min-h-0 flex-1 ${listRowLightClass} flex flex-col`}>
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
        color="var(--seeker-tab-bottom-border)"
      />

      <div className={`shrink-0 h-[1.82rem] box-border grid ${listGridClass} ${listRowLightClass} ${headerTextClass} text-[.78rem] font-700`}>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>名称</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>修改日期</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>大小</div>
        <div className={`min-w-0 px-[.72rem] py-[.32rem] border-r ${headerBorderClass} overflow-hidden text-ellipsis whitespace-nowrap`}>种类</div>
      </div>

      <HairlineHorizontal
        className="shrink-0 w-full"
        color="var(--seeker-list-header-bottom-border)"
      />

      <div
        className="min-h-0 flex-1 overflow-hidden px-[.62rem] py-[.2rem]"
        onMouseDown={handleListMouseDown}
        ref={listRef}
      >
        {items.map((item, index) => {
          const selected = selection.includes(item.path)
          const previousSelected = index > 0 && selection.includes(items[index - 1].path)
          const nextSelected = index < items.length - 1 && selection.includes(items[index + 1].path)
          const selectedRadiusClass = previousSelected && nextSelected
            ? 'rounded-none'
            : previousSelected
              ? 'rounded-t-none rounded-b-[.34rem]'
              : nextSelected
                ? 'rounded-t-[.34rem] rounded-b-none'
                : rowRadiusClass
          const itemRadiusClass = selected ? selectedRadiusClass : rowRadiusClass
          const rowBgClass = selected
            ? selectedRowBgClass
            : getListRowStripeClass(index)
          const fileNameClass = selected && focused ? 'text-white' : fileNameTextClass
          const itemMetadataTextClass = selected && focused ? 'text-white/85' : metadataTextClass

          return (
            <div
              className={`${rowBaseClass} ${itemRadiusClass} relative w-full text-left cursor-default select-none ${rowBgClass}`}
              data-seeker-file-row-index={index}
              key={item.path}
              onDoubleClick={() => handleRowDoubleClick(item)}
            >
              {selected && nextSelected ? (
                <span className="absolute left-[2.62rem] right-[.5rem] bottom-[-.5px] z-10 pointer-events-none block h-px leading-none">
                  <HairlineHorizontal
                    className="block w-full"
                    color={selectedJoinDividerColor}
                  />
                </span>
              ) : null}
              <span className="min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-[.9rem] gap-[.28rem]">
                <span className="w-[.48rem] h-[.72rem] shrink-0" />
                <FileIconBadge icon={item.icon} selected={selected} />
                <span
                  className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${fileNameClass}`}
                  data-seeker-file-name
                  onClick={(event) => handleNameSelect(item.path, event)}
                >
                  {item.name}
                </span>
              </span>
              <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-[.9rem] ${itemMetadataTextClass}`}>{item.modified}</span>
              <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-[.9rem] ${itemMetadataTextClass}`}>{item.size}</span>
              <span className={`min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-[.9rem] ${itemMetadataTextClass}`}>{item.kind}</span>
            </div>
          )
        })}
        {emptyRows.map((row, index) => (
          <div
            className={`${rowBaseClass} ${rowRadiusClass} ${getListRowStripeClass(items.length + index)}`}
            key={row}
          />
        ))}
      </div>
    </section>
  )
}

export default List
