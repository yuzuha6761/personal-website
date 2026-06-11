import { useCallback, useMemo } from 'react'
import useSeekerWindowStore from './store/window'
import type { SeekerViewMode, SeekerWindowState } from './store/types'
import { useApplicationWindowFocus } from '../../ApplicationWindowFocusContext'

export function useSeekerWindow(): {
  windowId: string | undefined
  windowState: SeekerWindowState | undefined
  setActiveTab: (tabId: string) => void
  addTab: (path: string, label?: string) => void
  closeTab: (tabId: string) => void
  navigateTo: (path: string) => void
  goBack: () => void
  goForward: () => void
  setViewMode: (viewMode: SeekerViewMode) => void
  setSelection: (selection: string[]) => void
} {
  const windowFocus = useApplicationWindowFocus()
  const windowId = windowFocus?.windowId
  const windowState = useSeekerWindowStore((state) => (
    windowId ? state.windows[windowId] : undefined
  ))
  const {
    setActiveTab,
    addTab,
    closeTab,
    navigateTo,
    goBack,
    goForward,
    setViewMode,
    setSelection,
  } = useSeekerWindowStore((state) => state)

  const boundSetActiveTab = useCallback((tabId: string) => {
    if (!windowId) return
    setActiveTab(windowId, tabId)
  }, [setActiveTab, windowId])

  const boundAddTab = useCallback((path: string, label?: string) => {
    if (!windowId) return
    addTab(windowId, path, label)
  }, [addTab, windowId])

  const boundCloseTab = useCallback((tabId: string) => {
    if (!windowId) return
    closeTab(windowId, tabId)
  }, [closeTab, windowId])

  const boundNavigateTo = useCallback((path: string) => {
    if (!windowId) return
    navigateTo(windowId, path)
  }, [navigateTo, windowId])

  const boundGoBack = useCallback(() => {
    if (!windowId) return
    goBack(windowId)
  }, [goBack, windowId])

  const boundGoForward = useCallback(() => {
    if (!windowId) return
    goForward(windowId)
  }, [goForward, windowId])

  const boundSetViewMode = useCallback((viewMode: SeekerViewMode) => {
    if (!windowId) return
    setViewMode(windowId, viewMode)
  }, [setViewMode, windowId])

  const boundSetSelection = useCallback((selection: string[]) => {
    if (!windowId) return
    setSelection(windowId, selection)
  }, [setSelection, windowId])

  return useMemo(() => ({
    windowId,
    windowState,
    setActiveTab: boundSetActiveTab,
    addTab: boundAddTab,
    closeTab: boundCloseTab,
    navigateTo: boundNavigateTo,
    goBack: boundGoBack,
    goForward: boundGoForward,
    setViewMode: boundSetViewMode,
    setSelection: boundSetSelection,
  }), [
    windowId,
    windowState,
    boundSetActiveTab,
    boundAddTab,
    boundCloseTab,
    boundNavigateTo,
    boundGoBack,
    boundGoForward,
    boundSetViewMode,
    boundSetSelection,
  ])
}
