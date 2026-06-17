import type { KeyboardEvent, PointerEvent } from 'react'

interface SliderProps {
  ariaLabel: string
  value: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onChange?: (value: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function Slider(props: SliderProps) {
  const {
    ariaLabel,
    value,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    onChange,
  } = props
  const trackRef = useRef<HTMLDivElement>(null)
  const rawPercentage = max === min ? 0 : ((value - min) / (max - min)) * 100
  const percentage = Math.min(100, Math.max(0, rawPercentage))

  const updateValue = (clientX: number) => {
    if (disabled) return

    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return

    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    const steppedValue = min + Math.round(((ratio * (max - min)) / step)) * step
    onChange?.(clamp(steppedValue, min, max))
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateValue(event.clientX)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    updateValue(event.clientX)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    const nextValue = (() => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          return value - step
        case 'ArrowRight':
        case 'ArrowUp':
          return value + step
        case 'Home':
          return min
        case 'End':
          return max
        default:
          return null
      }
    })()

    if (nextValue === null) return

    event.preventDefault()
    onChange?.(clamp(nextValue, min, max))
  }

  return (
    <div
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      className={`relative h-5 w-full cursor-default touch-none outline-none ${disabled ? 'opacity-45' : ''}`}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
    >
      <div
        className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full"
        style={{
          background: 'var(--system-settings-slider-track, #d7d7d7)',
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: 'var(--system-settings-slider-fill, #b8b8b8)',
            width: `${percentage}%`,
          }}
        />
      </div>
      <span
        className="pointer-events-none absolute top-1/2 h-4 w-3 -translate-x-1/2 -translate-y-1/2 rounded border"
        style={{
          background: 'var(--system-settings-slider-thumb, #ffffff)',
          borderColor: 'var(--system-settings-slider-thumb-border, rgba(0, 0, 0, 0.16))',
          boxShadow: '0 .08rem .18rem var(--system-settings-slider-thumb-shadow, rgba(0, 0, 0, 0.22))',
          left: `${percentage}%`,
        }}
      />
    </div>
  )
}

export default Slider
