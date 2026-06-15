import type { ReactNode } from 'react'

interface SettingsRowProps {
  label: ReactNode
  children: ReactNode
  className?: string
}

function SettingsRow(props: SettingsRowProps) {
  const { label, children, className = '' } = props

  return (
    <div className={`min-h-[2.35rem] px-[.7rem] py-[.46rem] flex items-center justify-between gap-[1rem] ${className}`}>
      <div className="min-w-0 text-[.86rem] leading-[1.16rem] text-#1f1f1f">{label}</div>
      <div className="shrink-0 flex items-center justify-end">{children}</div>
    </div>
  )
}

export default SettingsRow
