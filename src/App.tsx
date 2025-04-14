import Desktop from "./components/Desktop.tsx";
import Dock from "./components/Dock.tsx";
import './App.scss'
import useDisplaysSettingStore from "./stores/settings/displays";
import useGlobalStore from "./stores/global";

function App() {
  const textSize = useDisplaysSettingStore((state) => state.textSize)
  const setTimestamp = useGlobalStore((state) => state.setTimestamp)

  useEffect(() => {
    const startingUpProgressDom = document.getElementById('startingUpProgress')
    const timestampInterval = setInterval(() => setTimestamp(Date.now()), 1000)

    if (startingUpProgressDom) {
      const progressInnerDiv = startingUpProgressDom.children[0] as HTMLDivElement

      if (progressInnerDiv.style.width === '100%') return

      progressInnerDiv.style.transition = 'width .5s linear'
      progressInnerDiv.style.width = '100%'

      setTimeout(() => {
        const startingUpScreenDom = document.getElementById('startingUpScreen')

        if (startingUpScreenDom) {
          startingUpScreenDom.style.opacity = '0'
          startingUpScreenDom.style.pointerEvents = 'none'
        }
      }, 500)
    }

    return () => clearInterval(timestampInterval)
  })

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
