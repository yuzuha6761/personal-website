import {
  getListColumnSlotOffsetX,
  type SeekerListColumnId,
  type SeekerListColumnWidths,
} from '../../listColumnLayout'

export const COLUMN_SLOT_TRANSITION = 'transform 200ms ease-out'
export const SEEKER_LIST_COLUMN_DRAG_FRAME_ATTR = 'data-seeker-list-column-drag-frame'
export const SEEKER_LIST_COLUMN_DRAG_DIVIDER_ATTR = 'data-seeker-list-column-drag-divider'
export const SEEKER_LIST_HEADER_DIVIDER_ATTR = 'data-seeker-list-header-divider'
export const SEEKER_LIST_COLUMN_DRAG_BORDER_OVERLAY_ATTR = 'data-seeker-list-column-drag-border-overlay'
export const COLUMN_DRAG_BORDER = 'var(--seeker-list-column-drag-border, #dbdbdb)'
export const COLUMN_DRAG_FRAME_BORDER = 'var(--seeker-list-column-drag-list-frame-border, #f0f0f0)'
export const COLUMN_DRAG_HEADER_TEXT = 'var(--seeker-list-column-drag-header-text, var(--seeker-list-name-text, #3b3b3d))'
export const COLUMN_DRAG_OPACITY = '0.45'

export interface ColumnDragVisualState {
  columnId: SeekerListColumnId
  committedOrder: SeekerListColumnId[]
  deltaX: number
  dragging: boolean
  frameBaseLeft: number
  frameWidth: number
  previewOrder: SeekerListColumnId[]
  slotWidthsByColumn: SeekerListColumnWidths
}

export interface ApplyColumnDragVisualsOptions {
  animatingSlots: boolean
  settlingDraggedColumn: boolean
}

function isColumnDragVisualActive(
  state: ColumnDragVisualState,
  options: ApplyColumnDragVisualsOptions,
): boolean {
  return state.dragging || options.settlingDraggedColumn || options.animatingSlots || state.deltaX !== 0
}

function getColumnVisualOffsetX(
  columnId: SeekerListColumnId,
  state: ColumnDragVisualState,
): number {
  const slotOffset = getListColumnSlotOffsetX(
    columnId,
    state.committedOrder,
    state.previewOrder,
    state.slotWidthsByColumn,
  )
  const dragOffset = state.columnId === columnId ? state.deltaX : 0
  const offsetX = slotOffset + dragOffset
  return Math.abs(offsetX) < 0.5 ? 0 : offsetX
}

function getColumnSlotTransition(
  isDraggedColumn: boolean,
  state: ColumnDragVisualState,
  options: ApplyColumnDragVisualsOptions,
): string {
  if (isDraggedColumn) {
    if (state.dragging) return ''
    if (options.settlingDraggedColumn) return COLUMN_SLOT_TRANSITION
    return ''
  }

  return options.animatingSlots ? COLUMN_SLOT_TRANSITION : ''
}

function clearHeaderDragStyles(element: HTMLElement) {
  element.style.boxShadow = ''
  element.style.outline = ''
  element.style.outlineOffset = ''
  element.style.zIndex = ''
  element.style.opacity = ''

  element.querySelectorAll<HTMLElement>(`[${SEEKER_LIST_COLUMN_DRAG_BORDER_OVERLAY_ATTR}]`).forEach((overlay) => {
    overlay.remove()
  })

  element.querySelectorAll<HTMLElement>(`[${SEEKER_LIST_HEADER_DIVIDER_ATTR}]`).forEach((divider) => {
    divider.style.display = ''
  })

  const button = element.querySelector<HTMLElement>('button')
  if (button) {
    button.style.backgroundColor = ''
    button.querySelectorAll<HTMLElement>('span, svg').forEach((child) => {
      child.style.color = ''
    })
  }
}

function createHeaderBorderOverlay(side: 'left' | 'right') {
  const overlay = document.createElement('span')
  overlay.setAttribute(SEEKER_LIST_COLUMN_DRAG_BORDER_OVERLAY_ATTR, side)
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.pointerEvents = 'none'
  overlay.style.position = 'absolute'
  overlay.style.zIndex = '5'
  overlay.style.background = COLUMN_DRAG_BORDER

  if (side === 'left') {
    overlay.style.left = '0'
    overlay.style.top = '0'
    overlay.style.bottom = '0'
    overlay.style.width = '1px'
  } else {
    overlay.style.right = '0'
    overlay.style.top = '0'
    overlay.style.bottom = '0'
    overlay.style.width = '1px'
  }

  return overlay
}

function applyHeaderDragStyles(element: HTMLElement, isActive: boolean) {
  if (!isActive) {
    clearHeaderDragStyles(element)
    return
  }

  element.style.zIndex = '3'
  element.style.opacity = ''

  element.querySelectorAll<HTMLElement>(`[${SEEKER_LIST_COLUMN_DRAG_BORDER_OVERLAY_ATTR}]`).forEach((overlay) => {
    overlay.remove()
  })
  element.appendChild(createHeaderBorderOverlay('left'))
  element.appendChild(createHeaderBorderOverlay('right'))

  element.querySelectorAll<HTMLElement>(`[${SEEKER_LIST_HEADER_DIVIDER_ATTR}]`).forEach((divider) => {
    divider.style.display = 'none'
  })

  const button = element.querySelector<HTMLElement>('button')
  if (button) {
    button.style.backgroundColor = 'var(--seeker-list-header-hover-bg, #f3f3f3)'
    button.querySelectorAll<HTMLElement>('span, svg').forEach((child) => {
      child.style.color = COLUMN_DRAG_HEADER_TEXT
    })
  }
}

function applyColumnSlotVisual(
  element: HTMLElement,
  columnId: SeekerListColumnId,
  state: ColumnDragVisualState,
  options: ApplyColumnDragVisualsOptions,
  previousOffsets: Map<HTMLElement, number>,
  isHeader: boolean,
) {
  const offsetX = getColumnVisualOffsetX(columnId, state)
  const isDraggedColumn = state.columnId === columnId
  const previousOffset = previousOffsets.get(element)
  const offsetChanged = previousOffset === undefined
    ? offsetX !== 0
    : previousOffset !== offsetX
  const isDragActive = isDraggedColumn && isColumnDragVisualActive(state, options)

  element.style.transform = offsetX !== 0 ? `translate3d(${offsetX}px,0,0)` : ''
  element.style.transition = isDraggedColumn
    ? getColumnSlotTransition(true, state, options)
    : offsetChanged && options.animatingSlots
      ? COLUMN_SLOT_TRANSITION
      : ''

  if (isHeader) {
    applyHeaderDragStyles(element, isDragActive)
  } else if (isDraggedColumn && state.dragging) {
    element.style.opacity = COLUMN_DRAG_OPACITY
  } else {
    element.style.opacity = ''
  }

  previousOffsets.set(element, offsetX)
}

function applyColumnSlotsInRoot(
  root: HTMLElement | null,
  state: ColumnDragVisualState,
  options: ApplyColumnDragVisualsOptions,
  previousOffsets: Map<HTMLElement, number>,
  isHeader: boolean,
) {
  if (!root) return

  root.querySelectorAll<HTMLElement>('[data-seeker-list-column-slot]').forEach((element) => {
    const columnId = element.dataset.seekerListColumnSlot as SeekerListColumnId | undefined
    if (!columnId) return

    applyColumnSlotVisual(element, columnId, state, options, previousOffsets, isHeader)
  })
}

function clearDragNeighborDivider(headerTrack: HTMLElement | null) {
  headerTrack?.querySelectorAll<HTMLElement>(`[${SEEKER_LIST_COLUMN_DRAG_DIVIDER_ATTR}]`).forEach((element) => {
    element.remove()
  })
}

function updateDragNeighborDivider(
  headerTrack: HTMLElement | null,
  state: ColumnDragVisualState,
  options: ApplyColumnDragVisualsOptions,
) {
  clearDragNeighborDivider(headerTrack)
  if (!headerTrack || !isColumnDragVisualActive(state, options)) return

  const draggedIndex = state.previewOrder.indexOf(state.columnId)
  if (draggedIndex <= 0) return

  const leftNeighborId = state.previewOrder[draggedIndex - 1]
  const leftSlot = headerTrack.querySelector<HTMLElement>(
    `[data-seeker-list-column-slot="${leftNeighborId}"]`,
  )
  if (!leftSlot) return

  const divider = document.createElement('span')
  divider.setAttribute(SEEKER_LIST_COLUMN_DRAG_DIVIDER_ATTR, '')
  divider.setAttribute('aria-hidden', 'true')
  divider.style.pointerEvents = 'none'
  divider.style.position = 'absolute'
  divider.style.right = '0'
  divider.style.top = '0.22rem'
  divider.style.bottom = '0.22rem'
  divider.style.zIndex = '11'
  divider.style.width = '1px'
  divider.style.background = 'var(--seeker-list-header-divider, #e3e3e3)'
  leftSlot.appendChild(divider)
}

function updateColumnDragFrame(
  listBody: HTMLElement | null,
  state: ColumnDragVisualState,
  options: ApplyColumnDragVisualsOptions,
) {
  if (!listBody) return

  const showFrame = isColumnDragVisualActive(state, options)
  let frame = listBody.querySelector<HTMLElement>(`[${SEEKER_LIST_COLUMN_DRAG_FRAME_ATTR}]`)

  if (!showFrame) {
    frame?.remove()
    return
  }

  if (!frame) {
    frame = document.createElement('div')
    frame.setAttribute(SEEKER_LIST_COLUMN_DRAG_FRAME_ATTR, '')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.pointerEvents = 'none'
    frame.style.position = 'absolute'
    frame.style.top = '0'
    frame.style.zIndex = '12'
    frame.style.boxSizing = 'border-box'
    listBody.insertBefore(frame, listBody.firstChild)
  }

  const offsetX = getColumnVisualOffsetX(state.columnId, state)

  frame.style.left = `${state.frameBaseLeft}px`
  frame.style.width = `${state.frameWidth}px`
  frame.style.height = `${listBody.scrollHeight}px`
  frame.style.boxShadow = ''
  frame.style.borderTop = '0'
  frame.style.borderBottom = '0'
  frame.style.borderLeft = `1px solid ${COLUMN_DRAG_FRAME_BORDER}`
  frame.style.borderRight = `1px solid ${COLUMN_DRAG_FRAME_BORDER}`
  frame.style.transform = offsetX !== 0 ? `translate3d(${offsetX}px,0,0)` : ''
  frame.style.transition = state.dragging ? '' : COLUMN_SLOT_TRANSITION
}

const columnSlotPreviousOffsets = new Map<HTMLElement, number>()

export function measureColumnDragFrameLayout(
  headerTrack: HTMLElement | null,
  listBody: HTMLElement | null,
  columnId: SeekerListColumnId,
): { frameBaseLeft: number; frameWidth: number } {
  const headerSlot = headerTrack?.querySelector<HTMLElement>(
    `[data-seeker-list-column-slot="${columnId}"]`,
  )

  if (!headerSlot || !listBody) {
    return { frameBaseLeft: 0, frameWidth: 0 }
  }

  const headerSlotRect = headerSlot.getBoundingClientRect()
  const listBodyRect = listBody.getBoundingClientRect()

  return {
    frameBaseLeft: headerSlotRect.left - listBodyRect.left + listBody.scrollLeft,
    frameWidth: headerSlot.offsetWidth,
  }
}

export function applyColumnDragVisuals(
  headerTrack: HTMLElement | null,
  listBody: HTMLElement | null,
  state: ColumnDragVisualState,
  options: ApplyColumnDragVisualsOptions,
) {
  applyColumnSlotsInRoot(headerTrack, state, options, columnSlotPreviousOffsets, true)
  applyColumnSlotsInRoot(listBody, state, options, columnSlotPreviousOffsets, false)
  updateDragNeighborDivider(headerTrack, state, options)
  updateColumnDragFrame(listBody, state, options)
}

export function clearColumnDragVisuals(
  headerTrack: HTMLElement | null,
  listBody: HTMLElement | null,
) {
  columnSlotPreviousOffsets.clear()
  clearDragNeighborDivider(headerTrack)

  for (const root of [headerTrack, listBody]) {
    root?.querySelectorAll<HTMLElement>('[data-seeker-list-column-slot]').forEach((element) => {
      element.style.transform = ''
      element.style.transition = ''
      element.style.opacity = ''
      if (root === headerTrack) {
        clearHeaderDragStyles(element)
      }
    })
  }

  listBody?.querySelector<HTMLElement>(`[${SEEKER_LIST_COLUMN_DRAG_FRAME_ATTR}]`)?.remove()
}
