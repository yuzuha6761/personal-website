import type { SeekerSidebarSection } from './Main/types'

export const sidebarSections: SeekerSidebarSection[] = [
  {
    id: 'favorites',
    title: '个人收藏',
    items: [
      { id: 'recents', label: '最近使用', icon: 'clock', checked: true },
      { id: 'airdrop', label: '隔空投送', icon: 'airdrop', checked: true },
      { id: 'applications', label: '应用程序', icon: 'applications', checked: true },
      { id: 'downloads', label: '下载', icon: 'downloads', checked: true },
      { id: 'my-mac', label: '我的 Mac', icon: 'computer', checked: false },
      { id: 'movies', label: '影片', icon: 'movies', checked: true },
      { id: 'music', label: '音乐', icon: 'music', checked: true },
      { id: 'pictures', label: '图片', icon: 'pictures', checked: true },
      { id: 'home', label: 'yuki', icon: 'home', checked: true },
    ],
  },
  {
    id: 'icloud',
    title: 'iCloud',
    items: [
      { id: 'cloud-drive', label: '云盘', icon: 'cloud-drive', checked: true },
      { id: 'shared', label: '共享', icon: 'shared', checked: true },
      { id: 'desktop', label: '桌面', icon: 'desktop', checked: true },
      { id: 'documents', label: '文稿', icon: 'document', checked: true },
    ],
  },
  {
    id: 'locations',
    title: '位置',
    items: [
      { id: 'macbook-pro', label: 'yuzuha个人网站', icon: 'computer', checked: true },
      { id: 'hard-disks', label: '硬盘', icon: 'computer', indeterminate: true },
      { id: 'external-disks', label: '外置磁盘', icon: 'computer', checked: true },
      { id: 'disc-devices', label: 'CD、DVD 和 iOS 设备', icon: 'computer', checked: true },
      { id: 'cloud-storage', label: '云端储存空间', icon: 'cloud-drive', checked: true },
      { id: 'bonjour', label: 'Bonjour 电脑', icon: 'network', checked: true },
      { id: 'connected-servers', label: '已连接的服务器', icon: 'network', checked: true },
    ],
  },
  {
    id: 'tags',
    title: '标签',
    items: [
      { id: 'recent-tags', label: '最近使用的标签', icon: 'tag', checked: true },
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
