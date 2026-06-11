import styles from './MenuBar.module.scss'
import appleLogo from '~assets/logo/apple.svg'
import useGlobalStore from "../stores/global";
import { DateTime } from 'luxon'
import ContextualMenu, { type ContextualMenuItem } from './ContextualMenu'
import {
  getApplicationById,
  getApplicationMenuBarItems,
  type ApplicationMenuBarItem,
} from './applications/registry'
import useAppStore from '../stores/app'

const appleMenuItems: ContextualMenuItem[] = [
  { id: 'about-this-mac', label: '关于本机' },
  { id: 'divider-1', type: 'separator' },
  { id: 'system-settings', label: '系统设置...' },
  { id: 'app-store', label: 'App Store' },
  { id: 'divider-2', type: 'separator' },
  {
    id: 'recent-items',
    label: '最近使用的项目',
    children: [
      { id: 'applications', label: '应用程序' },
      { id: 'documents', label: '文稿' },
      { id: 'servers', label: '服务器' },
    ],
  },
  { id: 'divider-3', type: 'separator' },
  { id: 'force-quit', label: '强制退出...', shortcut: '⌥⌘⎋' },
  { id: 'divider-4', type: 'separator' },
  { id: 'sleep', label: '睡眠' },
  { id: 'restart', label: '重新启动...' },
  { id: 'shutdown', label: '关机...' },
  { id: 'divider-5', type: 'separator' },
  { id: 'lock-screen', label: '锁定屏幕', shortcut: '⌃⌘Q' },
  { id: 'log-out', label: '退出登录 “yuki”...', shortcut: '⇧⌘Q' },
]

function MenuBar() {
  const [activeMenuId, setActiveMenuId] = useState('')
  const [mouseDownTimestamp, setMouseDownTimestamp] = useState(0)
  const [menuItems, setMenuItems] = useState<ContextualMenuItem[]>([])
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const timestamp = useGlobalStore((state) => state.timestamp)
  const activeAppId = useAppStore((state) => state.activeAppId)
  const activeApplication = activeAppId ? getApplicationById(activeAppId) : undefined
  const applicationMenuBarItems = activeAppId
    ? getApplicationMenuBarItems(activeAppId)
    : []

  const dockRef = useRef<HTMLDivElement>(null)

  const openMenu = (
    menuId: string,
    items: ContextualMenuItem[],
    target: HTMLDivElement,
  ) => {
    const rect = target.getBoundingClientRect()

    setActiveMenuId(menuId)
    setMenuItems(items)
    setMenuPosition({ x: rect.left, y: rect.bottom })
  }

  const onMouseDown = (
    menuId: string,
    items: ContextualMenuItem[],
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation()
    openMenu(menuId, items, event.currentTarget)
    setMouseDownTimestamp(Date.now())
  }

  const onMouseEnter = (
    menuId: string,
    items: ContextualMenuItem[],
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (activeMenuId && activeMenuId !== menuId) openMenu(menuId, items, event.currentTarget)
  }

  const onMouseUp = () => {
    if (Date.now() - mouseDownTimestamp > 1000) setActiveMenuId('')
  }

  return (
    <div className={styles['menu-bar']} ref={dockRef}>
      <div>
        <div
          data-active={activeMenuId === 'apple'}
          onMouseDown={(event) => onMouseDown('apple', appleMenuItems, event)}
          onMouseEnter={(event) => onMouseEnter('apple', appleMenuItems, event)}
          onMouseUp={() => onMouseUp()}
        >
          <div>
            <img src={appleLogo} alt=""/>
          </div>
        </div>
        {applicationMenuBarItems.length > 0 ? applicationMenuBarItems.map((menu: ApplicationMenuBarItem) => (
          <div
            data-active={activeMenuId === menu.id}
            key={menu.id}
            onMouseDown={(event) => onMouseDown(menu.id, menu.items, event)}
            onMouseEnter={(event) => onMouseEnter(menu.id, menu.items, event)}
            onMouseUp={() => onMouseUp()}
          >
            <div>{menu.label}</div>
          </div>
        )) : activeApplication ? (
          <div>
            <div>{activeApplication.name}</div>
          </div>
        ) : null}
      </div>
      <div>
        <div
          data-active={false}
          onMouseDown={() => setActiveMenuId('')}
          onMouseUp={() => onMouseUp()}
        >
          <div>
            <span style={{marginRight: '0.6rem'}}>{DateTime.fromMillis(timestamp).toFormat('ccc LLL d')}</span>
            <span>{DateTime.fromMillis(timestamp).toFormat('H:mm')}</span>
          </div>
        </div>
      </div>
      <ContextualMenu
        id="menu-bar-menu"
        items={menuItems}
        open={Boolean(activeMenuId)}
        position={menuPosition}
        onClose={() => setActiveMenuId('')}
      />
    </div>
  )
}

export default MenuBar
