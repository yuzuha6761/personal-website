import { SEEKER_LIST_HEADER_COLUMNS, type SeekerListHeaderColumn } from './listContextMenu'

export type SeekerListColumnId = SeekerListHeaderColumn['id']

export const DEFAULT_SEEKER_LIST_COLUMN_ORDER: SeekerListColumnId[] = SEEKER_LIST_HEADER_COLUMNS.map(
  (column) => column.id,
)

export const FIXED_SEEKER_LIST_COLUMN_IDS: SeekerListColumnId[] = ['name']

export function isSeekerListColumnDraggable(columnId: SeekerListColumnId): boolean {
  return !FIXED_SEEKER_LIST_COLUMN_IDS.includes(columnId)
}

export const SEEKER_LIST_COLUMN_TEMPLATES: Record<SeekerListColumnId, string> = {
  name: 'minmax(12rem,1.15fr)',
  modified: 'minmax(9rem,.62fr)',
  size: 'minmax(5.5rem,.32fr)',
  kind: 'minmax(9rem,.55fr)',
}

export type SeekerListColumnWidths = Record<SeekerListColumnId, number>

export function createEmptySeekerListColumnWidths(): SeekerListColumnWidths {
  return {
    name: 0,
    modified: 0,
    size: 0,
    kind: 0,
  }
}

export function buildSeekerListGridTemplateColumns(order: SeekerListColumnId[]): string {
  return order.map((id) => SEEKER_LIST_COLUMN_TEMPLATES[id]).join(' ')
}

export function normalizeSeekerListColumnOrder(
  order: SeekerListColumnId[] | undefined,
): SeekerListColumnId[] {
  if (!order?.length) return [...DEFAULT_SEEKER_LIST_COLUMN_ORDER]

  const valid = order.filter((id) => DEFAULT_SEEKER_LIST_COLUMN_ORDER.includes(id))
  const missing = DEFAULT_SEEKER_LIST_COLUMN_ORDER.filter((id) => !valid.includes(id))
  const merged = [...valid, ...missing]
  if (merged[0] === 'name') return merged

  return ['name', ...merged.filter((id) => id !== 'name')]
}

export function getSeekerListColumnById(columnId: SeekerListColumnId) {
  return SEEKER_LIST_HEADER_COLUMNS.find((column) => column.id === columnId)
}

export function measureListColumnSlotWidthsByColumn(
  track: HTMLDivElement | null,
): SeekerListColumnWidths {
  const widths = createEmptySeekerListColumnWidths()
  if (!track) return widths

  for (const columnId of DEFAULT_SEEKER_LIST_COLUMN_ORDER) {
    const element = track.querySelector<HTMLElement>(`[data-seeker-list-column-slot="${columnId}"]`)
    widths[columnId] = element?.offsetWidth ?? 0
  }

  return widths
}

/** @deprecated Use measureListColumnSlotWidthsByColumn */
export function measureListColumnSlotWidths(
  track: HTMLDivElement | null,
  order: SeekerListColumnId[],
): number[] {
  const widthsByColumn = measureListColumnSlotWidthsByColumn(track)
  return order.map((columnId) => widthsByColumn[columnId] ?? 0)
}

export function getListColumnOrderSlotLeft(
  order: SeekerListColumnId[],
  slotIndex: number,
  widthsByColumn: SeekerListColumnWidths,
): number {
  let left = 0

  for (let index = 0; index < slotIndex; index += 1) {
    const columnId = order[index]
    if (columnId) {
      left += widthsByColumn[columnId] ?? 0
    }
  }

  return left
}

export function getListColumnOrderTrackWidth(
  order: SeekerListColumnId[],
  widthsByColumn: SeekerListColumnWidths,
): number {
  return order.reduce((total, columnId) => total + (widthsByColumn[columnId] ?? 0), 0)
}

export function getListColumnSlotOffsetX(
  columnId: SeekerListColumnId,
  committedOrder: SeekerListColumnId[],
  previewOrder: SeekerListColumnId[],
  widthsByColumn: SeekerListColumnWidths,
): number {
  const dataIndex = committedOrder.indexOf(columnId)
  const visualIndex = previewOrder.indexOf(columnId)

  if (dataIndex < 0 || visualIndex < 0) return 0

  return getListColumnOrderSlotLeft(previewOrder, visualIndex, widthsByColumn)
    - getListColumnOrderSlotLeft(committedOrder, dataIndex, widthsByColumn)
}

export function clampListColumnDragDeltaX(
  deltaX: number,
  previewOrder: SeekerListColumnId[],
  slotIndex: number,
  draggedColumnId: SeekerListColumnId,
  widthsByColumn: SeekerListColumnWidths,
  trackWidth: number,
): number {
  if (slotIndex < 0) return 0

  const columnLeft = getListColumnOrderSlotLeft(previewOrder, slotIndex, widthsByColumn)
  const columnWidth = widthsByColumn[draggedColumnId] ?? 0
  const minDeltaX = -columnLeft
  const maxDeltaX = trackWidth - columnLeft - columnWidth
  return Math.max(minDeltaX, Math.min(maxDeltaX, deltaX))
}

export function getListColumnDragTargetIndex(
  deltaX: number,
  previewOrder: SeekerListColumnId[],
  currentIndex: number,
  widthsByColumn: SeekerListColumnWidths,
): number {
  if (currentIndex < previewOrder.length - 1) {
    const rightColumnId = previewOrder[currentIndex + 1]
    const rightHalfWidth = (widthsByColumn[rightColumnId] ?? 0) / 2
    if (deltaX > rightHalfWidth) {
      return currentIndex + 1
    }
  }

  if (currentIndex > 0) {
    const leftColumnId = previewOrder[currentIndex - 1]
    if (isSeekerListColumnDraggable(leftColumnId)) {
      const leftHalfWidth = (widthsByColumn[leftColumnId] ?? 0) / 2
      if (deltaX < -leftHalfWidth) {
        return currentIndex - 1
      }
    }
  }

  return currentIndex
}

export function getNameJoinDividerLeft(
  columnOrder: SeekerListColumnId[],
  widthsByColumn: SeekerListColumnWidths,
): string {
  const nameIndex = columnOrder.indexOf('name')
  if (nameIndex < 0) return '2.62rem'

  const beforeWidth = getListColumnOrderSlotLeft(columnOrder, nameIndex, widthsByColumn)
  const internalOffsetRem = nameIndex === 0 ? 3.24 : 2.62
  return `calc(${beforeWidth}px + ${internalOffsetRem}rem)`
}
