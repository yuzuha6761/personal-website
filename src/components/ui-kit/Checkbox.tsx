import type { ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import { useSystemAppearanceDarkMode } from '~/hooks/useSystemAppearanceDarkMode'
import { AppIcon } from '~/components/icons/AppIcon'
import { useWindowFocus } from '~/components/Window/FocusContext'
import './Checkbox.scss'

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

const CHECKBOX_BOX_CLASS =
  'box-border size-4 shrink-0 rounded-[.22rem] border border-solid p-0 flex items-center justify-center overflow-hidden leading-none'
const CHECKBOX_INACTIVE_BOX_CLASS =
  'checkbox-box--inactive border-[var(--checkbox-empty-border,#b8b8b8)] bg-[var(--checkbox-empty-bg,#ffffff)]'
const CHECKBOX_DISABLED_BOX_CLASS = 'checkbox-box--disabled'
const CHECKBOX_DISABLED_CHECKED_BOX_CLASS = 'checkbox-box--disabled-checked'
const CHECKBOX_CHECKED_FOCUSED_CLASS =
  'border-[var(--system-color-solid,#ef5ba1)] bg-[var(--system-color-solid,#ef5ba1)] shadow-[inset_0_1px_3px_#0000001f]'
const CHECKBOX_ICON_SLOT_CLASS = 'flex size-[.82rem] shrink-0 items-center justify-center'
const CHECKBOX_ICON_CLASS = 'size-[.82rem] shrink-0 block'

function Checkbox(props: CheckboxProps) {
  const {
    checked = false,
    indeterminate = false,
    label,
    description,
    disabled = false,
    onChange,
  } = props
  const focused = useWindowFocus()?.focused ?? true
  const isDarkMode = useSystemAppearanceDarkMode()
  const active = checked || indeterminate
  const boxClass = disabled
    ? active
      ? CHECKBOX_DISABLED_CHECKED_BOX_CLASS
      : CHECKBOX_DISABLED_BOX_CLASS
    : active && focused
      ? CHECKBOX_CHECKED_FOCUSED_CLASS
      : CHECKBOX_INACTIVE_BOX_CLASS
  const iconClass = disabled
    ? active ? 'text-white opacity-75' : ''
    : active
      ? focused ? 'text-white' : 'text-#262626'
      : ''
  const icon = indeterminate
    ? <AppIcon className={`${CHECKBOX_ICON_CLASS} ${iconClass}`} icon={Minus} strokeWidth={3} />
    : checked
      ? <AppIcon className={`${CHECKBOX_ICON_CLASS} ${iconClass}`} icon={Check} strokeWidth={3} />
      : null

  return (
    <div
      className="flex max-w-full flex-col gap-[.35rem]"
      data-checkbox-appearance={isDarkMode ? 'dark' : 'light'}
      data-checkbox-disabled={disabled ? 'true' : undefined}
    >
      <label
        className="flex w-full min-w-0 max-w-full min-h-[1.28rem] items-center gap-[.55rem] cursor-default"
      >
        <button
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-disabled={disabled}
          className={`${CHECKBOX_BOX_CLASS} ${boxClass}`}
          disabled={disabled}
          onClick={() => {
            if (disabled) return
            onChange?.(!checked)
          }}
          role="checkbox"
          type="button"
        >
          <span className={CHECKBOX_ICON_SLOT_CLASS}>
            {icon}
          </span>
        </button>
        {label ? <span className="min-w-0 text-[.84rem] leading-[1.28rem] text-[var(--checkbox-label-text,#2f2f2f)]">{label}</span> : null}
      </label>
      {description ? (
        <div className="pl-[1.55rem] text-[.76rem] leading-[1.2rem] text-[var(--checkbox-description-text,#8a8a8a)]">
          {description}
        </div>
      ) : null}
    </div>
  )
}

export default Checkbox
