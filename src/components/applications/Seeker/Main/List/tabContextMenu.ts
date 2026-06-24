import type { ContextualMenuItem } from '~/components/ContextualMenu'

export function getTabContextMenuItems(tabCount: number): ContextualMenuItem[] {
  return [
    { id: 'close-tab', label: '关闭标签页', disabled: tabCount <= 1 },
    { id: 'close-other-tabs', label: '关闭其他标签页', disabled: tabCount <= 1 },
    { id: 'move-tab-new-window', label: '将标签页移到新窗口' },
  ]
}
