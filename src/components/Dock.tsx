import './Dock.theme.scss'
import styles from './Dock.module.scss'
import useDockSettingStore from '~/stores/settings/dock'
import useSystemSettingsStore from '~/stores/settings/system-settings'
import {DockPositionEnum} from "~enums";
import trashIcon from '~assets/application-icon/trash.png'
import {
  getApplicationById,
  getApplicationDockMenuItems,
  selectApplicationDockMenuItem,
  type ApplicationDockMenuContext,
} from '~/components/applications/registry'
import { sortWindowsByOpenedAt } from '~/services/window'
import { WINDOW_RESTORE_TRANSITION_DURATION_MS } from '~/services/window-restore-transition'
import { getWindowSnapshot, subscribeWindowSnapshots } from '~/services/window-snapshots'
import useWindowStore from '~/stores/window'
import useAppStore from '~/stores/app'
import ContextualMenu, {
  type ContextualMenuAnchor,
  type ContextualMenuItem,
  type ContextualMenuSelectEvent,
} from './ContextualMenu'
import DockTooltip from './DockTooltip'
import type { GlassPanelArrowEdge } from './glassPanelPath'
import { AppWindowMac } from 'lucide-react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { Z_INDEX } from '~/constants/zIndex'
import type { AppId, WindowState } from '~types'

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

function sortWindowsByMinimizedAt(windows: WindowState[]) {
  return [...windows].sort((left, right) => (
    (left.minimizedAt ?? 0) - (right.minimizedAt ?? 0)
    || left.openedAt - right.openedAt
  ))
}

function appendSection(target: ContextualMenuItem[], section: ContextualMenuItem[]) {
  if (section.length === 0) return

  if (target.length > 0) {
    target.push({ id: `divider-${target.length}`, type: 'separator' })
  }

  target.push(...section)
}

function MinimizedWindowPreview(props: { appIcon: string; windowId: string }) {
  const { appIcon, windowId } = props
  const snapshot = useSyncExternalStore(
    subscribeWindowSnapshots,
    () => getWindowSnapshot(windowId),
    () => getWindowSnapshot(windowId),
  )
  const snapshotStyle: CSSProperties | undefined = snapshot
    ? snapshot.width >= snapshot.height
      ? { width: '100%', height: 'auto' }
      : { width: 'auto', height: '100%' }
    : undefined

  return (
    <div
      className={styles['minimized-window-preview']}
      data-window-minimize-target="true"
    >
      {snapshot && (
        <img
          className={styles['minimized-window-snapshot']}
          src={snapshot.dataUrl}
          style={snapshotStyle}
          alt=""
        />
      )}
      <img
        className={styles['minimized-app-icon']}
        src={appIcon}
        alt=""
      />
    </div>
  )
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
  const loadingAppIds = useAppStore((state) => state.loadingAppIds)
  const animateOpeningApplications = useSystemSettingsStore((state) => state.animateOpeningApplications)
  const showIndicatorsForOpenApplications = useSystemSettingsStore((state) => state.showIndicatorsForOpenApplications)
  const [dockMenu, setDockMenu] = useState<DockMenuState | null>(null)
  const [expandedMinimizedWindowIds, setExpandedMinimizedWindowIds] = useState<Set<string>>(() => new Set())
  const [restoringMinimizedWindowIds, setRestoringMinimizedWindowIds] = useState<Set<string>>(() => new Set())
  const dockMenuActionRef = useRef<DockMenuState | null>(null)
  const minimizedWindows = sortWindowsByMinimizedAt(windows.filter((window) => window.minimized))
  const restoringWindows = windows.filter((window) => restoringMinimizedWindowIds.has(window.id))
  const dockMinimizedWindows = [...minimizedWindows, ...restoringWindows.filter((window) => !window.minimized)]
  const minimizedWindowIds = minimizedWindows.map((window) => window.id)
  const restoringWindowIds = [...restoringMinimizedWindowIds]
  const visibleMinimizedWindowIds = [...minimizedWindowIds, ...restoringWindowIds]
  const minimizedWindowIdKey = visibleMinimizedWindowIds.join('\0')

  useEffect(() => {

  }, [])

  useEffect(() => {
    const minimizedWindowIdSet = new Set(visibleMinimizedWindowIds)
    let animationFrame: number | undefined

    setExpandedMinimizedWindowIds((currentIds) => {
      const nextIds = new Set<string>()

      currentIds.forEach((windowId) => {
        if (minimizedWindowIdSet.has(windowId)) nextIds.add(windowId)
      })

      return nextIds
    })

    animationFrame = window.requestAnimationFrame(() => {
      setExpandedMinimizedWindowIds((currentIds) => {
        const nextIds = new Set(currentIds)
        let changed = false

        visibleMinimizedWindowIds.forEach((windowId) => {
          if (nextIds.has(windowId)) return
          nextIds.add(windowId)
          changed = true
        })

        return changed ? nextIds : currentIds
      })
    })

    return () => {
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
    }
  }, [minimizedWindowIdKey])

  const dockStyle = useMemo(() => {
    const baseStyle = { zIndex: Z_INDEX.DOCK }

    if (position === DockPositionEnum.LEFT) return { ...baseStyle, width: size, height: 'auto' }
    if (position === DockPositionEnum.BOTTOM) return { ...baseStyle, width: 'auto', height: size }
    if (position === DockPositionEnum.RIGHT) return { ...baseStyle, width: size, height: 'auto' }

    return baseStyle
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

    const menu = {
      anchor,
      appId: applicationId,
      position: { x: anchor.x, y: anchor.y },
    }

    dockMenuActionRef.current = menu
    setDockMenu(menu)
  }

  const onDockMenuSelect = (event: ContextualMenuSelectEvent) => {
    const menu = dockMenuActionRef.current
    dockMenuActionRef.current = null
    if (!menu) return

    const itemId = event.item.id
    const application = getApplicationById(menu.appId)
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

  const getMinimizedWindowState = (windowId: string) => {
    if (restoringMinimizedWindowIds.has(windowId)) return 'restoring'
    return expandedMinimizedWindowIds.has(windowId) ? 'expanded' : 'collapsed'
  }

  const getMinimizedWindowStyle = (windowId: string): CSSProperties => {
    const state = getMinimizedWindowState(windowId)
    const slotSize = `calc(${size} - .5rem)`

    if (position === DockPositionEnum.BOTTOM) {
      return { width: state === 'expanded' ? slotSize : 0 }
    }

    return { height: state === 'expanded' ? slotSize : 0 }
  }

  const restoreMinimizedWindow = (windowId: string) => {
    const finishRestoringSlot = () => {
      setRestoringMinimizedWindowIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.add(windowId)
        return nextIds
      })

      window.setTimeout(() => {
        setRestoringMinimizedWindowIds((currentIds) => {
          const nextIds = new Set(currentIds)
          nextIds.delete(windowId)
          return nextIds
        })
      }, WINDOW_RESTORE_TRANSITION_DURATION_MS)
    }

    focusWindow(windowId)
    finishRestoringSlot()
  }

  const dockTooltipArrowEdge = (
    position === DockPositionEnum.LEFT
      ? 'left'
      : position === DockPositionEnum.RIGHT
        ? 'right'
        : 'bottom'
  ) satisfies GlassPanelArrowEdge

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
              data-context-menu-active={dockMenu?.appId === application.id}
              data-loading={animateOpeningApplications && loadingAppIds.includes(application.id)}
              onClick={() => openApp(application.id)}
              onContextMenu={(event) => onAppContextMenu(application.id, event)}
            >
              <DockTooltip
                arrowEdge={dockTooltipArrowEdge}
                className={styles['dock-tooltip']}
                label={application.name}
              />
              <div className={styles['icon']}>
                <img src={application.icon} alt=""/>
              </div>
              {showIndicatorsForOpenApplications && runningAppIds.includes(application.id) && (
                <i className={`ri-circle-fill ${styles['running-indicator']}`} aria-hidden="true" />
              )}
            </div>
          )
        })}
        <div data-spliter={true}></div>
        {dockMinimizedWindows.map((window) => {
          const application = getApplicationById(window.appId)

          if (!application) return null

          return (
            <div
              key={`minimized-${window.id}`}
              className={styles['minimized-window']}
              data-minimized-window-id={window.id}
              data-state={getMinimizedWindowState(window.id)}
              onClick={() => restoreMinimizedWindow(window.id)}
              style={getMinimizedWindowStyle(window.id)}
            >
              <DockTooltip
                arrowEdge={dockTooltipArrowEdge}
                className={styles['dock-tooltip']}
                label={window.title}
              />
              <MinimizedWindowPreview
                appIcon={application.icon}
                windowId={window.id}
              />
            </div>
          )
        })}
        <div>
          <DockTooltip
            arrowEdge={dockTooltipArrowEdge}
            className={styles['dock-tooltip']}
            label="Trash"
          />
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
        zIndex={Z_INDEX.DOCK_MENU}
        onClose={() => {
          setDockMenu(null)
        }}
        onSelect={onDockMenuSelect}
      />
    </>
  )
}

export default Dock
