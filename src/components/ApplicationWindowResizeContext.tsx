import { createContext, useContext } from 'react'

export interface ApplicationWindowResizeOptions {
  animate?: boolean
  duration?: number
}

export interface ApplicationWindowResizeContextValue {
  setWindowHeight: (height: number, options?: ApplicationWindowResizeOptions) => void
}

export const ApplicationWindowResizeContext = createContext<ApplicationWindowResizeContextValue | null>(null)

export function useApplicationWindowResize() {
  return useContext(ApplicationWindowResizeContext)
}
