import MenuBar from "./MenuBar.tsx";
import { wallpaper } from "../constants/preloadAssets";

function Desktop() {
  useEffect(() => {

  }, [])

  return (
    <div
      className="w-full h-full bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <MenuBar />
    </div>
  )
}

export default Desktop
