import type { ContextualMenuItem } from '~/components/ContextualMenu'
import type { ViewMode } from './Main/types'

export type SeekerListContextMenuKind = 'blank' | 'item'

export type SeekerListContextSelectionStyle = 'outline' | 'filled-inset'

export const SEEKER_TAG_COLORS = [
  '#ff6b67',
  '#ffb45b',
  '#ffd66b',
  '#7bd889',
  '#75b7ff',
  '#c48ce4',
  '#b6b6b6',
] as const

export type SeekerListSortOption =
  | 'sort-none'
  | 'sort-name'
  | 'sort-kind'
  | 'sort-date-opened'
  | 'sort-added'
  | 'sort-modified'
  | 'sort-created'
  | 'sort-size'
  | 'sort-tags'

export const DEFAULT_SEEKER_LIST_SORT: SeekerListSortOption = 'sort-name'

export interface SeekerDirectorySortSetting {
  ascending: boolean
  sortBy: SeekerListSortOption
}

export type SeekerDirectorySortByRecord = Record<string, SeekerDirectorySortSetting | SeekerListSortOption>

export interface SeekerListBlankContextMenuOptions {
  hasSelection: boolean
  sortBy: SeekerListSortOption
  viewMode: ViewMode
}

const SORT_OPTIONS: { id: SeekerListSortOption; label: string }[] = [
  { id: 'sort-none', label: '无' },
  { id: 'sort-name', label: '名称' },
  { id: 'sort-kind', label: '种类' },
  { id: 'sort-date-opened', label: '上次打开日期' },
  { id: 'sort-added', label: '添加日期' },
  { id: 'sort-modified', label: '修改日期' },
  { id: 'sort-created', label: '创建日期' },
  { id: 'sort-size', label: '大小' },
  { id: 'sort-tags', label: '标签' },
]

export interface SeekerListHeaderColumn {
  ascending: boolean
  id: 'kind' | 'modified' | 'name' | 'size'
  label: string
  sortBy: SeekerListSortOption
}

export const SEEKER_LIST_HEADER_COLUMNS: SeekerListHeaderColumn[] = [
  { id: 'name', label: '名称', sortBy: 'sort-name', ascending: true },
  { id: 'modified', label: '修改日期', sortBy: 'sort-modified', ascending: false },
  { id: 'size', label: '大小', sortBy: 'sort-size', ascending: false },
  { id: 'kind', label: '种类', sortBy: 'sort-kind', ascending: true },
]

export function isSeekerListHeaderSort(sortBy: SeekerListSortOption): boolean {
  return SEEKER_LIST_HEADER_COLUMNS.some((column) => column.sortBy === sortBy)
}

export function getDefaultSortAscending(sortBy: SeekerListSortOption): boolean {
  const headerColumn = SEEKER_LIST_HEADER_COLUMNS.find((column) => column.sortBy === sortBy)
  if (headerColumn) return headerColumn.ascending

  switch (sortBy) {
    case 'sort-name':
    case 'sort-kind':
    case 'sort-tags':
      return true
    default:
      return false
  }
}

export function normalizeDirectorySortSetting(
  value: SeekerDirectorySortSetting | SeekerListSortOption | undefined,
  fallbackSortBy: SeekerListSortOption = DEFAULT_SEEKER_LIST_SORT,
): SeekerDirectorySortSetting {
  if (!value) {
    return {
      sortBy: fallbackSortBy,
      ascending: getDefaultSortAscending(fallbackSortBy),
    }
  }

  if (typeof value === 'string') {
    return {
      sortBy: value,
      ascending: getDefaultSortAscending(value),
    }
  }

  return value
}

export function getDirectorySortSetting(
  directorySortBy: SeekerDirectorySortByRecord,
  path: string,
): SeekerDirectorySortSetting {
  return normalizeDirectorySortSetting(directorySortBy[path])
}

export function getDirectorySortBy(
  directorySortBy: SeekerDirectorySortByRecord,
  path: string,
): SeekerListSortOption {
  return getDirectorySortSetting(directorySortBy, path).sortBy
}

const VIEW_MODE_MENU_IDS: Record<ViewMode, string> = {
  icon: 'as-icons',
  list: 'as-list',
  column: 'as-columns',
  gallery: 'as-gallery',
}

export function getSeekerListBlankContextMenuItems(
  options: SeekerListBlankContextMenuOptions,
): ContextualMenuItem[] {
  const { hasSelection, sortBy, viewMode } = options

  return [
    { id: 'new-folder', label: '新建文件夹' },
    { id: 'divider-1', type: 'separator' },
    { id: 'show-intro', label: '显示简介', disabled: !hasSelection },
    { id: 'divider-2', type: 'separator' },
    {
      id: 'view',
      label: '显示',
      children: [
        { id: 'as-icons', label: '为图标', shortcut: '⌘1', checkable: true, checked: viewMode === 'icon' },
        { id: 'as-list', label: '为列表', shortcut: '⌘2', checkable: true, checked: viewMode === 'list' },
        { id: 'as-columns', label: '为分栏', shortcut: '⌘3', checkable: true, checked: viewMode === 'column' },
        { id: 'as-gallery', label: '为画廊', shortcut: '⌘4', checkable: true, checked: viewMode === 'gallery' },
      ],
    },
    { id: 'use-groups', label: '使用群组' },
    {
      id: 'sort-by',
      label: '排序方式',
      children: SORT_OPTIONS.map(({ id, label }) => ({
        id,
        label,
        checkable: true,
        checked: sortBy === id,
      })),
    },
    { id: 'show-view-options', label: '查看显示选项' },
  ]
}

export function getViewModeFromMenuItemId(itemId: string): ViewMode | undefined {
  const entry = Object.entries(VIEW_MODE_MENU_IDS).find(([, menuId]) => menuId === itemId)
  return entry ? entry[0] as ViewMode : undefined
}

export function isSeekerListSortOption(itemId: string): itemId is SeekerListSortOption {
  return SORT_OPTIONS.some((option) => option.id === itemId)
}

export interface SeekerListItemContextMenuOptions {
  folderCount: number
  primaryName: string
  selectionCount: number
}

function getItemContextMenuHeaderItems(
  selectionCount: number,
  folderCount: number,
): ContextualMenuItem[] {
  if (selectionCount <= 1) {
    return [
      { id: 'open', label: '打开', disabled: folderCount === 0 },
      {
        id: 'open-with',
        label: '打开方式',
        disabled: true,
        children: [
          { id: 'open-with-none', label: '无可用应用', disabled: true },
        ],
      },
    ]
  }

  const newFolderSelectionItem: ContextualMenuItem = {
    id: 'new-folder-selection',
    label: `用所选项目新建文件夹（${selectionCount}个项目）`,
  }

  if (folderCount === selectionCount) {
    return [
      newFolderSelectionItem,
      { id: 'open-new-tab', label: '在新标签页中打开' },
    ]
  }

  return [
    newFolderSelectionItem,
    { id: 'open', label: '打开', disabled: folderCount === 0 },
    {
      id: 'open-with',
      label: '打开方式',
      disabled: true,
      children: [
        { id: 'open-with-none', label: '无可用应用', disabled: true },
      ],
    },
  ]
}

export function getSeekerListItemContextMenuItems(
  options: SeekerListItemContextMenuOptions,
): ContextualMenuItem[] {
  const { folderCount, primaryName, selectionCount } = options
  const singleSelection = selectionCount === 1
  const singleIsFolder = singleSelection && folderCount === 1

  return [
    ...getItemContextMenuHeaderItems(selectionCount, folderCount),
    { id: 'divider-1', type: 'separator' },
    { id: 'move-to-trash', label: '移到废纸篓' },
    { id: 'divider-2', type: 'separator' },
    { id: 'show-intro', label: '显示简介' },
    { id: 'rename', label: '重新命名', disabled: !singleSelection },
    {
      id: 'compress',
      label: singleSelection ? `压缩 “${primaryName}”` : '压缩',
      disabled: !singleSelection || singleIsFolder,
    },
    { id: 'duplicate', label: '复制', shortcut: '⌘D', disabled: !singleSelection },
    { id: 'make-alias', label: '制作替身', disabled: !singleSelection },
    { id: 'quick-look', label: '快速查看', shortcut: '⌘Y', disabled: !singleSelection },
    { id: 'divider-3', type: 'separator' },
    { id: 'copy', label: '拷贝', shortcut: '⌘C' },
    { id: 'share', label: '共享...', disabled: true },
    { id: 'divider-4', type: 'separator' },
    {
      id: 'tag-colors',
      type: 'color-tags',
      colors: [...SEEKER_TAG_COLORS],
    },
    { id: 'tags', label: '标签...', disabled: true },
  ]
}
