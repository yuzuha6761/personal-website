import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'

interface AppIconProps {
  icon: LucideIcon
  className?: string
  scale?: number
  strokeWidth?: number
  style?: CSSProperties
}

export function AppIcon({
  icon: Icon,
  className,
  scale = 1,
  strokeWidth = 2,
  style,
}: AppIconProps) {
  return (
    <Icon
      aria-hidden
      className={className}
      strokeWidth={strokeWidth}
      style={{
        ...style,
        transform: scale === 1 ? style?.transform : `scale(${scale})`,
        transformOrigin: 'center',
      }}
    />
  )
}
