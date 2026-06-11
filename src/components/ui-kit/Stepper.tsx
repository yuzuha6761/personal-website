import { Minus, Plus } from 'lucide-react'
import { AppIcon } from '../icons/AppIcon'

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

  return (
    <div className="inline-flex items-center gap-[.18rem]">
      <button
        aria-label="Decrease"
        className={`${stepperButtonClass} ${decrementDisabled ? 'bg-#e8e8e8 text-#b0b0b0' : 'bg-#c13584 text-white'}`}
        disabled={decrementDisabled}
        onClick={onDecrement}
        type="button"
      >
        <AppIcon className="w-[.72rem] h-[.72rem]" icon={Minus} strokeWidth={2.5} />
      </button>
      <button
        aria-label="Increase"
        className={`${stepperButtonClass} ${incrementDisabled ? 'bg-#e8e8e8 text-#b0b0b0' : 'bg-#f3f3f3 text-#8a8a8a border border-#d8d8d8'}`}
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
