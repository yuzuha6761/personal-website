import type { ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import { AppIcon } from '../icons/AppIcon'
import { useWindowFocus } from '../Window/FocusContext'

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  label?: ReactNode
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

const checkboxBaseClass = 'flex-[0_0_1rem] w-4 h-4 rounded-[.22rem] border flex items-center justify-center'
const checkboxInactiveBoxClass = 'border-#b8b8b8 bg-white shadow-[inset_0_1px_3px_#0000002e,inset_0_0_0_1px_#00000014]'

function Checkbox(props: CheckboxProps) {
  const {
    checked = false,
    indeterminate = false,
    label,
    disabled = false,
    onChange,
  } = props
  const focused = useWindowFocus()?.focused ?? true
  const active = checked || indeterminate
  const boxClass = active && focused
    ? 'border-[var(--system-color-solid,#ef5ba1)] bg-[var(--system-color-solid,#ef5ba1)]'
    : checkboxInactiveBoxClass
  const iconClass = active
    ? focused ? 'text-white' : 'text-#262626'
    : ''

  return (
    <label className={`inline-flex w-fit max-w-full self-start items-start gap-[.55rem] ${disabled ? 'opacity-45 cursor-default' : 'cursor-default'}`}>
      <button
        aria-checked={indeterminate ? 'mixed' : checked}
        className={`${checkboxBaseClass} ${boxClass} border-0 p-0 mt-[.08rem]`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        role="checkbox"
        type="button"
      >
        {indeterminate
          ? <AppIcon className={`w-[.82rem] h-[.82rem] ${iconClass}`} icon={Minus} strokeWidth={3} />
          : checked
            ? <AppIcon className={`w-[.82rem] h-[.82rem] ${iconClass}`} icon={Check} strokeWidth={3} />
            : null}
      </button>
      {label ? <span className="min-w-0 text-[.84rem] leading-[1.28rem] text-#2f2f2f">{label}</span> : null}
    </label>
  )
}

export default Checkbox
