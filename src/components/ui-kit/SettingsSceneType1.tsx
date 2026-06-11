import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AppIcon } from '../icons/AppIcon'
import { useApplicationWindowResize } from '../ApplicationWindowResizeContext'

const TAB_TRANSITION_DURATION = 200

export interface SettingsSceneType1Tab {
  id: string
  label: string
  icon: LucideIcon
  content: ReactNode
}

interface SettingsSceneType1Props {
  title: string
  tabs: SettingsSceneType1Tab[]
  defaultTabId?: string
}

function wait(duration: number) {
  return new Promise<void>((resolve) => {
    globalThis.window.setTimeout(resolve, duration)
  })
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    globalThis.window.requestAnimationFrame(() => resolve())
  })
}

function SettingsSceneType1(props: SettingsSceneType1Props) {
  const { title, tabs, defaultTabId } = props
  const resizeContext = useApplicationWindowResize()
  const initialTabId = defaultTabId ?? tabs[0]?.id ?? ''
  const [activeTabId, setActiveTabId] = useState(initialTabId)
  const [displayedTabId, setDisplayedTabId] = useState(initialTabId)
  const [measuringTabId, setMeasuringTabId] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const lastReportedHeightRef = useRef<number | null>(null)

  const displayedTab = tabs.find((tab) => tab.id === displayedTabId) ?? tabs[0]
  const measuringTab = measuringTabId
    ? tabs.find((tab) => tab.id === measuringTabId)
    : undefined

  const measureTotalHeight = useCallback((contentElement: HTMLElement | null) => {
    const toolbarHeight = toolbarRef.current?.offsetHeight ?? 0
    const contentHeight = contentElement?.scrollHeight ?? 0
    return toolbarHeight + contentHeight
  }, [])

  const reportHeight = useCallback((height: number, animate = false) => {
    if (height <= 0) return
    if (!animate && lastReportedHeightRef.current === height) return

    lastReportedHeightRef.current = height
    resizeContext?.setWindowHeight(height, { animate, duration: TAB_TRANSITION_DURATION })
  }, [resizeContext])

  useLayoutEffect(() => {
    if (isTransitioning || !displayedTabId) return

    reportHeight(measureTotalHeight(contentRef.current))
  }, [displayedTabId, isTransitioning, measureTotalHeight, reportHeight])

  const switchTab = useCallback(async (tabId: string) => {
    if (tabId === activeTabId || isTransitioning || !tabs.some((tab) => tab.id === tabId)) return

    setIsTransitioning(true)
    setActiveTabId(tabId)
    setMeasuringTabId(tabId)

    await waitForNextFrame()
    await waitForNextFrame()

    const nextHeight = measureTotalHeight(measureRef.current)
    reportHeight(nextHeight, true)
    await wait(TAB_TRANSITION_DURATION)

    setDisplayedTabId(tabId)
    setMeasuringTabId(null)
    setIsTransitioning(false)
  }, [activeTabId, isTransitioning, measureTotalHeight, reportHeight, tabs])

  if (!displayedTab) return null

  return (
    <div className={`relative w-full bg-#ededed flex flex-col ${isTransitioning ? 'h-full' : ''}`}>
      <div ref={toolbarRef}>
        <div className="h-[2.15rem] flex items-center justify-center text-[.92rem] font-700 text-#2f2f2f">
          {title}
        </div>
        <div className="px-[1.1rem] pb-[.55rem] flex items-start justify-center gap-[1.35rem]">
          {tabs.map((tab) => {
            const selected = tab.id === activeTabId

            return (
              <button
                className="min-w-[3.4rem] border-0 p-0 bg-transparent cursor-default flex flex-col items-center gap-[.28rem]"
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                type="button"
              >
                <span className={`w-[2.55rem] h-[2.55rem] rounded-[.48rem] flex items-center justify-center ${
                  selected ? 'bg-#e4e4e4' : 'bg-transparent'
                }`}>
                  <AppIcon
                    className={`w-[1.28rem] h-[1.28rem] ${selected ? 'text-#c13584' : 'text-#8f8f8f'}`}
                    icon={tab.icon}
                    strokeWidth={1.75}
                  />
                </span>
                <span className={`text-[.72rem] font-600 ${selected ? 'text-#c13584' : 'text-#8f8f8f'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
        <div className="h-px bg-#d7d7d7" />
      </div>

      {!isTransitioning && (
        <div ref={contentRef}>
          {displayedTab.content}
        </div>
      )}

      {isTransitioning && <div className="flex-1 bg-#ededed" />}

      {isTransitioning && measuringTab && (
        <div
          aria-hidden
          className="invisible absolute left-0 top-0 w-full pointer-events-none"
          ref={measureRef}
        >
          {measuringTab.content}
        </div>
      )}
    </div>
  )
}

export default SettingsSceneType1
