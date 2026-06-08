import FinderHeader from './FinderHeader'
import FinderList from './FinderList'
import FinderSidebar from './FinderSidebar'
function Finder() {
  return (
    <div className="w-full h-full overflow-hidden flex text-#4b4b4d bg-#f7f7f7 text-[.86rem]">
      <FinderSidebar />
      <main className="min-w-0 h-full flex-1 bg-white flex flex-col">
        <FinderHeader />
        <FinderList />
      </main>
    </div>
  )
}

export default Finder
