import Header from './Header'
import List from './List'
import Sidebar from './Sidebar'

function Seeker() {
  return (
    <div className="w-full h-full flex">
      <Sidebar />
      <div className="min-w-0 flex-1 flex flex-col">
        <Header />
        <List />
      </div>
    </div>
  )
}

export default Seeker
