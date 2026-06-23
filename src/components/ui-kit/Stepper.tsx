import { Minus, Plus } from 'lucide-react'
import { useSystemAppearanceDarkMode } from '~/hooks/useSystemAppearanceDarkMode'
import { AppIcon } from '~/components/icons/AppIcon'
import './Stepper.scss'

interface StepperProps {
  onIncrement?: () => void
  onDecrement?: () => void
  incrementDisabled?: boolean
  decrementDisabled?: boolean
}

const stepperButtonClass = 'w-[1.42rem] h-[1.42rem] border-0 rounded-[.28rem] p-0 cursor-default flex items-center justify-center'

function Stepper(props: StepperProps) {
  const {
    onIncrement,
    onDecrement,
    incrementDisabled = false,
    decrementDisabled = false,
  } = props
  const isDarkMode = useSystemAppearanceDarkMode()

  return (
    <div className="inline-flex items-center gap-[.18rem]" data-stepper-appearance={isDarkMode ? 'dark' : 'light'}>
      <button
        aria-label="Decrease"
        className={`${stepperButtonClass} ${decrementDisabled ? 'bg-[var(--stepper-disabled-bg,#e8e8e8)] text-[var(--stepper-disabled-text,#b0b0b0)]' : 'bg-[var(--system-color-solid,#ef5ba1)] text-white'}`}
        disabled={decrementDisabled}
        onClick={onDecrement}
        type="button"
      >
        <AppIcon className="w-[.72rem] h-[.72rem]" icon={Minus} strokeWidth={2.5} />
      </button>
      <button
        aria-label="Increase"
        className={`${stepperButtonClass} ${incrementDisabled ? 'bg-[var(--stepper-disabled-bg,#e8e8e8)] text-[var(--stepper-disabled-text,#b0b0b0)]' : 'bg-[var(--stepper-control-bg,#f3f3f3)] text-[var(--stepper-muted-text,#8a8a8a)] border border-[var(--stepper-control-border,#d8d8d8)]'}`}
        disabled={incrementDisabled}
        onClick={onIncrement}
        type="button"
      >
        <AppIcon className="w-[.72rem] h-[.72rem]" icon={Plus} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default Stepper
