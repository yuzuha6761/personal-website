import { createContext, useContext } from 'react'

export interface ApplicationWindowFocusContextValue {
  focused: boolean
  windowId: string
}

export const ApplicationWindowFocusContext = createContext<ApplicationWindowFocusContextValue | null>(null)

export function useApplicationWindowFocus() {
  return useContext(ApplicationWindowFocusContext)
}
