import { createContext, useContext } from 'react'

export interface ResizeOptions {
  animate?: boolean
  duration?: number
}

export interface ResizeContextValue {
  setWindowHeight: (height: number, options?: ResizeOptions) => void
}

export const ResizeContext = createContext<ResizeContextValue | null>(null)

export function useWindowResize() {
  return useContext(ResizeContext)
}
