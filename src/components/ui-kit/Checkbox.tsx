import type { ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import { AppIcon } from '../icons/AppIcon'

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  label?: ReactNode
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

const checkboxBaseClass = 'flex-[0_0_1rem] w-4 h-4 rounded-[.22rem] border flex items-center justify-center'

function Checkbox(props: CheckboxProps) {
  const {
    checked = false,
    indeterminate = false,
    label,
    disabled = false,
    onChange,
  } = props
  const active = checked || indeterminate
  const boxClass = active
    ? 'border-#c13584 bg-#c13584'
    : 'border-#b8b8b8 bg-white'

  return (
    <label className={`inline-flex items-start gap-[.55rem] ${disabled ? 'opacity-45 cursor-default' : 'cursor-default'}`}>
      <button
        aria-checked={indeterminate ? 'mixed' : checked}
        className={`${checkboxBaseClass} ${boxClass} border-0 p-0 mt-[.08rem]`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        role="checkbox"
        type="button"
      >
        {indeterminate
          ? <AppIcon className="w-[.62rem] h-[.62rem] text-white" icon={Minus} strokeWidth={3} />
          : checked
            ? <AppIcon className="w-[.62rem] h-[.62rem] text-white" icon={Check} strokeWidth={3} />
            : null}
      </button>
      {label ? <span className="min-w-0 text-[.84rem] leading-[1.28rem] text-#2f2f2f">{label}</span> : null}
    </label>
  )
}

export default Checkbox
