import MenuBar from "./MenuBar.tsx";

function Desktop() {
  useEffect(() => {

  }, [])

  return (
    <div className="w-full h-full bg-[url('/src/assets/wallpaper/sonoma-light.jpg')] bg-no-repeat bg-center bg-cover">
      <MenuBar />
    </div>
  )
}

export default Desktop
