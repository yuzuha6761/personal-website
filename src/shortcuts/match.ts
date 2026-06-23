export function shouldIgnoreKeyboardShortcut(event: KeyboardEvent): boolean {
  const target = event.target
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true

  const tagName = target.tagName
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
}

export function matchMetaShiftPeriod(event: KeyboardEvent): boolean {
  return event.metaKey
    && event.shiftKey
    && !event.altKey
    && !event.ctrlKey
    && (event.key === '.' || event.code === 'Period')
}
