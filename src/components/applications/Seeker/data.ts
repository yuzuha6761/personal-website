import type { SeekerSidebarSection } from './Main/types'

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
      { id: 'home', label: 'yuzuha', icon: 'home' },
    ],
  },
  {
    id: 'cloud-drive',
    title: '云盘',
    items: [
      { id: 'cloud-drive', label: '云盘', icon: 'cloud-drive' },
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
