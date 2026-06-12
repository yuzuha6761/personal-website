import { createContext, useContext } from 'react'

export interface FocusContextValue {
  focused: boolean
  windowId: string
}

export const FocusContext = createContext<FocusContextValue | null>(null)

export function useWindowFocus() {
  return useContext(FocusContext)
}
