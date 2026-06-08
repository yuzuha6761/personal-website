import Desktop from "./components/Desktop.tsx";
import Dock from "./components/Dock.tsx";
import useDisplaysSettingStore from "./stores/settings/displays";
import useGlobalStore from "./stores/global";
import { startupPreloadImages } from "./constants/preloadAssets";
import { preloadImages } from "./services/preload";

function App() {
  const textSize = useDisplaysSettingStore((state) => state.textSize)
  const setTimestamp = useGlobalStore((state) => state.setTimestamp)

  useEffect(() => {
    const startingUpProgressDom = document.getElementById('startingUpProgress')
    const timestampInterval = setInterval(() => setTimestamp(Date.now()), 1000)
    let hideStartupScreenTimer: ReturnType<typeof setTimeout> | undefined

    const hideStartupScreen = () => {
      const startingUpScreenDom = document.getElementById('startingUpScreen')

      if (startingUpScreenDom) {
        startingUpScreenDom.style.opacity = '0'
        startingUpScreenDom.style.pointerEvents = 'none'
      }
    }

    if (startingUpProgressDom) {
      const progressInnerDiv = startingUpProgressDom.children[0] as HTMLDivElement

      if (progressInnerDiv.style.width !== '100%') {
        progressInnerDiv.style.transition = 'width .3s linear'

        void preloadImages(startupPreloadImages, (loaded, total) => {
          progressInnerDiv.style.width = `${Math.round((loaded / total) * 100)}%`
        }).then(() => {
          progressInnerDiv.style.transition = 'width .5s linear'
          progressInnerDiv.style.width = '100%'
          hideStartupScreenTimer = setTimeout(hideStartupScreen, 500)
        })
      }
    }

    return () => {
      clearInterval(timestampInterval)
      if (hideStartupScreenTimer) clearTimeout(hideStartupScreenTimer)
    }
  }, [setTimestamp])

  useEffect(() => {
    document.documentElement.style.fontSize = textSize
  }, [textSize]);

  return (
    <>
      <Desktop />
      <Dock />
    </>
  )
}

export default App
