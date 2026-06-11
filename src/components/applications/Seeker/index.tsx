import SeekerAbout from './About'
import SeekerMain from './Main'
import SeekerSettings from './Settings'
import { getSeekerWindowKind, SEEKER_WINDOW_KIND } from './windows'
import { useApplicationWindowFocus } from '../../ApplicationWindowFocusContext'
import useWindowStore from '../../../stores/window'

function Seeker() {
  const windowFocus = useApplicationWindowFocus()
  const windowId = windowFocus?.windowId
  const window = useWindowStore((state) => (
    windowId ? state.windows.find((item) => item.id === windowId) : undefined
  ))
  const windowKind = getSeekerWindowKind(window?.payload)

  if (windowKind === SEEKER_WINDOW_KIND.ABOUT) {
    return <SeekerAbout />
  }

  if (windowKind === SEEKER_WINDOW_KIND.SETTINGS) {
    return <SeekerSettings />
  }

  return <SeekerMain />
}

export default Seeker
