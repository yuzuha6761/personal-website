import styles from './Dock.module.scss'
import useDockSettingStore from "../stores/settings/dock";
import {DockPositionEnum} from "~enums";
import trashIcon from '~assets/application-icon/trash.png'
import {
  getApplicationById,
  getApplicationDockMenuItems,
  selectApplicationDockMenuItem,
  type ApplicationDockMenuContext,
} from "../components/applications/registry";
import { sortWindowsByOpenedAt } from '../services/window'
import useWindowStore from "../stores/window";
import useAppStore from "../stores/app";
import ContextualMenu, {
  type ContextualMenuAnchor,
  type ContextualMenuItem,
  type ContextualMenuSelectEvent,
} from './ContextualMenu'
import { AppWindowMac } from 'lucide-react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { AppId } from '~types'

interface DockMenuState {
  anchor: ContextualMenuAnchor
  appId: AppId
  position: { x: number; y: number }
}

const DOCK_OPTIONS_MENU: ContextualMenuItem = {
  id: 'dock-options',
  label: '选项',
  children: [
    { id: 'remove-from-dock', label: '从程序坞中移除' },
    { id: 'open-at-login', label: '登录时打开' },
    { id: 'show-in-finder', label: '在访达中显示' },
    { id: 'dock-options-divider-1', type: 'separator' },
    { id: 'assign-to', label: '分配给', disabled: true },
    { id: 'assign-all-desktops', label: '所有桌面', checked: true },
    { id: 'assign-display-1', label: '显示器 “1” 上的桌面' },
    { id: 'assign-display-2', label: '显示器 “2” 上的桌面' },
    { id: 'assign-none', label: '无' },
  ],
}

function appendSection(target: ContextualMenuItem[], section: ContextualMenuItem[]) {
  if (section.length === 0) return

  if (target.length > 0) {
    target.push({ id: `divider-${target.length}`, type: 'separator' })
  }

  target.push(...section)
}

function Dock() {
  const size = useDockSettingStore((state) => state.size)
  const position = useDockSettingStore((state) => state.position)
  const pinnedApplicationIds = useDockSettingStore((state) => state.pinnedApplicationIds)
  const windows = useWindowStore((state) => state.windows)
  const focusedTarget = useWindowStore((state) => state.focusedTarget)
  const openApp = useWindowStore((state) => state.openApp)
  const openWindow = useWindowStore((state) => state.openWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const hideApp = useWindowStore((state) => state.hideApp)
  const quitApp = useWindowStore((state) => state.quitApp)
  const runningAppIds = useAppStore((state) => state.runningAppIds)
  const [dockMenu, setDockMenu] = useState<DockMenuState | null>(null)

  useEffect(() => {

  }, [])

  const dockStyle = useMemo(() => {
    if (position === DockPositionEnum.LEFT) return {width: size, height: 'auto'}
    else if (position === DockPositionEnum.BOTTOM) return {width: 'auto', height: size}
    else if (position === DockPositionEnum.RIGHT) return {width: size, height: 'auto'}
  }, [size, position])

  const dockMenuItems = useMemo<ContextualMenuItem[]>(() => {
    if (!dockMenu) return []

    const application = getApplicationById(dockMenu.appId)
    if (!application) return []

    const running = runningAppIds.includes(application.id)
    const appWindows = sortWindowsByOpenedAt(
      windows.filter((window) => window.appId === application.id),
    )
    const context: ApplicationDockMenuContext = {
      appId: application.id,
      appName: application.name,
      running,
      windows: appWindows,
    }

    if (!running) {
      return [
        DOCK_OPTIONS_MENU,
        { id: 'divider-not-running-default', type: 'separator' },
        { id: 'show-recents', label: '显示最近使用的项目' },
        { id: 'open-app', label: '打开' },
      ]
    }

    const items: ContextualMenuItem[] = []

    appendSection(items, appWindows.map((window) => ({
      id: `window:${window.id}`,
      label: window.title,
      checked: focusedTarget.type === 'window' && focusedTarget.windowId === window.id,
      icon: AppWindowMac,
    })))

    appendSection(items, getApplicationDockMenuItems(application.id, context))

    appendSection(items, [
      DOCK_OPTIONS_MENU,
      { id: 'show-all-windows', label: '显示所有窗口' },
      { id: 'hide-app', label: '隐藏' },
      ...(application.id === 'seeker'
        ? []
        : [{ id: 'quit-app', label: '退出' } satisfies ContextualMenuItem]),
    ])

    return items
  }, [dockMenu, focusedTarget, runningAppIds, windows])

  const onAppContextMenu = (
    applicationId: AppId,
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const iconRect = event.currentTarget.querySelector('img')?.getBoundingClientRect()
    const anchorRect = iconRect ?? event.currentTarget.getBoundingClientRect()
    const anchor = {
      x: anchorRect.left + (anchorRect.width / 2),
      y: anchorRect.top + (anchorRect.height / 2),
      side: position === DockPositionEnum.LEFT
        ? 'left'
        : position === DockPositionEnum.RIGHT
          ? 'right'
          : 'bottom',
    } satisfies ContextualMenuAnchor

    setDockMenu({
      anchor,
      appId: applicationId,
      position: { x: anchor.x, y: anchor.y },
    })
  }

  const onDockMenuSelect = (event: ContextualMenuSelectEvent) => {
    if (!dockMenu) return

    const itemId = event.item.id
    const application = getApplicationById(dockMenu.appId)
    if (!application) return

    if (itemId.startsWith('window:')) {
      focusWindow(itemId.slice('window:'.length))
      return
    }

    if (itemId === 'open-app' || itemId === 'show-all-windows') {
      openApp(application.id)
      return
    }

    if (itemId === 'hide-app') {
      hideApp(application.id)
      return
    }

    if (itemId === 'quit-app') {
      quitApp(application.id)
      return
    }

    const appWindows = sortWindowsByOpenedAt(
      windows.filter((window) => window.appId === application.id),
    )
    selectApplicationDockMenuItem(application.id, {
      itemId,
      context: {
        appId: application.id,
        appName: application.name,
        running: runningAppIds.includes(application.id),
        windows: appWindows,
        openApp,
        openWindow,
      },
    })
  }

  return (
    <>
      <div
        data-position={position}
        data-context-menu-open={Boolean(dockMenu)}
        className={styles['dock']}
        style={dockStyle}
      >
        {pinnedApplicationIds.map((applicationId) => {
          const application = getApplicationById(applicationId)

          if (!application) return

          return (
            <div
              key={application.id}
              data-add-icon-safe-area={application.addIconSafeArea}
              onClick={() => openApp(application.id)}
              onContextMenu={(event) => onAppContextMenu(application.id, event)}
            >
              <div>{application.name}</div>
              <div className={styles['icon']}>
                <img src={application.icon} alt=""/>
              </div>
              {runningAppIds.includes(application.id) && (
                <i className={`ri-circle-fill ${styles['running-indicator']}`} aria-hidden="true" />
              )}
            </div>
          )
        })}
        <div data-spliter={true}></div>
        <div>
          <div>Trash</div>
          <div className={styles['icon']}>
            <img src={trashIcon} alt=""/>
          </div>
        </div>
      </div>
      <ContextualMenu
        anchor={dockMenu?.anchor}
        id="dock-app-context-menu"
        items={dockMenuItems}
        open={Boolean(dockMenu)}
        position={dockMenu?.position ?? { x: 0, y: 0 }}
        onClose={() => setDockMenu(null)}
        onSelect={onDockMenuSelect}
      />
    </>
  )
}

export default Dock
