import Header from './Header'
import List from './List'
import Sidebar from './Sidebar'
import { useApplicationWindowFocus } from '../../ApplicationWindowFocusContext'

function Seeker() {
  const windowFocus = useApplicationWindowFocus()
  const focused = windowFocus?.focused ?? true

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

export default Seeker
