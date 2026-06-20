export const WINDOW_RESTORE_TRANSITION_DURATION_MS = 420

export interface WindowRestoreOrigin {
  height: number
  left: number
  top: number
  width: number
}

const restoreOrigins = new Map<string, WindowRestoreOrigin>()

export function prepareWindowRestoreTransition(windowId: string) {
  const source = document.querySelector<HTMLElement>(
    `[data-minimized-window-id="${windowId}"] [data-window-minimize-target="true"]`,
  )

  if (!source) return

  const rect = source.getBoundingClientRect()
  restoreOrigins.set(windowId, {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  })
}

export function consumeWindowRestoreOrigin(windowId: string) {
  const origin = restoreOrigins.get(windowId)
  restoreOrigins.delete(windowId)
  return origin
}
