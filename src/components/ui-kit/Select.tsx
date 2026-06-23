import { useId, useMemo, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronsUpDown } from 'lucide-react'
import { getRootFontSize } from '~/services/window'
import { useSystemAppearanceDarkMode } from '~/hooks/useSystemAppearanceDarkMode'
import ContextualMenu, { type ContextualMenuItem } from '~/components/ContextualMenu'
import { AppIcon } from '~/components/icons/AppIcon'
import Button from './Button'
import './Select.scss'

const MENU_ROW_LEFT_OFFSET_REM = 0.48 + 1.35
const MENU_PANEL_TOP_PADDING_REM = 0.4
const MENU_ROW_HEIGHT_REM = 1.55
const MENU_SEPARATOR_BLOCK_HEIGHT_REM = 0.77

function getRowsOffsetBeforeIndex(options: SelectOption[], index: number) {
  return options.slice(0, index).reduce((total, option) => (
    total + (isSelectSeparator(option) ? MENU_SEPARATOR_BLOCK_HEIGHT_REM : MENU_ROW_HEIGHT_REM)
  ), 0)
}

export interface SelectActionOption {
  value: string
  label: string
  icon?: ReactNode
  menuIcon?: LucideIcon
  menuIconNode?: ReactNode
  disabled?: boolean
}

export interface SelectSeparatorOption {
  type: 'separator'
  id?: string
}

export type SelectOption = SelectActionOption | SelectSeparatorOption

function isSelectSeparator(option: SelectOption): option is SelectSeparatorOption {
  return 'type' in option && option.type === 'separator'
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
  const selectedOption = options.find(
    (option): option is SelectActionOption => !isSelectSeparator(option) && option.value === value,
  ) ?? options.find((option): option is SelectActionOption => !isSelectSeparator(option))

  const menuItems = useMemo<ContextualMenuItem[]>(() => (
    options.map((option, index) => {
      if (isSelectSeparator(option)) {
        return { id: option.id ?? `select-separator-${index}`, type: 'separator' as const }
      }

      return {
        id: option.value,
        label: option.label,
        checkable: true,
        checked: option.value === value,
        disabled: option.disabled,
        icon: option.menuIcon,
        iconNode: option.menuIconNode,
      }
    })
  ), [options, value])

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const rootFontSize = getRootFontSize()
    const selectedIndex = Math.max(0, options.findIndex(
      (option) => !isSelectSeparator(option) && option.value === value,
    ))
    const rowsOffsetRem = getRowsOffsetBeforeIndex(options, selectedIndex)
    const triggerRowInsetPx = (rect.height - MENU_ROW_HEIGHT_REM * rootFontSize) / 2

    setMenuPosition({
      x: rect.left - MENU_ROW_LEFT_OFFSET_REM * rootFontSize,
      y: rect.top + triggerRowInsetPx - (MENU_PANEL_TOP_PADDING_REM + rowsOffsetRem) * rootFontSize,
    })
    setMenuOpen(true)
  }

  return (
    <div className="relative w-full" data-select-appearance={isDarkMode ? 'dark' : 'light'}>
      <Button
        className="w-full"
        onClick={openMenu}
        ref={triggerRef}
        trailing={
          <AppIcon className="w-[.62rem] h-[.62rem] text-white" icon={ChevronsUpDown} strokeWidth={2.5} />
        }
      >
        {selectedOption?.icon}
        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[.82rem] text-[var(--select-text)]">
          {selectedOption?.label}
        </span>
      </Button>
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
