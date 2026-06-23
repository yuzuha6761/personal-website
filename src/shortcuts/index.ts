import { useEffect } from 'react'
import { registerGlobalShortcuts } from '~/shortcuts/registry'

export { globalShortcutBindings, registerGlobalShortcuts } from '~/shortcuts/registry'
export type { ShortcutBinding } from '~/shortcuts/types'

export function useGlobalShortcuts() {
  useEffect(() => registerGlobalShortcuts(), [])
}
