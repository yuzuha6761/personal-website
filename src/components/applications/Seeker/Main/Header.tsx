import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import ContextualMenu, { type ContextualMenuItem, type ContextualMenuSelectEvent } from '~/components/ContextualMenu'
import { AppIcon } from '~/components/icons/AppIcon'
import { dragExcludeProps, dragHandleProps } from '~/components/Window/Drag'
import { useWindowFocus } from '~/components/Window/FocusContext'
import useFsStore from '~/fs'
import {
  buildSeekerPathChain,
  getSeekerPathLabel,
} from '~/components/applications/Seeker/virtualFolders'
import { getRootFontSize } from '~/services/window'
import { getPathContextMenuIcon, getPathTitleIcon } from '~/components/applications/Seeker/pathIcons'
import { seekerIcons } from '~/components/applications/Seeker/icons'
import { useSeekerWindow } from '~/components/applications/Seeker/useSeekerWindow'
import { resolveSeekerNewWindowPath } from '~/components/applications/Seeker/newWindowPath'
import useSeekerGlobalStore from '~/components/applications/Seeker/store'
import useSeekerWindowStore from './store'
import { HeaderToolbarArea } from './HeaderToolbar'

const historyIconClass = 'w-[1.4rem] h-[1.4rem]'
const PATH_MENU_ROW_LEFT_OFFSET_REM = 0.48 + 1.35
const PATH_MENU_PANEL_TOP_PADDING_REM = 0.4
const TITLE_ICON_REVEAL_DURATION_MS = 200
const TITLE_ICON_WIDTH_REM = 1.15
const TITLE_ICON_GAP_REM = 0.25

interface HistoryButtonProps {
  ariaLabel: string
  disabled: boolean
  focused: boolean
  icon: LucideIcon
  onClick: () => void
}

function HistoryButton(props: HistoryButtonProps) {
  const { ariaLabel, disabled, focused, icon, onClick } = props
  const enabledIconClass = focused ? 'text-#808080 group-hover:text-#666666 group-active:text-#595959' : 'text-#b8b8b8 group-hover:text-#9a9a9a group-active:text-#878787'
  const disabledIconClass = focused ? 'text-#808080' : 'text-#b8b8b8'

  return (
    <button
      aria-label={ariaLabel}
      className={`group rounded-[.48rem] p-[.14rem] border-0 bg-transparent cursor-default ${
        disabled
          ? 'opacity-40'
          : 'hover:bg-#e3e2e2 active:bg-#d5d4d5'
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
      {...dragExcludeProps}
    >
      <AppIcon
        className={`${historyIconClass} ${disabled ? disabledIconClass : enabledIconClass}`}
        icon={icon}
      />
    </button>
  )
}

function Header() {
  const focused = useWindowFocus()?.focused ?? true
  const windowId = useWindowFocus()?.windowId
  const pathMenuId = useId()
  const titleRef = useRef<HTMLSpanElement>(null)
  const pathMenuPathsRef = useRef<string[]>([])
  const headerRowRef = useRef<HTMLDivElement>(null)
  const leadingRef = useRef<HTMLDivElement>(null)
  const [pathMenuOpen, setPathMenuOpen] = useState(false)
  const [pathMenuPaths, setPathMenuPaths] = useState<string[]>([])
  const [pathMenuPosition, setPathMenuPosition] = useState({ x: 0, y: 0 })
  const [titleHovered, setTitleHovered] = useState(false)
  const {
    windowState,
    goBack,
    goForward,
  } = useSeekerWindow()
  const nodes = useFsStore((state) => state.nodes)
  const newWindowPathOption = useSeekerGlobalStore((state) => state.newWindowPathOption)
  const defaultTabPath = resolveSeekerNewWindowPath(newWindowPathOption)
  const activeTab = windowState?.tabs.find((tab) => tab.id === windowState.activeTabId)
  const currentPath = activeTab?.path ?? defaultTabPath
  const canGoBack = (windowState?.historyBack.length ?? 0) > 0
  const canGoForward = (windowState?.historyForward.length ?? 0) > 0

  const pathMenuItems = useMemo<ContextualMenuItem[]>(() => (
    pathMenuPaths.map((path, index) => ({
      id: `path-${index}`,
      label: getSeekerPathLabel(path, nodes),
      checked: index === 0,
      checkable: true,
      ...getPathContextMenuIcon(path),
    }))
  ), [pathMenuPaths, nodes])

  const titleLabel = activeTab?.label ?? 'yuzuha'

  const titleColorClass = focused
    ? 'text-[var(--seeker-header-title-focused)]'
    : 'text-[var(--seeker-header-title-unfocused)]'
  const headerBgClass = focused
    ? 'bg-[var(--seeker-header-focused)]'
    : 'bg-[var(--seeker-header-unfocused)]'

  const openPathMenu = useCallback(() => {
    const titleRect = titleRef.current?.getBoundingClientRect()
    if (!titleRect) return

    const paths = buildSeekerPathChain(currentPath)
    pathMenuPathsRef.current = paths
    setPathMenuPaths(paths)

    const rootFontSize = getRootFontSize()
    setPathMenuPosition({
      x: titleRect.left - (PATH_MENU_ROW_LEFT_OFFSET_REM * rootFontSize),
      y: titleRect.top - (PATH_MENU_PANEL_TOP_PADDING_REM * rootFontSize),
    })
    setPathMenuOpen(true)
  }, [currentPath])

  const handleTitleContextMenu = useCallback((event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()
    openPathMenu()
  }, [openPathMenu])

  const handlePathMenuSelect = useCallback((event: ContextualMenuSelectEvent) => {
    const index = Number.parseInt(event.item.id.replace('path-', ''), 10)
    if (Number.isNaN(index)) return

    const path = pathMenuPathsRef.current[index]
    if (!path || !windowId) return

    const store = useSeekerWindowStore.getState()
    store.initWindow(windowId)
    store.navigateTo(windowId, path)
  }, [windowId])

  return (
    <header className={`min-w-0 w-full flex-[0_0_auto] ${headerBgClass}`}>
      <div
        className="box-border flex h-[3.65rem] w-full min-w-0 items-center overflow-hidden px-[.95rem] pl-[1.1rem]"
        ref={headerRowRef}
      >
        <div className="flex w-[5.1rem] shrink-0 items-center gap-[1.08rem]" ref={leadingRef}>
          <HistoryButton
            ariaLabel="后退"
            disabled={!canGoBack}
            focused={focused}
            icon={seekerIcons.chevronLeft}
            onClick={goBack}
          />
          <HistoryButton
            ariaLabel="前进"
            disabled={!canGoForward}
            focused={focused}
            icon={seekerIcons.chevronRight}
            onClick={goForward}
          />
        </div>

        <div
          className="min-w-[7.5rem] flex-1 flex items-center min-w-0"
          {...dragHandleProps}
        >
          <div
            className="flex min-w-0 max-w-full items-center"
            onContextMenu={handleTitleContextMenu}
            onMouseEnter={() => setTitleHovered(true)}
            onMouseLeave={() => setTitleHovered(false)}
          >
            <span
              aria-hidden={!titleHovered}
              className="flex shrink-0 items-center justify-center overflow-hidden transition-[width,margin,opacity] ease-out"
              style={{
                width: titleHovered ? `${TITLE_ICON_WIDTH_REM}rem` : 0,
                marginRight: titleHovered ? `${TITLE_ICON_GAP_REM}rem` : 0,
                opacity: titleHovered ? 1 : 0,
                transitionDuration: `${TITLE_ICON_REVEAL_DURATION_MS}ms`,
              }}
            >
              {getPathTitleIcon(currentPath, titleColorClass)}
            </span>
            <span
              className={`truncate ${titleColorClass} text-[1.04rem] font-[760] cursor-default select-none`}
              ref={titleRef}
            >
              {titleLabel}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 shrink-0 justify-end overflow-visible">
          <HeaderToolbarArea focused={focused} headerRowRef={headerRowRef} leadingRef={leadingRef} />
        </div>
      </div>

      <ContextualMenu
        id={pathMenuId}
        items={pathMenuItems}
        open={pathMenuOpen}
        position={pathMenuPosition}
        zIndex={10000}
        onClose={() => setPathMenuOpen(false)}
        onSelect={handlePathMenuSelect}
      />
    </header>
  )
}

export default Header
