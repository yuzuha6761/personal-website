import type { SeekerListItem, SeekerSidebarSection, SeekerTab } from './types'

export const sidebarSections: SeekerSidebarSection[] = [
  {
    id: 'favorites',
    title: '个人收藏',
    items: [
      { id: 'recents', label: '最近使用', icon: 'clock' },
      { id: 'applications', label: '应用程序', icon: 'applications' },
      { id: 'movies', label: '影片', icon: 'movies' },
      // { id: 'music', label: '音乐', icon: 'music' },
      { id: 'pictures', label: '图片', icon: 'pictures' },
      { id: 'downloads', label: '下载', icon: 'downloads' },
      { id: 'home', label: 'yuki', icon: 'home' },
    ],
  },
  {
    id: 'icloud',
    title: 'iCloud',
    items: [
      { id: 'icloud-drive', label: 'iCloud 云盘', icon: 'icloud' },
      { id: 'documents', label: '文稿', icon: 'document' },
      { id: 'desktop', label: '桌面', icon: 'desktop' },
      { id: 'shared', label: '共享', icon: 'shared' },
    ],
  },
  {
    id: 'locations',
    title: '位置',
    items: [
      { id: 'mac', label: '雪ちゃんの Mac...', icon: 'computer' },
      { id: 'network', label: '网络', icon: 'network' },
    ],
  },
]

export const tagItems = [
  { id: 'red', label: 'Red', color: '#ff130f' },
  { id: 'orange', label: 'Orange', color: '#ff7a00' },
  { id: 'yellow', label: 'Yellow', color: '#f4b000' },
  { id: 'green', label: 'Green', color: '#00b52f' },
  { id: 'blue', label: 'Blue', color: '#0072f5' },
]

export const seekerTabs: SeekerTab[] = [
  { id: 'components', label: 'components', active: true },
  { id: 'downloads', label: '下载' },
  { id: 'claude', label: '.claude' },
]

export const seekerItems: SeekerListItem[] = [
  {
    id: 'applications',
    name: 'applications',
    modified: '今天 14:50',
    size: '--',
    kind: '文件夹',
    icon: 'folder',
    expanded: true,
  },
  {
    id: 'application-window-styles',
    name: 'ApplicationWindow.module.scss',
    modified: '今天 14:51',
    size: '1 KB',
    kind: 'SASS file',
    icon: 'scss',
    selected: true,
  },
  {
    id: 'application-window',
    name: 'ApplicationWindow.tsx',
    modified: '今天 14:50',
    size: '2 KB',
    kind: 'React source code',
    icon: 'tsx',
  },
  {
    id: 'desktop',
    name: 'Desktop.tsx',
    modified: '今天 14:50',
    size: '1 KB',
    kind: 'React source code',
    icon: 'tsx',
  },
  {
    id: 'dock-styles',
    name: 'Dock.module.scss',
    modified: '2025年4月18日 12:27',
    size: '3 KB',
    kind: 'SASS file',
    icon: 'scss',
  },
  {
    id: 'dock',
    name: 'Dock.tsx',
    modified: '今天 14:50',
    size: '2 KB',
    kind: 'React source code',
    icon: 'tsx',
  },
  {
    id: 'menu-bar-styles',
    name: 'MenuBar.module.scss',
    modified: '2025年4月18日 12:27',
    size: '1 KB',
    kind: 'SASS file',
    icon: 'scss',
  },
  {
    id: 'menu-bar',
    name: 'MenuBar.tsx',
    modified: '2025年4月18日 12:27',
    size: '2 KB',
    kind: 'React source code',
    icon: 'tsx',
  },
]
