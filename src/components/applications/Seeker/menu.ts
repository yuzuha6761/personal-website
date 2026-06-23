import {
  createSeekerAboutWindowOptions,
  createSeekerSettingsWindowOptions,
  findSeekerAboutWindow,
  findSeekerSettingsWindow,
  SEEKER_WINDOW_KIND,
} from './windows'
import { addTabToTargetMainWindow } from './Main/store'
import type {
  ApplicationDockMenuSelectHandler,
  ApplicationMenuBarItem,
  ApplicationMenuBarSelectHandler,
} from '~/components/applications/registry'
import type { ContextualMenuItem } from '~/components/ContextualMenu'
import { FS_HOME_PATH, joinPath } from '~/fs/paths'
import { seekerIcons } from './icons'

const seekerDockPaths = [
  { id: 'downloads', label: '下载', path: joinPath(FS_HOME_PATH, 'Downloads') },
  { id: 'applications', label: 'applications', path: joinPath(FS_HOME_PATH, 'components/applications') },
  { id: 'assets', label: 'assets', path: joinPath(FS_HOME_PATH, 'components/assets') },
  { id: 'components', label: 'components', path: joinPath(FS_HOME_PATH, 'components') },
  { id: 'fuyi', label: 'fuyi', path: joinPath(FS_HOME_PATH, 'fuyi') },
  { id: 'cloud-drive', label: '云盘', path: joinPath(FS_HOME_PATH, 'Cloud Drive') },
  { id: 'ios-wallpapers', label: 'ios 壁纸', path: joinPath(FS_HOME_PATH, 'ios 壁纸') },
  { id: 'iptv', label: 'iptv', path: joinPath(FS_HOME_PATH, 'iptv') },
  { id: 'public', label: 'public', path: joinPath(FS_HOME_PATH, 'Public') },
  { id: 'wallpaper', label: 'wallpaper', path: joinPath(FS_HOME_PATH, 'wallpaper') },
]

export const seekerDockMenuItems: ContextualMenuItem[] = [
  { id: 'new-seeker-window', label: '新建 “Seeker” 窗口' },
  { id: 'new-smart-folder', label: '新建智能文件夹' },
  { id: 'find', label: '查找...' },
  { id: 'dock-divider-1', type: 'separator' },
  { id: 'go-folder', label: '前往文件夹...' },
  { id: 'connect-server', label: '连接服务器...' },
  { id: 'dock-divider-2', type: 'separator' },
  ...seekerDockPaths.map((item) => ({
    id: `open-path:${item.path}`,
    label: item.label,
  })),
]

export const onSeekerMenuBarSelect: ApplicationMenuBarSelectHandler = ({ itemId, context }) => {
  if (itemId === 'about-seeker') {
    const existingAboutWindow = findSeekerAboutWindow(context.windows)
    if (existingAboutWindow) {
      context.focusWindow(existingAboutWindow.id)
      return
    }

    context.openWindow(context.appId, createSeekerAboutWindowOptions())
    return
  }

  if (itemId === 'settings') {
    const existingSettingsWindow = findSeekerSettingsWindow(context.windows)
    if (existingSettingsWindow) {
      context.focusWindow(existingSettingsWindow.id)
      return
    }

    context.openWindow(context.appId, createSeekerSettingsWindowOptions())
    return
  }

  if (itemId === 'new-seeker-window') {
    context.openWindow(context.appId, { payload: { windowKind: SEEKER_WINDOW_KIND.MAIN } })
    return
  }

  if (itemId === 'new-tab') {
    addTabToTargetMainWindow()
  }
}

export const onSeekerDockMenuSelect: ApplicationDockMenuSelectHandler = ({ itemId, context }) => {
  if (itemId === 'new-seeker-window') {
    context.openWindow(context.appId)
    return
  }

  if (!itemId.startsWith('open-path:')) return

  context.openWindow(context.appId, {
    payload: { initialPath: itemId.slice('open-path:'.length) },
  })
}

export const seekerMenuBarItems: ApplicationMenuBarItem[] = [
  {
    id: 'app',
    label: 'Seeker',
    items: [
      { id: 'about-seeker', label: '关于 Seeker' },
      { id: 'divider-1', type: 'separator' },
      { id: 'settings', label: '设置...', shortcut: '⌘,' },
      { id: 'divider-2', type: 'separator' },
      { id: 'empty-trash', label: '清倒废纸篓...', shortcut: '⇧⌘⌫' },
      { id: 'divider-3', type: 'separator' },
      {
        id: 'services',
        label: '服务',
        children: [
          { id: 'services-none', label: '无', disabled: true },
          { id: 'services-settings', label: '服务设置...' },
        ],
      },
      { id: 'divider-4', type: 'separator' },
      { id: 'hide-seeker', label: '隐藏 Seeker', shortcut: '⌘H' },
      { id: 'hide-others', label: '隐藏其他', shortcut: '⌥⌘H' },
      { id: 'show-all', label: '全部显示', disabled: true },
    ],
  },
  {
    id: 'file',
    label: '文件',
    items: [
      { id: 'new-seeker-window', label: '新建“Seeker”窗口', shortcut: '⌘N' },
      { id: 'new-folder', label: '新建文件夹', shortcut: '⇧⌘N' },
      { id: 'new-folder-selection', label: '用所选项目新建文件夹', shortcut: '⌃⌘N', disabled: true },
      { id: 'new-smart-folder', label: '新建智能文件夹' },
      { id: 'new-tab', label: '新建标签页', shortcut: '⌘T' },
      { id: 'open-new-tab', label: '在新标签页中打开', shortcut: '⌃⌘O' },
      {
        id: 'open-with',
        label: '打开方式',
        disabled: true,
        children: [
          { id: 'open-with-none', label: '无可用应用', disabled: true },
        ],
      },
      { id: 'close-window', label: '关闭窗口', shortcut: '⌘W', disabled: true },
      { id: 'divider-1', type: 'separator' },
      { id: 'get-info', label: '显示摘要信息', shortcut: '⌃⌘I' },
      { id: 'rename', label: '重新命名', disabled: true },
      { id: 'compress', label: '压缩', disabled: true },
      { id: 'copy', label: '复制', shortcut: '⌘D', disabled: true },
      { id: 'make-alias', label: '制作替身', shortcut: '⌃⌘A', disabled: true },
      { id: 'quick-look', label: '快速查看', shortcut: '⌘Y', disabled: true },
      { id: 'print', label: '打印', shortcut: '⌘P', disabled: true },
      { id: 'divider-2', type: 'separator' },
      { id: 'share', label: '共享...', disabled: true },
      { id: 'divider-3', type: 'separator' },
      { id: 'show-original', label: '显示原项目', shortcut: '⌘R', disabled: true },
      { id: 'add-to-sidebar', label: '添加到边栏', shortcut: '⌃⌘T', disabled: true },
      { id: 'divider-4', type: 'separator' },
      { id: 'move-to-trash', label: '移到废纸篓', shortcut: '⌘⌫', disabled: true },
      { id: 'eject', label: '推出', shortcut: '⌃⌘E', disabled: true },
      { id: 'divider-5', type: 'separator' },
      {
        id: 'tag-colors',
        type: 'color-tags',
        colors: ['#ff6b67', '#ffb45b', '#ffd66b', '#7bd889', '#75b7ff', '#c48ce4', '#b6b6b6'],
      },
      { id: 'tags', label: '标签...', disabled: true },
      { id: 'divider-6', type: 'separator' },
      { id: 'find', label: '查找', shortcut: '⌘F' },
    ],
  },
  {
    id: 'edit',
    label: '编辑',
    items: [
      { id: 'undo', label: '撤销', shortcut: '⌘Z', disabled: true },
      { id: 'redo', label: '重做', shortcut: '⇧⌘Z', disabled: true },
      { id: 'divider-1', type: 'separator' },
      { id: 'cut', label: '剪切', shortcut: '⌘X', disabled: true },
      { id: 'copy', label: '拷贝', shortcut: '⌘C', disabled: true },
      { id: 'paste', label: '粘贴', shortcut: '⌘V', disabled: true },
      { id: 'select-all', label: '全选', shortcut: '⌘A' },
      { id: 'divider-2', type: 'separator' },
      { id: 'show-clipboard', label: '显示剪贴板' },
      { id: 'divider-3', type: 'separator' },
      {
        id: 'autofill',
        label: '自动填充',
        children: [
          { id: 'passwords', label: '密码...' },
          { id: 'contacts', label: '联系人信息' },
        ],
      },
      { id: 'start-dictation', label: '开始听写...' },
      { id: 'emoji-symbols', label: '表情与符号', shortcut: '🌐 E' },
    ],
  },
  {
    id: 'view',
    label: '显示',
    items: [
      { id: 'as-icons', label: '为图标', shortcut: '⌘1', checkable: true },
      { id: 'as-list', label: '为列表', shortcut: '⌘2', checkable: true, checked: true },
      { id: 'as-columns', label: '为分栏', shortcut: '⌘3', checkable: true },
      { id: 'as-gallery', label: '为画廊', shortcut: '⌘4', checkable: true },
      { id: 'divider-1', type: 'separator' },
      { id: 'use-groups', label: '使用群组', shortcut: '⌃⌘0' },
      {
        id: 'sort-by',
        label: '排序方式',
        children: [
          { id: 'sort-none', label: '无', checkable: true },
          { id: 'sort-name', label: '名称', checkable: true },
          { id: 'sort-kind', label: '种类', checkable: true },
          { id: 'sort-date-opened', label: '上次打开日期', checkable: true, checked: true },
          { id: 'sort-added', label: '添加日期', checkable: true },
          { id: 'sort-modified', label: '修改日期', checkable: true },
          { id: 'sort-created', label: '创建日期', checkable: true },
          { id: 'sort-size', label: '大小', checkable: true },
          { id: 'sort-tags', label: '标签', checkable: true },
        ],
      },
      { id: 'clean-up', label: '整理', disabled: true },
      { id: 'clean-up-by', label: '整理方式', disabled: true, children: [] },
      { id: 'divider-2', type: 'separator' },
      { id: 'hide-tab-bar', label: '隐藏标签页栏', shortcut: '⇧⌘T', disabled: true },
      { id: 'show-all-tabs', label: '显示所有标签页', shortcut: '⇧⌘\\' },
      { id: 'divider-3', type: 'separator' },
      { id: 'hide-sidebar', label: '隐藏边栏', shortcut: '⌃⌘S' },
      { id: 'show-preview', label: '显示预览', shortcut: '⇧⌘P' },
      { id: 'divider-4', type: 'separator' },
      { id: 'hide-toolbar', label: '隐藏工具栏', shortcut: '⌥⌘T', disabled: true },
      { id: 'show-path-bar', label: '显示路径栏', shortcut: '⌥⌘P' },
      { id: 'show-status-bar', label: '显示状态栏', shortcut: '⌘/' },
      { id: 'divider-5', type: 'separator' },
      { id: 'customize-toolbar', label: '自定义工具栏...' },
      { id: 'customize-touch-bar', label: '自定义触控栏...' },
      { id: 'divider-6', type: 'separator' },
      { id: 'show-view-options', label: '查看显示选项', shortcut: '⌘J' },
      { id: 'show-preview-options', label: '显示预览选项', disabled: true },
      { id: 'divider-7', type: 'separator' },
      { id: 'enter-full-screen', label: '进入全屏幕', shortcut: '🌐 F' },
    ],
  },
  {
    id: 'go',
    label: '前往',
    items: [
      { id: 'back', label: '返回', shortcut: '⌘[' },
      { id: 'forward', label: '前进', shortcut: '⌘]', disabled: true },
      { id: 'enclosing-folder', label: '新窗口中的上层文件夹', shortcut: '⌃⌘▲' },
      { id: 'divider-1', type: 'separator' },
      { id: 'recents', label: '最近使用', shortcut: '⇧⌘F', icon: seekerIcons.clock },
      { id: 'documents', label: '文稿', shortcut: '⇧⌘O', icon: seekerIcons.document },
      { id: 'desktop', label: '桌面', shortcut: '⇧⌘D', icon: seekerIcons.desktop },
      { id: 'downloads', label: '下载', shortcut: '⌥⌘L', icon: seekerIcons.downloads },
      { id: 'home', label: '个人', shortcut: '⇧⌘H', icon: seekerIcons.home },
      { id: 'computer', label: '电脑', shortcut: '⇧⌘C', icon: seekerIcons.computer },
      { id: 'airdrop', label: '隔空投送', shortcut: '⇧⌘R', icon: seekerIcons.airdrop },
      { id: 'network', label: '网络', shortcut: '⇧⌘K', icon: seekerIcons.globe },
      { id: 'cloud-drive', label: '云盘', shortcut: '⇧⌘I', icon: seekerIcons['cloud-drive'] },
      { id: 'shared', label: '共享', shortcut: '⇧⌘S', icon: seekerIcons.shared },
      { id: 'applications', label: '应用程序', shortcut: '⇧⌘A', icon: seekerIcons.applications },
      { id: 'utilities', label: '实用工具', shortcut: '⇧⌘U', icon: seekerIcons.utilities },
      { id: 'divider-2', type: 'separator' },
      { id: 'recent-folders', label: '最近使用的文件夹', children: [
        { id: 'downloads-folder', label: '下载' },
        { id: 'sf-symbols-folder', label: 'sf-symbols' },
        { id: 'yuzuha-folder', label: 'yuzuha' },
      ] },
      { id: 'divider-3', type: 'separator' },
      { id: 'go-folder', label: '前往文件夹...', shortcut: '⇧⌘G' },
      { id: 'connect-server', label: '连接服务器...', shortcut: '⌘K' },
    ],
  },
  {
    id: 'window',
    label: '窗口',
    items: [
      { id: 'minimize', label: '最小化', shortcut: '⌘M', disabled: true },
      { id: 'zoom', label: '缩放', disabled: true },
      { id: 'fill', label: '填充', shortcut: '⌃🌐F', disabled: true },
      { id: 'center', label: '居中', shortcut: '⌃🌐C', disabled: true },
      { id: 'divider-1', type: 'separator' },
      { id: 'move-resize', label: '移动与调整大小', children: [
        { id: 'left-half', label: '左半屏' },
        { id: 'right-half', label: '右半屏' },
        { id: 'top-half', label: '上半屏' },
        { id: 'bottom-half', label: '下半屏' },
      ] },
      { id: 'full-screen-tile', label: '全屏幕拼贴', disabled: true, children: [] },
      { id: 'divider-2', type: 'separator' },
      { id: 'remove-from-group', label: '从组中移除窗口', disabled: true },
      { id: 'divider-3', type: 'separator' },
      { id: 'move-monitor', label: '移到 “Mi Monitor”', disabled: true },
      { id: 'move-ipad', label: '移到 “雪ちゃんの iPad Pro”', disabled: true },
      { id: 'cycle-windows', label: '循环显示窗口', shortcut: '⌘`' },
      { id: 'show-progress', label: '显示进度窗口', disabled: true },
      { id: 'divider-4', type: 'separator' },
      { id: 'bring-all-front', label: '前置全部窗口' },
      { id: 'divider-5', type: 'separator' },
      { id: 'show-prev-tab', label: '显示上一个标签页', shortcut: '⌃⇧⇥', disabled: true },
      { id: 'show-next-tab', label: '显示下一个标签页', shortcut: '⌃⇥', disabled: true },
      { id: 'move-tab-new-window', label: '将标签页移到新窗口', disabled: true },
      { id: 'merge-all-windows', label: '合并所有窗口', disabled: true },
      { id: 'divider-6', type: 'separator' },
      { id: 'downloads-window', label: '下载' },
      { id: 'sf-symbols-window', label: 'sf-symbols' },
      { id: 'yuzuha-window', label: 'yuzuha' },
    ],
  },
  {
    id: 'help',
    label: '帮助',
    items: [
      { id: 'search', type: 'search', placeholder: '搜索' },
      { id: 'mac-user-guide', label: 'Mac 使用手册' },
      { id: 'mac-tips', label: 'Mac 使用技巧' },
    ],
  },
]

export default seekerMenuBarItems
