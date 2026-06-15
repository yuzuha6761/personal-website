import { useWindowFocus } from '../Window/FocusContext'

interface SwitchProps {
  checked?: boolean
  disabled?: boolean
  ariaLabel?: string
  onChange?: (checked: boolean) => void
}

function Switch(props: SwitchProps) {
  const {
    checked = false,
    disabled = false,
    ariaLabel,
    onChange,
  } = props
  const focused = useWindowFocus()?.focused ?? true
  const trackClass = checked
    ? focused
      ? 'bg-[var(--system-color-solid,#ef5ba1)] shadow-[inset_0_0_0_1px_var(--system-color-solid,#ef5ba1)]'
      : 'bg-#d3d3d3 shadow-[inset_0_0_0_1px_#c0c0c0]'
    : 'bg-#d5d5d5 shadow-[inset_0_0_0_1px_#bdbdbd]'

  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`relative h-[1.24rem] w-[2.18rem] rounded-full border-0 p-0 cursor-default transition-colors duration-150 ${trackClass} ${disabled ? 'opacity-45' : ''}`}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`absolute top-[.1rem] h-[1.04rem] w-[1.04rem] rounded-full bg-white shadow-[0_.07rem_.16rem_#00000040] transition-transform duration-150 ${checked ? 'translate-x-[1.04rem]' : 'translate-x-[.1rem]'}`}
      />
    </button>
  )
}

export default Switch
