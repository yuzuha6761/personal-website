import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import folderIcon from '~assets/common/folder.svg'
import { AppIcon } from '~/components/icons/AppIcon'
import ContextualMenu, { type ContextualMenuSelectEvent } from '~/components/ContextualMenu'
import { Scrollbar } from '~/components/ui-kit'
import { useWindowFocus } from '~/components/Window/FocusContext'
import useFsStore from '~/fs'
import { joinPath } from '~/fs/paths'
import type { FsDirectoryEntry, FsFileIcon, FsNode } from '~types'
import useGlobalStore from '~/stores/global'
import { Z_INDEX } from '~/constants/zIndex'
import {
  getSeekerListBlankContextMenuItems,
  getSeekerListItemContextMenuItems,
  getViewModeFromMenuItemId,
  getDirectorySortSetting,
  isSeekerListSortOption,
  type SeekerListContextMenuKind,
  type SeekerListContextSelectionStyle,
  type SeekerListHeaderColumn,
} from '~/components/applications/Seeker/listContextMenu'
import {
  applyColumnDragVisuals,
  clearColumnDragVisuals,
  measureColumnDragFrameLayout,
  type ColumnDragVisualState,
} from './columnDragVisual'
import {
  buildSeekerListGridTemplateColumns,
  clampListColumnDragDeltaX,
  createEmptySeekerListColumnWidths,
  getListColumnDragTargetIndex,
  getListColumnOrderSlotLeft,
  getNameJoinDividerLeft,
  getSeekerListColumnById,
  isSeekerListColumnDraggable,
  measureListColumnSlotWidthsByColumn,
  normalizeSeekerListColumnOrder,
  type SeekerListColumnId,
  type SeekerListColumnWidths,
} from '~/components/applications/Seeker/listColumnLayout'
import { recordPathOpened } from './pathLastOpened'
import { sortItems } from './sortItems'
import { isSeekerVirtualPath, listSeekerDirectory } from '~/components/applications/Seeker/virtualFolders'
import { resolveSeekerNewWindowPath } from '~/components/applications/Seeker/newWindowPath'
import useSeekerGlobalStore from '~/components/applications/Seeker/store'
import { seekerIcons } from '~/components/applications/Seeker/icons'
import { moveTabToNewWindow } from '../store'
import { useMainWindow } from '../useMainWindow'
import TabBar from './TabBar'
import { shouldShowTabBar, type SidebarIcon } from '../types'

function isSidebarIcon(value: string): value is SidebarIcon {
  return value in seekerIcons
}

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

const listContentInsetClass = 'px-[.62rem]'
const listNameLeadingSpacerClass = 'w-[.48rem] h-[.72rem] shrink-0'
const listNameIconSlotClass = 'flex-[0_0_1.14rem] shrink-0'
const COLUMN_DRAG_THRESHOLD_PX = 10
const COLUMN_DRAG_BODY_CLASS = 'seeker-list-column-dragging'
const COLUMN_SETTLE_MS = 200

interface ColumnDragState extends ColumnDragVisualState {
  currentIndex: number
  didDrag: boolean
  startX: number
}

function SortColumnHeader({
  active,
  ascending,
  alignRight,
  column,
  fileNameTextClass,
  isDraggable,
  isFirst,
  isLast,
  metadataTextClass,
  onColumnMouseDown,
  onColumnMouseUp,
  showLeftDivider,
  visualIndex,
}: {
  active: boolean
  ascending: boolean
  alignRight?: boolean
  column: SeekerListHeaderColumn
  fileNameTextClass: string
  isDraggable: boolean
  isFirst: boolean
  isLast: boolean
  metadataTextClass: string
  onColumnMouseDown: (columnId: SeekerListColumnId, visualIndex: number, event: ReactMouseEvent) => void
  onColumnMouseUp: (column: SeekerListHeaderColumn) => void
  showLeftDivider: boolean
  visualIndex: number
}) {
  const labelTextClass = active ? fileNameTextClass : metadataTextClass
  const isNameColumn = column.id === 'name'

  const wrapperClass = [
    'relative flex min-w-0 h-full self-stretch',
    isFirst && isLast ? '-mx-[.62rem] w-[calc(100%+1.24rem)]' : '',
    isFirst && !isLast ? '-ml-[.62rem] w-[calc(100%+.62rem)]' : '',
    !isFirst && isLast ? '-mr-[.62rem] w-[calc(100%+.62rem)]' : '',
  ].filter(Boolean).join(' ')

  const buttonPaddingClass = isFirst && isLast
    ? 'px-[1.34rem]'
    : isFirst
      ? 'pl-[1.34rem] pr-[.72rem]'
      : isLast
        ? 'pl-[.72rem] pr-[1.34rem]'
        : 'px-[.72rem]'

  const contentAlignClass = alignRight ? 'justify-end text-right' : ''

  return (
    <div
      className={wrapperClass}
      data-seeker-list-column-slot={column.id}
    >
      <button
        className={`flex h-full w-full min-w-0 items-center ${buttonPaddingClass} overflow-hidden text-ellipsis whitespace-nowrap border-0 bg-transparent [font:inherit] cursor-default active:bg-[var(--seeker-list-header-hover-bg)] ${alignRight ? 'text-right' : 'text-left'}`}
        onMouseDown={(event) => {
          if (!isDraggable) return
          onColumnMouseDown(column.id, visualIndex, event)
        }}
        onMouseUp={() => onColumnMouseUp(column)}
        type="button"
      >
        <span className={`flex w-full min-w-0 items-center gap-[.28rem] ${contentAlignClass}`}>
          {isNameColumn ? (
            <>
              <span aria-hidden className={listNameLeadingSpacerClass} />
              <span aria-hidden className={listNameIconSlotClass} />
            </>
          ) : null}
          <span className={`min-w-0 flex-1 overflow-hidden text-ellipsis ${labelTextClass} ${active ? 'font-700' : 'font-400'}`}>{column.label}</span>
          {active ? (
            <AppIcon
              className={`w-[.93rem] h-[.93rem] shrink-0 ${metadataTextClass}`}
              icon={ascending ? seekerIcons.chevronUp : seekerIcons.chevronDown}
              strokeWidth={2.75}
            />
          ) : null}
        </span>
      </button>
      {showLeftDivider ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-[.22rem] bottom-[.22rem] z-10 w-px bg-[var(--seeker-list-header-divider)]"
          data-seeker-list-header-divider=""
        />
      ) : null}
    </div>
  )
}

const ROW_HEIGHT_REM = 1.42
const rowRadiusClass = 'rounded-[.34rem]'
const fileIconClass = 'w-4 h-4'
const listRowLightClass = 'bg-[var(--seeker-list-row-light)]'
const listRowDarkClass = 'bg-[var(--seeker-list-row-dark)]'
const contextSelectionOutlineStyle: CSSProperties = {
  boxShadow: 'inset 0 0 0 2px var(--system-color-solid, #ef5ba1)',
}

interface ContextMenuState {
  kind: SeekerListContextMenuKind
  open: boolean
  position: { x: number; y: number }
  selectionStyle: SeekerListContextSelectionStyle | null
  targetPath: string | null
}

const closedContextMenuState: ContextMenuState = {
  open: false,
  kind: 'blank',
  targetPath: null,
  selectionStyle: null,
  position: { x: 0, y: 0 },
}

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
  return entry.navigable
}

function isListBlankAreaTarget(target: EventTarget | null) {
  return !(target instanceof Element && target.closest('[data-seeker-file-row-index]'))
}

function createUniqueFolderName(parentPath: string, nodes: Record<string, FsNode>) {
  const baseName = '未命名文件夹'
  let name = baseName
  let counter = 2

  while (nodes[joinPath(parentPath, name)]) {
    name = `${baseName} ${counter}`
    counter += 1
  }

  return name
}

interface SelectionInsetFrameRect {
  height: number
  left: number
  top: number
  width: number
}

function getContiguousSelectedIndexGroups(items: FsDirectoryEntry[], selection: string[]) {
  const groups: number[][] = []
  let currentGroup: number[] = []

  items.forEach((item, index) => {
    if (selection.includes(item.path)) {
      currentGroup.push(index)
      return
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup)
      currentGroup = []
    }
  })

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

function getSelectionInsetFrameRects(
  listElement: HTMLDivElement,
  items: FsDirectoryEntry[],
  selection: string[],
): SelectionInsetFrameRect[] {
  const listRect = listElement.getBoundingClientRect()

  return getContiguousSelectedIndexGroups(items, selection).flatMap((group) => {
    const firstIndex = group[0]
    const lastIndex = group.at(-1)!
    const firstRow = listElement.querySelector<HTMLElement>(`[data-seeker-file-row-index="${firstIndex}"]`)
    const lastRow = listElement.querySelector<HTMLElement>(`[data-seeker-file-row-index="${lastIndex}"]`)

    if (!firstRow || !lastRow) return []

    const firstRect = firstRow.getBoundingClientRect()
    const lastRect = lastRow.getBoundingClientRect()

    return [{
      top: firstRect.top - listRect.top,
      left: firstRect.left - listRect.left,
      width: firstRect.width,
      height: lastRect.bottom - firstRect.top,
    }]
  })
}

function FileIconBadge({
  deviceIcon,
  icon,
  isAlias,
  selected,
}: {
  deviceIcon?: string
  icon: FsFileIcon
  isAlias?: boolean
  selected: boolean
}) {
  const aliasBadgeClass = selected ? 'text-white/90' : 'text-#737373'

  const aliasBadge = isAlias ? (
    <AppIcon
      className={`absolute left-[-.02rem] bottom-[-.02rem] w-[.52rem] h-[.52rem] ${aliasBadgeClass}`}
      icon={seekerIcons.aliasBadge}
      strokeWidth={2.75}
    />
  ) : null

  if (deviceIcon && isSidebarIcon(deviceIcon)) {
    const deviceIconClass = selected ? 'text-white/90' : 'text-#737373'

    return (
      <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
        <AppIcon
          className={`${fileIconClass} ${deviceIconClass}`}
          icon={seekerIcons[deviceIcon]}
          strokeWidth={1.75}
        />
        {aliasBadge}
      </span>
    )
  }

  if (icon === 'folder') {
    return (
      <span className="relative flex-[0_0_1.14rem] h-[1.14rem] flex items-center justify-center">
        <img alt="" className={fileIconClass} src={folderIcon} />
        {aliasBadge}
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
        {aliasBadge}
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
      {aliasBadge}
    </span>
  )
}

function renderListColumnCell({
  columnId,
  fileNameClass,
  handleNameSelect,
  hiddenContentClass,
  item,
  itemMetadataTextClass,
  useFilledSelection,
}: {
  columnId: SeekerListColumnId
  fileNameClass: string
  handleNameSelect: (path: string, event: ReactMouseEvent) => void
  hiddenContentClass: string
  item: FsDirectoryEntry
  itemMetadataTextClass: string
  useFilledSelection: boolean
}) {
  const metadataCellClass = `min-w-0 px-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-[.9rem] ${itemMetadataTextClass} ${hiddenContentClass}`

  switch (columnId) {
    case 'name':
      return (
        <span className={`min-w-0 pl-[.72rem] pr-[.72rem] overflow-hidden text-ellipsis whitespace-nowrap flex items-center text-[.9rem] gap-[.28rem] ${hiddenContentClass}`}>
          <span aria-hidden className={listNameLeadingSpacerClass} />
          <FileIconBadge deviceIcon={item.deviceIcon} icon={item.icon} isAlias={item.isAlias} selected={useFilledSelection} />
          <span
            className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${fileNameClass}`}
            data-seeker-file-name
            onClick={(event) => handleNameSelect(item.path, event)}
          >
            {item.name}
          </span>
        </span>
      )
    case 'modified':
      return <span className={metadataCellClass}>{item.modified}</span>
    case 'size':
      return <span className={`${metadataCellClass} justify-end text-right`}>{item.size}</span>
    case 'kind':
      return <span className={metadataCellClass}>{item.kind}</span>
    default:
      return null
  }
}

function List() {
  const listRef = useRef<HTMLDivElement>(null)
  const headerTrackRef = useRef<HTMLDivElement>(null)
  const selectionDragRef = useRef<SelectionDragState | null>(null)
  const columnDragRef = useRef<ColumnDragState | null>(null)
  const columnSettleRef = useRef<ColumnDragVisualState | null>(null)
  const columnDragVisualRafRef = useRef<number | null>(null)
  const columnDragVisualPendingRef = useRef<{
    options: { animatingSlots: boolean; settlingDraggedColumn: boolean }
    state: ColumnDragVisualState
  } | null>(null)
  const slotWidthsRef = useRef<SeekerListColumnWidths>(createEmptySeekerListColumnWidths())
  const settleTimerRef = useRef<number | null>(null)
  const sortSuppressedRef = useRef(false)
  const focused = useWindowFocus()?.focused ?? true
  const {
    windowId,
    windowState,
    navigateTo,
    setSelection,
    setActiveTab,
    addTab,
    closeTab,
    closeOtherTabs,
    moveTabs,
    setViewMode,
  } = useMainWindow()
  const directorySortBy = useSeekerGlobalStore((state) => state.directorySortBy)
  const setDirectorySortBy = useSeekerGlobalStore((state) => state.setDirectorySortBy)
  const listColumnOrder = useSeekerGlobalStore((state) => state.listColumnOrder)
  const setListColumnOrder = useSeekerGlobalStore((state) => state.setListColumnOrder)
  const createFolder = useFsStore((state) => state.createFolder)
  const removeNode = useFsStore((state) => state.removeNode)
  const newWindowPathOption = useSeekerGlobalStore((state) => state.newWindowPathOption)
  const showHiddenFiles = useGlobalStore((state) => state.showHiddenFiles)
  const defaultTabPath = resolveSeekerNewWindowPath(newWindowPathOption)
  const activeTab = windowState?.tabs.find((tab) => tab.id === windowState.activeTabId)
  const currentPath = activeTab?.path ?? defaultTabPath
  const tabs = windowState?.tabs ?? []
  const activeTabId = windowState?.activeTabId
  const showTabBar = shouldShowTabBar(tabs.length)
  const nodes = useFsStore((state) => state.nodes)
  const rawItems = useMemo(
    () => listSeekerDirectory(currentPath, nodes, showHiddenFiles),
    [currentPath, nodes, showHiddenFiles],
  )
  const sortSetting = useMemo(
    () => getDirectorySortSetting(directorySortBy, currentPath),
    [directorySortBy, currentPath],
  )
  const sortBy = sortSetting.sortBy
  const sortAscending = sortSetting.ascending
  const items = useMemo(
    () => sortItems(rawItems, nodes, sortBy, sortAscending),
    [rawItems, nodes, sortBy, sortAscending],
  )
  const itemPaths = useMemo(() => items.map((item) => item.path), [items])
  const selection = windowState?.selection ?? []
  const viewMode = windowState?.viewMode ?? 'list'
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(closedContextMenuState)
  const [selectionInsetFrames, setSelectionInsetFrames] = useState<SelectionInsetFrameRect[]>([])
  const listContextMenuId = useId()
  const [fillerRowCount, setFillerRowCount] = useState(0)
  const emptyRows = useMemo(
    () => Array.from({ length: fillerRowCount }, (_, index) => `empty-${index}`),
    [fillerRowCount],
  )

  const contextMenuTargetItem = useMemo(
    () => items.find((item) => item.path === contextMenu.targetPath),
    [contextMenu.targetPath, items],
  )

  const contextMenuSelectionItems = useMemo(() => {
    if (contextMenu.kind !== 'item') return []

    if (contextMenu.selectionStyle === 'outline' && contextMenu.targetPath) {
      const target = items.find((item) => item.path === contextMenu.targetPath)
      return target ? [target] : []
    }

    return items.filter((item) => selection.includes(item.path))
  }, [contextMenu.kind, contextMenu.selectionStyle, contextMenu.targetPath, items, selection])

  const contextMenuItems = useMemo(() => {
    if (contextMenu.kind === 'item' && contextMenuTargetItem) {
      const folderCount = contextMenuSelectionItems.filter((item) => item.navigable).length

      return getSeekerListItemContextMenuItems({
        folderCount,
        primaryName: contextMenuTargetItem.name,
        selectionCount: contextMenuSelectionItems.length,
      })
    }

    return getSeekerListBlankContextMenuItems({
      hasSelection: selection.length > 0,
      sortBy,
      viewMode,
    })
  }, [contextMenu.kind, contextMenuSelectionItems, contextMenuTargetItem, selection.length, sortBy, viewMode])

  const closeContextMenu = useCallback(() => {
    setContextMenu(closedContextMenuState)
    setSelectionInsetFrames([])
  }, [])

  const handleHeaderSort = useCallback((column: SeekerListHeaderColumn) => {
    closeContextMenu()
    const current = getDirectorySortSetting(directorySortBy, currentPath)

    if (current.sortBy === column.sortBy) {
      setDirectorySortBy(currentPath, column.sortBy, !current.ascending)
      return
    }

    setDirectorySortBy(currentPath, column.sortBy, column.ascending)
  }, [closeContextMenu, currentPath, directorySortBy, setDirectorySortBy])

  const committedColumnOrder = useMemo(
    () => normalizeSeekerListColumnOrder(listColumnOrder),
    [listColumnOrder],
  )
  const listGridStyle = useMemo(
    () => ({ gridTemplateColumns: buildSeekerListGridTemplateColumns(committedColumnOrder) }),
    [committedColumnOrder],
  )
  const rowBaseClass = 'h-[1.42rem] box-border grid'
  const nameJoinDividerLeft = useMemo(
    () => getNameJoinDividerLeft(committedColumnOrder, slotWidthsRef.current),
    [committedColumnOrder],
  )

  const scheduleColumnDragVisuals = useCallback((
    state: ColumnDragVisualState,
    options: { animatingSlots: boolean; settlingDraggedColumn: boolean },
  ) => {
    columnDragVisualPendingRef.current = { state, options }
    if (columnDragVisualRafRef.current !== null) return

    columnDragVisualRafRef.current = requestAnimationFrame(() => {
      columnDragVisualRafRef.current = null
      const pending = columnDragVisualPendingRef.current
      if (!pending) return

      applyColumnDragVisuals(
        headerTrackRef.current,
        listRef.current,
        pending.state,
        pending.options,
      )
    })
  }, [])

  const measureSlotWidths = useCallback(() => {
    const widths = measureListColumnSlotWidthsByColumn(headerTrackRef.current)
    slotWidthsRef.current = widths
    return widths
  }, [])

  useLayoutEffect(() => {
    if (!columnDragRef.current && !columnSettleRef.current) {
      measureSlotWidths()
    }
  }, [committedColumnOrder, measureSlotWidths])

  useLayoutEffect(() => () => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
    }
    if (columnDragVisualRafRef.current !== null) {
      cancelAnimationFrame(columnDragVisualRafRef.current)
    }
    document.body.classList.remove(COLUMN_DRAG_BODY_CLASS)
  }, [])

  const beginColumnSettle = useCallback((state: ColumnDragState) => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
    }

    const settleState: ColumnDragVisualState = {
      columnId: state.columnId,
      committedOrder: state.committedOrder,
      previewOrder: state.previewOrder,
      slotWidthsByColumn: state.slotWidthsByColumn,
      frameBaseLeft: state.frameBaseLeft,
      frameWidth: state.frameWidth,
      deltaX: state.deltaX,
      dragging: false,
    }
    columnDragRef.current = null
    columnSettleRef.current = settleState

    applyColumnDragVisuals(
      headerTrackRef.current,
      listRef.current,
      settleState,
      { animatingSlots: true, settlingDraggedColumn: false },
    )

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const current = columnSettleRef.current
        if (!current) return

        columnSettleRef.current = { ...current, deltaX: 0 }
        scheduleColumnDragVisuals(columnSettleRef.current, {
          animatingSlots: true,
          settlingDraggedColumn: true,
        })
      })
    })

    settleTimerRef.current = window.setTimeout(() => {
      clearColumnDragVisuals(headerTrackRef.current, listRef.current)
      columnSettleRef.current = null
      setListColumnOrder(state.previewOrder)
      settleTimerRef.current = null
    }, COLUMN_SETTLE_MS)
  }, [scheduleColumnDragVisuals, setListColumnOrder])

  const handleColumnMouseDown = useCallback((
    columnId: SeekerListColumnId,
    visualIndex: number,
    event: ReactMouseEvent,
  ) => {
    if (event.button !== 0 || columnSettleRef.current || !isSeekerListColumnDraggable(columnId)) return

    const slotWidthsByColumn = measureListColumnSlotWidthsByColumn(headerTrackRef.current)
    const { frameBaseLeft, frameWidth } = measureColumnDragFrameLayout(
      headerTrackRef.current,
      listRef.current,
      columnId,
    )

    columnDragRef.current = {
      columnId,
      committedOrder: [...committedColumnOrder],
      slotWidthsByColumn,
      frameBaseLeft,
      frameWidth,
      startX: event.clientX,
      currentIndex: visualIndex,
      deltaX: 0,
      dragging: false,
      didDrag: false,
      previewOrder: [...committedColumnOrder],
    }

    const handleMove = (moveEvent: MouseEvent) => {
      let dragState = columnDragRef.current
      const track = headerTrackRef.current
      if (!dragState || !track) return

      const { slotWidthsByColumn: frozenWidthsByColumn, previewOrder } = dragState
      const trackWidth = track.offsetWidth
      let deltaX = moveEvent.clientX - dragState.startX
      const dragging = dragState.dragging || Math.abs(deltaX) >= COLUMN_DRAG_THRESHOLD_PX

      if (dragging) {
        if (!dragState.dragging) {
          document.body.classList.add(COLUMN_DRAG_BODY_CLASS)
          document.body.style.userSelect = 'none'
        }

        const candidateIndex = getListColumnDragTargetIndex(
          deltaX,
          previewOrder,
          dragState.currentIndex,
          frozenWidthsByColumn,
        )

        if (candidateIndex !== dragState.currentIndex) {
          const nextOrder: SeekerListColumnId[] = [...previewOrder]
          nextOrder.splice(dragState.currentIndex, 1)
          nextOrder.splice(candidateIndex, 0, dragState.columnId)

          const oldLeft = getListColumnOrderSlotLeft(
            previewOrder,
            dragState.currentIndex,
            frozenWidthsByColumn,
          )
          const newLeft = getListColumnOrderSlotLeft(
            nextOrder,
            candidateIndex,
            frozenWidthsByColumn,
          )
          const startX: number = dragState.startX + (newLeft - oldLeft)
          deltaX = clampListColumnDragDeltaX(
            moveEvent.clientX - startX,
            nextOrder,
            candidateIndex,
            dragState.columnId,
            frozenWidthsByColumn,
            trackWidth,
          )

          dragState = {
            ...dragState,
            previewOrder: nextOrder,
            currentIndex: candidateIndex,
            startX,
            deltaX,
            dragging: true,
            didDrag: true,
          }
        } else {
          deltaX = clampListColumnDragDeltaX(
            deltaX,
            previewOrder,
            dragState.currentIndex,
            dragState.columnId,
            frozenWidthsByColumn,
            trackWidth,
          )
        }
      }

      dragState = {
        ...dragState,
        deltaX,
        dragging,
        didDrag: dragState.didDrag || dragging,
      }
      columnDragRef.current = dragState

      if (dragging) {
        scheduleColumnDragVisuals(dragState, { animatingSlots: true, settlingDraggedColumn: false })
      }
    }

    const handleUp = () => {
      if (columnDragVisualRafRef.current !== null) {
        cancelAnimationFrame(columnDragVisualRafRef.current)
        columnDragVisualRafRef.current = null
      }

      const state = columnDragRef.current
      if (state?.dragging) {
        applyColumnDragVisuals(
          headerTrackRef.current,
          listRef.current,
          state,
          { animatingSlots: true, settlingDraggedColumn: false },
        )
      }
      columnDragVisualPendingRef.current = null

      document.body.classList.remove(COLUMN_DRAG_BODY_CLASS)
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)

      if (state?.dragging) {
        sortSuppressedRef.current = true
        beginColumnSettle(state)
      } else {
        clearColumnDragVisuals(headerTrackRef.current, listRef.current)
        columnDragRef.current = null
      }
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [beginColumnSettle, committedColumnOrder, scheduleColumnDragVisuals])

  const handleColumnMouseUp = useCallback((column: SeekerListHeaderColumn) => {
    if (sortSuppressedRef.current) {
      sortSuppressedRef.current = false
      return
    }

    const state = columnDragRef.current
    if (state?.didDrag || state?.dragging) return

    handleHeaderSort(column)
  }, [handleHeaderSort])

  const updateSelectionInsetFrames = useCallback(() => {
    const list = listRef.current

    if (!contextMenu.open || contextMenu.selectionStyle !== 'filled-inset' || !list) {
      setSelectionInsetFrames([])
      return
    }

    setSelectionInsetFrames(getSelectionInsetFrameRects(list, items, selection))
  }, [contextMenu.open, contextMenu.selectionStyle, items, selection])

  const headerTextClass = 'text-[var(--seeker-list-metadata-text)]'
  const fileNameTextClass = 'text-[var(--seeker-list-name-text)]'
  const metadataTextClass = 'text-[var(--seeker-list-metadata-text)]'
  const selectedRowBgClass = focused
    ? 'bg-[var(--system-color-solid,#ef5ba1)]'
    : 'bg-[var(--seeker-list-selected-unfocused)]'
  const selectedJoinDividerColor = focused
    ? 'color-mix(in srgb, var(--system-color-solid,#ef5ba1) 85%, white)'
    : '#d1d1d2'

  useLayoutEffect(() => {
    updateSelectionInsetFrames()
  }, [updateSelectionInsetFrames])

  useEffect(() => {
    if (!contextMenu.open || contextMenu.selectionStyle !== 'filled-inset') return

    const list = listRef.current
    if (!list) return

    const observer = new ResizeObserver(updateSelectionInsetFrames)
    observer.observe(list)
    window.addEventListener('scroll', updateSelectionInsetFrames, true)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateSelectionInsetFrames, true)
    }
  }, [contextMenu.open, contextMenu.selectionStyle, updateSelectionInsetFrames])

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
      const availableHeight = Math.max(0, list.clientHeight - paddingY)
      const totalRows = Math.floor(availableHeight / rowHeight)
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

    const wasContextMenuOpen = contextMenu.open
    closeContextMenu()

    const rowIndex = getRowIndexFromPoint(event.clientX, event.clientY)
    if (wasContextMenuOpen && rowIndex === null) {
      return
    }

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
      const dragRowIndex = getRowIndexFromPoint(moveEvent.clientX, moveEvent.clientY)
      if (dragRowIndex === null || dragRowIndex === dragState.currentIndex) return
      applyDragSelection(dragState, dragRowIndex)
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

    if (rowIndex !== null) {
      applyDragSelection(dragState, rowIndex)
      return
    }

    if (!dragState.additive) {
      setSelection([])
    }
  }

  const handleListContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isListBlankAreaTarget(event.target)) return

    event.preventDefault()
    setContextMenu({
      open: true,
      kind: 'blank',
      targetPath: null,
      selectionStyle: null,
      position: { x: event.clientX, y: event.clientY },
    })
  }

  const handleRowContextMenu = (event: ReactMouseEvent<HTMLDivElement>, item: FsDirectoryEntry) => {
    event.preventDefault()
    event.stopPropagation()

    const wasSelected = selection.includes(item.path)

    setContextMenu({
      open: true,
      kind: 'item',
      targetPath: item.path,
      selectionStyle: wasSelected ? 'filled-inset' : 'outline',
      position: { x: event.clientX, y: event.clientY },
    })
  }

  const handleContextMenuSelect = useCallback((event: ContextualMenuSelectEvent) => {
    const { item } = event

    if (isSeekerListSortOption(item.id)) {
      setDirectorySortBy(currentPath, item.id)
      return
    }

    const nextViewMode = getViewModeFromMenuItemId(item.id)
    if (nextViewMode) {
      setViewMode(nextViewMode)
      return
    }

    if (contextMenu.kind === 'blank') {
      if (item.id === 'new-folder') {
        if (isSeekerVirtualPath(currentPath)) return

        const folderName = createUniqueFolderName(currentPath, nodes)
        const folder = createFolder(currentPath, folderName)
        if (folder) {
          setSelection([folder.path])
        }
      }
      return
    }

    const actionPaths = contextMenu.selectionStyle === 'outline' && contextMenu.targetPath
      ? [contextMenu.targetPath]
      : selection

    if (item.id === 'open') {
      const target = items.find((entry) => actionPaths.includes(entry.path) && entry.navigable)
      if (target) navigateTo(target.resolvePath)
      return
    }

    if (item.id === 'open-new-tab') {
      for (const entry of items) {
        if (actionPaths.includes(entry.path) && entry.navigable) {
          addTab(entry.resolvePath)
        }
      }
      return
    }

    if (item.id === 'new-folder-selection') {
      if (isSeekerVirtualPath(currentPath)) return

      const folderName = createUniqueFolderName(currentPath, nodes)
      const folder = createFolder(currentPath, folderName)
      if (folder) {
        setSelection([folder.path])
      }
      return
    }

    if (item.id === 'move-to-trash') {
      for (const path of actionPaths) {
        removeNode(path)
      }
      setSelection(selection.filter((path) => !actionPaths.includes(path)))
    }
  }, [addTab, contextMenu.kind, contextMenu.selectionStyle, contextMenu.targetPath, createFolder, currentPath, items, navigateTo, nodes, removeNode, selection, setDirectorySortBy, setSelection, setViewMode])

  const handleOpen = (entry: FsDirectoryEntry) => {
    if (!isFolderEntry(entry)) return
    recordPathOpened(entry.resolvePath)
    navigateTo(entry.resolvePath)
  }

  const handleRowDoubleClick = (entry: FsDirectoryEntry) => {
    handleOpen(entry)
  }

  const handleAddTab = () => {
    addTab(defaultTabPath)
  }

  const handleCloseTab = (tabId: string) => {
    closeTab(tabId)
  }

  const handleCloseOtherTabs = useCallback((tabId: string) => {
    closeOtherTabs(tabId)
  }, [closeOtherTabs])

  const handleMoveTabToNewWindow = useCallback((tabId: string) => {
    if (!windowId) return
    moveTabToNewWindow(windowId, tabId)
  }, [windowId])

  return (
    <section className={`min-h-0 flex-1 ${listRowLightClass} flex flex-col`}>
      {showTabBar && activeTabId ? (
        <TabBar
          activeTabId={activeTabId}
          focused={focused}
          onAddTab={handleAddTab}
          onCloseOtherTabs={handleCloseOtherTabs}
          onCloseTab={handleCloseTab}
          onMoveTabToNewWindow={handleMoveTabToNewWindow}
          onMoveTabs={moveTabs}
          onSelectTab={setActiveTab}
          tabs={tabs}
        />
      ) : null}

      <HairlineHorizontal
        className="shrink-0 w-full"
        color="var(--seeker-tab-bottom-border)"
      />

      <div
        className={`shrink-0 h-[1.82rem] box-border grid overflow-visible ${listContentInsetClass} ${listRowLightClass} ${headerTextClass} text-[.78rem]`}
        ref={headerTrackRef}
        style={listGridStyle}
      >
        {committedColumnOrder.map((columnId, visualIndex) => {
          const column = getSeekerListColumnById(columnId)
          if (!column) return null

          return (
            <SortColumnHeader
              active={sortBy === column.sortBy}
              alignRight={columnId === 'size'}
              ascending={sortAscending}
              column={column}
              fileNameTextClass={fileNameTextClass}
              isDraggable={isSeekerListColumnDraggable(columnId)}
              isFirst={visualIndex === 0}
              isLast={visualIndex === committedColumnOrder.length - 1}
              key={columnId}
              metadataTextClass={metadataTextClass}
              onColumnMouseDown={handleColumnMouseDown}
              onColumnMouseUp={handleColumnMouseUp}
              showLeftDivider={visualIndex > 0}
              visualIndex={visualIndex}
            />
          )
        })}
      </div>

      <HairlineHorizontal
        className="shrink-0 w-full"
        color="var(--seeker-list-header-bottom-border)"
      />

      <Scrollbar
        className="min-h-0 flex-1"
        contentClassName="relative px-[.62rem] py-[.2rem]"
        contentRef={listRef}
        viewportProps={{
          onMouseDown: handleListMouseDown,
          onContextMenu: handleListContextMenu,
        }}
      >
        {selectionInsetFrames.map((frame, index) => (
          <div
            aria-hidden
            className="pointer-events-none absolute z-20 rounded-[.34rem]"
            key={`selection-inset-frame-${index}`}
            style={{
              top: frame.top + 1,
              left: frame.left + 1,
              width: frame.width - 2,
              height: frame.height - 2,
              boxShadow: 'inset 0 0 0 2px #ffffff',
            }}
          />
        ))}
        {items.map((item, index) => {
          const isSelected = selection.includes(item.path)
          const isOutlineContextSelection = contextMenu.open
            && contextMenu.selectionStyle === 'outline'
            && contextMenu.targetPath === item.path
          const useFilledSelection = isSelected && !isOutlineContextSelection
          const previousSelected = index > 0 && selection.includes(items[index - 1].path)
          const nextSelected = index < items.length - 1 && selection.includes(items[index + 1].path)
          const hideJoinDivider = contextMenu.open && contextMenu.selectionStyle === 'filled-inset'
          const selectedRadiusClass = previousSelected && nextSelected
            ? 'rounded-none'
            : previousSelected
              ? 'rounded-t-none rounded-b-[.34rem]'
              : nextSelected
                ? 'rounded-t-[.34rem] rounded-b-none'
                : rowRadiusClass
          const itemRadiusClass = useFilledSelection ? selectedRadiusClass : rowRadiusClass
          const rowBgClass = useFilledSelection
            ? selectedRowBgClass
            : getListRowStripeClass(index)
          const fileNameClass = useFilledSelection && focused ? 'text-white' : fileNameTextClass
          const itemMetadataTextClass = useFilledSelection && focused ? 'text-white/85' : metadataTextClass
          const hiddenContentClass = item.hidden ? 'opacity-45' : ''

          return (
            <div
              className={`${rowBaseClass} ${itemRadiusClass} relative w-full text-left cursor-default select-none ${rowBgClass}`}
              data-seeker-file-row-index={index}
              key={item.path}
              onContextMenu={(event) => handleRowContextMenu(event, item)}
              onDoubleClick={() => handleRowDoubleClick(item)}
              style={listGridStyle}
            >
              {isOutlineContextSelection ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-30 rounded-[.34rem]"
                  style={contextSelectionOutlineStyle}
                />
              ) : null}
              {useFilledSelection && nextSelected && !hideJoinDivider ? (
                <span
                  className="absolute right-[.5rem] bottom-[-.5px] z-10 pointer-events-none block h-px leading-none"
                  style={{ left: nameJoinDividerLeft }}
                >
                  <HairlineHorizontal
                    className="block w-full"
                    color={selectedJoinDividerColor}
                  />
                </span>
              ) : null}
              {committedColumnOrder.map((columnId) => (
                <div
                  className="min-w-0"
                  data-seeker-list-column-slot={columnId}
                  key={columnId}
                >
                  {renderListColumnCell({
                    columnId,
                    fileNameClass,
                    handleNameSelect,
                    hiddenContentClass,
                    item,
                    itemMetadataTextClass,
                    useFilledSelection,
                  })}
                </div>
              ))}
            </div>
          )
        })}
        {emptyRows.map((row, index) => (
          <div
            className={`${rowBaseClass} ${rowRadiusClass} ${getListRowStripeClass(items.length + index)}`}
            key={row}
            style={listGridStyle}
          />
        ))}
      </Scrollbar>

      <ContextualMenu
        id={listContextMenuId}
        items={contextMenuItems}
        open={contextMenu.open}
        position={contextMenu.position}
        zIndex={Z_INDEX.IN_APP_OVERLAY}
        onClose={closeContextMenu}
        onSelect={handleContextMenuSelect}
      />
    </section>
  )
}

export default List
