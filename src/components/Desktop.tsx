import type { MouseEvent as ReactMouseEvent } from 'react'
import MenuBar from "./MenuBar.tsx";
import useShellStore from "../stores/shell";
import useWindowStore from "../stores/window";
import Window from './Window'
import ContextualMenu, { type ContextualMenuItem } from "./ContextualMenu";

interface DesktopSelectionBox {
  currentX: number
  currentY: number
  fading: boolean
  startX: number
  startY: number
}

const desktopContextMenuItems: ContextualMenuItem[] = [
  { id: 'new-folder', label: '新建文件夹' },
  { id: 'divider-1', type: 'separator' },
  { id: 'show-intro', label: '显示简介' },
  { id: 'change-wallpaper', label: '更改墙纸...' },
  { id: 'edit-widgets', label: '编辑小组件...' },
  { id: 'divider-2', type: 'separator' },
  { id: 'use-stacks', label: '使用叠放' },
  {
    id: 'sort-by',
    label: '排序方式',
    children: [
      { id: 'sort-none', label: '无', checkable: true, checked: true },
      { id: 'sort-name', label: '名称', checkable: true },
      { id: 'sort-kind', label: '种类', checkable: true },
      { id: 'sort-date', label: '添加日期', checkable: true },
      { id: 'sort-size', label: '大小', checkable: true },
    ],
  },
  { id: 'clean-up', label: '整理' },
  {
    id: 'clean-up-by',
    label: '整理方式',
    children: [
      { id: 'clean-name', label: '名称' }, 
      { id: 'clean-kind', label: '种类' },
      { id: 'clean-date', label: '修改日期' },
      { id: 'clean-size', label: '大小' },
    ],
  },
  { id: 'show-view-options', label: '查看显示选项' },
  { id: 'divider-3', type: 'separator' },
  {
    id: 'import-from-device',
    label: '从 iPhone 或 iPad 导入',
    children: [
      { id: 'take-photo', label: '拍照' },
      { id: 'scan-documents', label: '扫描文稿' },
      { id: 'add-sketch', label: '添加速绘' },
    ],
  },
]

const SELECTION_FADE_DURATION = 300

function Desktop() {
  const wallpaper = useShellStore((state) => state.wallpaper)
  const windows = useWindowStore((state) => state.windows)
  const focusedTarget = useWindowStore((state) => state.focusedTarget)
  const closeWindow = useWindowStore((state) => state.closeWindow)
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow)
  const updateWindowFrame = useWindowStore((state) => state.updateWindowFrame)
  const focusDesktop = useWindowStore((state) => state.focusDesktop)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [selectionBox, setSelectionBox] = useState<DesktopSelectionBox | null>(null)
  const [minimizingWindowIds, setMinimizingWindowIds] = useState<Set<string>>(() => new Set())
  const selectionActiveRef = useRef(false)
  const selectionClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSelectionTimers = useCallback(() => {
    if (selectionClearTimerRef.current) {
      clearTimeout(selectionClearTimerRef.current)
      selectionClearTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!selectionActiveRef.current) return

      setSelectionBox((currentSelectionBox) => {
        if (!currentSelectionBox) return currentSelectionBox

        return {
          ...currentSelectionBox,
          currentX: event.clientX,
          currentY: event.clientY,
        }
      })
    }

    const handleMouseUp = () => {
      if (!selectionActiveRef.current) return

      selectionActiveRef.current = false
      clearSelectionTimers()

      setSelectionBox((currentSelectionBox) => (
        currentSelectionBox
          ? { ...currentSelectionBox, fading: true }
          : currentSelectionBox
      ))

      selectionClearTimerRef.current = setTimeout(() => {
        setSelectionBox(null)
      }, SELECTION_FADE_DURATION)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      clearSelectionTimers()
    }
  }, [clearSelectionTimers])

  const onDesktopMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (event.target !== event.currentTarget) return

    event.preventDefault()
    clearSelectionTimers()
    focusDesktop()
    setContextMenuOpen(false)
    selectionActiveRef.current = true
    setSelectionBox({
      currentX: event.clientX,
      currentY: event.clientY,
      fading: false,
      startX: event.clientX,
      startY: event.clientY,
    })
  }

  const onDesktopContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return

    event.preventDefault()
    focusDesktop()
    setContextMenuPosition({ x: event.clientX, y: event.clientY })
    setContextMenuOpen(true)
  }

  const onWindowMinimize = useCallback((windowId: string) => {
    setMinimizingWindowIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.add(windowId)
      return nextIds
    })
    minimizeWindow(windowId)
  }, [minimizeWindow])

  const onWindowMinimizeAnimationEnd = useCallback((windowId: string) => {
    setMinimizingWindowIds((currentIds) => {
      if (!currentIds.has(windowId)) return currentIds

      const nextIds = new Set(currentIds)
      nextIds.delete(windowId)
      return nextIds
    })
  }, [])

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-no-repeat bg-center bg-cover"
      onContextMenu={onDesktopContextMenu}
      onMouseDown={onDesktopMouseDown}
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <MenuBar />
      {selectionBox && (
        <div
          className="pointer-events-none absolute box-border"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
            zIndex: 0,
            opacity: selectionBox.fading ? 0 : 1,
            transition: selectionBox.fading
              ? `opacity ${SELECTION_FADE_DURATION}ms ease-out`
              : 'none',
            border: '1px solid rgb(230 235 245 / 62%)',
            backgroundColor: 'rgb(208 218 235 / 18%)',
            boxShadow: 'inset 0 0 0 1px rgb(30 40 60 / 18%)',
          }}
        />
      )}
      {windows.filter((window) => !window.minimized || minimizingWindowIds.has(window.id)).map((window) => (
        <Window
          active={focusedTarget.type === 'window' && focusedTarget.windowId === window.id}
          key={window.id}
          minimizing={window.minimized && minimizingWindowIds.has(window.id)}
          window={window}
          onClose={closeWindow}
          onFocus={focusWindow}
          onFrameChange={updateWindowFrame}
          onMinimize={onWindowMinimize}
          onMinimizeAnimationEnd={onWindowMinimizeAnimationEnd}
        />
      ))}
      <ContextualMenu
        id="desktop-context-menu"
        items={desktopContextMenuItems}
        open={contextMenuOpen}
        position={contextMenuPosition}
        onClose={() => setContextMenuOpen(false)}
      />
    </div>
  )
}

export default Desktop
