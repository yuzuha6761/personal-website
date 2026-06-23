import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useSystemAppearanceDarkMode } from '~/hooks/useSystemAppearanceDarkMode'
import './Button.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  trailing?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { className, trailing, type = 'button', children, ...rest } = props
  const isDarkMode = useSystemAppearanceDarkMode()

  return (
    <button
      className={`ui-kit-button box-border ${trailing ? 'ui-kit-button--has-trailing' : ''} ${className ?? ''}`}
      data-button-appearance={isDarkMode ? 'dark' : 'light'}
      ref={ref}
      type={type}
      {...rest}
    >
      {children}
      {trailing && (
        <span className="ui-kit-button__trailing">
          {trailing}
        </span>
      )}
    </button>
  )
})

export default Button
