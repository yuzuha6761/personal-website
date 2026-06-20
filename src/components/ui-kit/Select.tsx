import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronsUpDown } from 'lucide-react'
import { useSystemAppearanceDarkMode } from '../../hooks/useSystemAppearanceDarkMode'
import ContextualMenu, { type ContextualMenuItem } from '../ContextualMenu'
import { AppIcon } from '../icons/AppIcon'
import './Select.scss'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  menuIcon?: LucideIcon
}

interface SelectProps {
  value: string
  options: SelectOption[]
  onChange?: (value: string) => void
}

function Select(props: SelectProps) {
  const { value, options, onChange } = props
  const isDarkMode = useSystemAppearanceDarkMode()
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  const menuItems = useMemo<ContextualMenuItem[]>(() => (
    options.map((option) => ({
      id: option.value,
      label: option.label,
      checkable: true,
      checked: option.value === value,
      icon: option.menuIcon,
    }))
  ), [options, value])

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    setMenuPosition({ x: rect.left, y: rect.bottom + 4 })
    setMenuOpen(true)
  }

  return (
    <div className="relative w-full" data-select-appearance={isDarkMode ? 'dark' : 'light'}>
      <button
        className="relative w-full h-[1.72rem] box-border rounded-[.42rem] border border-[var(--select-control-border,#d2d2d2)] bg-[var(--select-control-bg,#ffffff)] pl-[.55rem] pr-[2rem] flex items-center gap-[.42rem] cursor-default"
        onClick={openMenu}
        ref={triggerRef}
        type="button"
      >
        {selectedOption?.icon}
        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[.82rem] text-[var(--select-text,#2f2f2f)]">
          {selectedOption?.label}
        </span>
        <div className="absolute right-[.28rem] top-1/2 -translate-y-1/2 w-[1.15rem] h-[1.15rem] rounded-[.22rem] bg-[var(--system-color-solid,#ef5ba1)] flex items-center justify-center pointer-events-none">
          <AppIcon className="w-[.58rem] h-[.58rem] text-white" icon={ChevronsUpDown} strokeWidth={2.5} />
        </div>
      </button>
      <ContextualMenu
        id={menuId}
        items={menuItems}
        open={menuOpen}
        position={menuPosition}
        zIndex={10000}
        onClose={() => setMenuOpen(false)}
        onSelect={({ item }) => onChange?.(item.id)}
      />
    </div>
  )
}

export default Select
