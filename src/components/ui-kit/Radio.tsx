import type { ReactNode } from 'react'
import { useWindowFocus } from '~/components/Window/FocusContext'

interface RadioProps {
  checked?: boolean
  disabled?: boolean
  label?: ReactNode
  name?: string
  onChange?: () => void
}

function Radio(props: RadioProps) {
  const {
    checked = false,
    disabled = false,
    label,
    name,
    onChange,
  } = props
  const focused = useWindowFocus()?.focused ?? true
  const activeClass = focused
    ? 'border-[var(--system-color-solid,#ef5ba1)] bg-[var(--system-color-solid,#ef5ba1)]'
    : 'border-#bcbcbc bg-#bcbcbc'

  return (
    <button
      aria-checked={checked}
      className={`group inline-flex w-fit max-w-full items-center gap-[.42rem] border-0 bg-transparent p-0 text-left [font:inherit] ${disabled ? 'opacity-45 cursor-default' : 'cursor-default'}`}
      disabled={disabled}
      name={name}
      onClick={onChange}
      role="radio"
      type="button"
    >
      <span
        className={`relative flex-[0_0_.72rem] h-[.72rem] w-[.72rem] rounded-full border shadow-[inset_0_.04rem_.12rem_#0000001f] ${
          checked ? activeClass : 'border-#bcbcbc bg-white'
        }`}
      >
        {checked ? <span className="absolute left-1/2 top-1/2 h-[.28rem] w-[.28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" /> : null}
      </span>
      {label ? <span className="min-w-0 text-[.84rem] leading-[1.08rem] text-#2f2f2f">{label}</span> : null}
    </button>
  )
}

export default Radio
