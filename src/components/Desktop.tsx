import MenuBar from "./MenuBar.tsx";
import { wallpaper } from "../constants/preloadAssets";
import useWindowStore from "../stores/window";
import ApplicationWindow from "./ApplicationWindow";
import ContextualMenu, { type ContextualMenuItem } from "./ContextualMenu";

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

function Desktop() {
  const windows = useWindowStore((state) => state.windows)
  const activeWindowId = useWindowStore((state) => state.activeWindowId)
  const closeWindow = useWindowStore((state) => state.closeWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [contextMenuOpen, setContextMenuOpen] = useState(false)

  useEffect(() => {

  }, [])

  const onDesktopContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return

    event.preventDefault()
    setContextMenuPosition({ x: event.clientX, y: event.clientY })
    setContextMenuOpen(true)
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-no-repeat bg-center bg-cover"
      onContextMenu={onDesktopContextMenu}
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <MenuBar />
      {windows.map((window) => (
        <ApplicationWindow
          active={activeWindowId === window.id}
          key={window.id}
          window={window}
          onClose={closeWindow}
          onFocus={focusWindow}
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
