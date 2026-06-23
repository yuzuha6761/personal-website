import Desktop from "./components/Desktop.tsx";
import Dock from "./components/Dock.tsx";
import useDisplaysSettingStore from "./stores/settings/displays";
import useSystemSettingsStore from "./stores/settings/system-settings";
import useGlobalStore from "./stores/global";
import useSessionStore from "~/session/store";
import useFsStore from "~/fs";
import { startupPreloadImages } from "./constants/preloadAssets";
import { preloadImages } from "./services/preload";
import { applySystemSettingsAppearance, applySystemSettingsDock } from "./services/system-settings";
import { useSystemAppearanceDarkMode } from "./hooks/useSystemAppearanceDarkMode";
import { useGlobalShortcuts } from "~/shortcuts";
import { bootstrapPersistence } from "~/persistence";
import { useEffect } from "react";
import { preloadApplication } from "./components/applications/registry";

function App() {
  const textSize = useDisplaysSettingStore((state) => state.textSize)
  const appearance = useSystemSettingsStore((state) => state.appearance)
  const color = useSystemSettingsStore((state) => state.color)
  const textHighlightColor = useSystemSettingsStore((state) => state.textHighlightColor)
  const sidebarIconSize = useSystemSettingsStore((state) => state.sidebarIconSize)
  const wallpaperTint = useSystemSettingsStore((state) => state.wallpaperTint)
  const scrollBars = useSystemSettingsStore((state) => state.scrollBars)
  const scrollbarClick = useSystemSettingsStore((state) => state.scrollbarClick)
  const dockPosition = useSystemSettingsStore((state) => state.dockPosition)
  const setTimestamp = useGlobalStore((state) => state.setTimestamp)
  const isSessionReady = useSessionStore((state) => state.isReady)
  const isFsReady = useFsStore((state) => state.isReady)
  const isDarkMode = useSystemAppearanceDarkMode()
  useGlobalShortcuts()

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

        void Promise.all([
          preloadImages(startupPreloadImages, (loaded, total) => {
            progressInnerDiv.style.width = `${Math.round((loaded / total) * 100)}%`
          }),
          preloadApplication('seeker'),
          bootstrapPersistence(),
        ]).then(() => {
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

  useEffect(() => {
    if (!isSessionReady) return

    applySystemSettingsAppearance({
      appearance,
      color,
      textHighlightColor,
      sidebarIconSize,
      wallpaperTint,
      scrollBars,
      scrollbarClick,
    }, { isDarkMode })
  }, [
    appearance,
    color,
    textHighlightColor,
    sidebarIconSize,
    wallpaperTint,
    scrollBars,
    scrollbarClick,
    isDarkMode,
    isSessionReady,
  ]);

  useEffect(() => {
    if (!isSessionReady) return
    applySystemSettingsDock(dockPosition)
  }, [dockPosition, isSessionReady]);

  if (!isSessionReady || !isFsReady) {
    return null
  }

  return (
    <>
      <Desktop />
      <Dock />
    </>
  )
}

export default App
