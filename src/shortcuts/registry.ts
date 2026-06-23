import { showHiddenFilesShortcut } from '~/shortcuts/bindings/showHiddenFiles'
import { shouldIgnoreKeyboardShortcut } from '~/shortcuts/match'
import type { ShortcutBinding } from '~/shortcuts/types'

export const globalShortcutBindings: ShortcutBinding[] = [
  showHiddenFilesShortcut,
]

export function registerGlobalShortcuts(): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (shouldIgnoreKeyboardShortcut(event)) return

    for (const binding of globalShortcutBindings) {
      if (!binding.match(event)) continue

      if (binding.preventDefault) {
        event.preventDefault()
      }

      binding.handler(event)
      return
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}
