import { useCallback, useMemo } from 'react'
import useMainWindowStore from './store'
import type { MainWindowState, ViewMode } from './types'
import { useWindowFocus } from '~/components/Window/FocusContext'

export function useMainWindow(): {
  windowId: string | undefined
  windowState: MainWindowState | undefined
  setActiveTab: (tabId: string) => void
  addTab: (path: string, label?: string) => void
  closeTab: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
  moveTabs: (tabIds: string[]) => void
  navigateTo: (path: string) => void
  goBack: () => void
  goForward: () => void
  setViewMode: (viewMode: ViewMode) => void
  setSelection: (selection: string[]) => void
} {
  const windowId = useWindowFocus()?.windowId
  const windowState = useMainWindowStore((state) => (
    windowId ? state.windows[windowId] : undefined
  ))
  const {
    setActiveTab,
    addTab,
    closeTab,
    closeOtherTabs,
    moveTabs,
    navigateTo,
    goBack,
    goForward,
    setViewMode,
    setSelection,
  } = useMainWindowStore((state) => state)

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

  const boundCloseOtherTabs = useCallback((tabId: string) => {
    if (!windowId) return
    closeOtherTabs(windowId, tabId)
  }, [closeOtherTabs, windowId])

  const boundMoveTabs = useCallback((tabIds: string[]) => {
    if (!windowId) return
    moveTabs(windowId, tabIds)
  }, [moveTabs, windowId])

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

  const boundSetViewMode = useCallback((viewMode: ViewMode) => {
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
    closeOtherTabs: boundCloseOtherTabs,
    moveTabs: boundMoveTabs,
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
    boundCloseOtherTabs,
    boundMoveTabs,
    boundNavigateTo,
    boundGoBack,
    boundGoForward,
    boundSetViewMode,
    boundSetSelection,
  ])
}
