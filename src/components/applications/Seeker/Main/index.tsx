import { useEffect } from 'react'
import Header from './Header'
import List from './List'
import Sidebar from './Sidebar'
import useSeekerWindowStore from '../store/window'
import { useApplicationWindowFocus } from '../../../ApplicationWindowFocusContext'

function SeekerMain() {
  const windowFocus = useApplicationWindowFocus()
  const focused = windowFocus?.focused ?? true
  const windowId = windowFocus?.windowId

  useEffect(() => {
    if (!windowId) return

    useSeekerWindowStore.getState().initWindow(windowId)

    return () => {
      useSeekerWindowStore.getState().removeWindow(windowId)
    }
  }, [windowId])

  return (
    <div className="w-full h-full flex">
      <Sidebar focused={focused} />
      <div className="min-w-0 flex-1 flex flex-col">
        <Header focused={focused} />
        <List focused={focused} />
      </div>
    </div>
  )
}

export default SeekerMain
