import MenuBar from "./MenuBar.tsx";
import { wallpaper } from "../constants/preloadAssets";
import useWindowStore from "../stores/window";
import ApplicationWindow from "./ApplicationWindow";

function Desktop() {
  const windows = useWindowStore((state) => state.windows)
  const activeWindowId = useWindowStore((state) => state.activeWindowId)
  const closeWindow = useWindowStore((state) => state.closeWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)

  useEffect(() => {

  }, [])

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <MenuBar />
      {windows.map((window) => (
        <ApplicationWindow
          active={activeWindowId === window.id}
          key={window.id}
          window={window}
          onClose={closeWindow}
          onFocus={focusWindow}
        />
      ))}
    </div>
  )
}

export default Desktop
