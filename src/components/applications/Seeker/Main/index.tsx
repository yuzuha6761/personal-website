import { useLayoutEffect, useRef } from 'react'
import Header from './Header'
import List from './List'
import Sidebar from './Sidebar'
import useSeekerWindowStore from './store'
import { useWindowFocus } from '~/components/Window/FocusContext'
import { useSystemAppearanceDarkMode } from '~/hooks/useSystemAppearanceDarkMode'
import { applySeekerTheme } from '~/components/applications/Seeker/theme'

function SeekerMain() {
  const windowId = useWindowFocus()?.windowId
  const containerRef = useRef<HTMLDivElement>(null)
  const isDarkMode = useSystemAppearanceDarkMode()

  useLayoutEffect(() => {
    if (!windowId) return

    useSeekerWindowStore.getState().initWindow(windowId)

    return () => {
      useSeekerWindowStore.getState().removeWindow(windowId)
    }
  }, [windowId])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    applySeekerTheme(container, isDarkMode)
  }, [isDarkMode])

  return (
    <div ref={containerRef} className="w-full h-full flex">
      <Sidebar containerRef={containerRef} />
      <div className="min-w-0 flex-1 flex flex-col">
        <Header />
        <List />
      </div>
    </div>
  )
}

export default SeekerMain
