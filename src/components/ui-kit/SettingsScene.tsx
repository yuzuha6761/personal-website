import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useSystemAppearanceDarkMode } from '~/hooks/useSystemAppearanceDarkMode'
import { AppIcon } from '~/components/icons/AppIcon'
import { dragExcludeProps, dragHandleProps } from '~/components/Window/Drag'
import { useWindowFocus } from '~/components/Window/FocusContext'
import { useWindowResize } from '~/components/Window/ResizeContext'
import './SettingsScene.scss'

const TAB_TRANSITION_DURATION = 200

const TAB_BG_SELECTED =
  'bg-[var(--settings-scene-tab-bg-selected)] hover:bg-[var(--settings-scene-tab-bg-selected-hover)] active:bg-[var(--settings-scene-tab-bg-selected-active)]'
const TAB_BG_UNSELECTED =
  'bg-transparent hover:bg-[var(--settings-scene-tab-bg-hover)] active:bg-[var(--settings-scene-tab-bg-active)]'
const TAB_TEXT_SELECTED =
  'text-[var(--settings-scene-tab-text-selected)] group-hover:text-[var(--settings-scene-tab-text-selected-hover)] group-active:text-[var(--settings-scene-tab-text-selected-active)]'
const TAB_TEXT_UNSELECTED =
  'text-[var(--settings-scene-tab-text)] group-hover:text-[var(--settings-scene-tab-text-hover)] group-active:text-[var(--settings-scene-tab-text-active)]'

export interface SettingsSceneTab {
  id: string
  label: string
  icon: LucideIcon
  content: ReactNode
}

interface SettingsSceneProps {
  title: string
  tabs: SettingsSceneTab[]
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

function SettingsScene(props: SettingsSceneProps) {
  const { title, tabs, defaultTabId } = props
  const resizeContext = useWindowResize()
  const focused = useWindowFocus()?.focused ?? true
  const isDarkMode = useSystemAppearanceDarkMode()
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
    <div
      className={`relative w-full flex flex-col ${isTransitioning ? 'h-full' : ''}`}
      data-settings-scene-appearance={isDarkMode ? 'dark' : 'light'}
      data-settings-scene-focus={focused ? 'focused' : 'unfocused'}
    >
      <div className="bg-[var(--settings-scene-toolbar-bg)]" ref={toolbarRef} {...dragHandleProps}>
        <div className="h-[2.15rem] flex items-center justify-center text-[.92rem] font-700 text-[var(--settings-scene-title)]">
          {title}
        </div>
        <div className="px-[1.1rem] pb-[.55rem] flex items-start justify-center gap-[.1rem]">
          {tabs.map((tab) => {
            const selected = tab.id === activeTabId
            const tabBgClass = selected ? TAB_BG_SELECTED : TAB_BG_UNSELECTED
            const tabContentClass = selected ? TAB_TEXT_SELECTED : TAB_TEXT_UNSELECTED

            return (
              <div
                className={`group min-w-[3.4rem] rounded-[.48rem] px-[.42rem] py-[.1rem] cursor-default flex flex-col items-center gap-[.1rem] ${tabBgClass}`}
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                role="tab"
                aria-selected={selected}
              >
                <span {...dragExcludeProps} className="flex items-center justify-center">
                  <AppIcon
                    className={`w-[1.8rem] h-[1.8rem] ${tabContentClass}`}
                    icon={tab.icon}
                    strokeWidth={1.75}
                  />
                </span>
                <span className={`text-[.72rem] font-600 ${tabContentClass}`}>
                  {tab.label}
                </span>
              </div>
            )
          })}
        </div>
        <div className="h-px bg-[var(--settings-scene-divider)]" />
      </div>

      {!isTransitioning && (
        <div ref={contentRef}>
          {displayedTab.content}
        </div>
      )}

      {isTransitioning && <div className="flex-1 bg-[var(--settings-scene-content-bg)]" />}

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

export default SettingsScene
