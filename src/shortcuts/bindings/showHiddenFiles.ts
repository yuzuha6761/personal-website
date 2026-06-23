import useGlobalStore from '~/stores/global'
import { matchMetaShiftPeriod } from '~/shortcuts/match'
import type { ShortcutBinding } from '~/shortcuts/types'

export const showHiddenFilesShortcut: ShortcutBinding = {
  id: 'show-hidden-files',
  match: matchMetaShiftPeriod,
  preventDefault: true,
  handler: () => {
    useGlobalStore.getState().toggleShowHiddenFiles()
  },
}
