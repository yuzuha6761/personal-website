export const WINDOW_DRAG_HANDLE_ATTR = 'data-window-drag-handle'
export const WINDOW_DRAG_EXCLUDE_ATTR = 'data-window-drag-exclude'

export const dragHandleProps = {
  [WINDOW_DRAG_HANDLE_ATTR]: true,
} as const

export const dragExcludeProps = {
  [WINDOW_DRAG_EXCLUDE_ATTR]: true,
} as const

export function shouldStartWindowDrag(
  target: EventTarget | null,
  windowElement: HTMLElement | null,
  clientY: number,
  fallbackDragHeight: number,
) {
  if (!(target instanceof HTMLElement) || !windowElement) return false

  if (target.closest(`[${WINDOW_DRAG_EXCLUDE_ATTR}]`)) return false

  const dragHandle = target.closest(`[${WINDOW_DRAG_HANDLE_ATTR}]`)
  if (dragHandle && windowElement.contains(dragHandle)) return true

  const rect = windowElement.getBoundingClientRect()
  return clientY - rect.top <= fallbackDragHeight
}
