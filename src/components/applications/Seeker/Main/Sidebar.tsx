import { useCallback, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AppIcon } from '~/components/icons/AppIcon'
import { useWindowFocus } from '~/components/Window/FocusContext'
import { getRootFontSize } from '~/services/window'
import { sidebarSections, tagItems } from '../data'
import { seekerIcons } from '../icons'

const DEFAULT_WIDTH_REM = 10.65
const MIN_WIDTH_REM = 9
const HIDE_AT_REM = 4
const MAIN_MIN_WIDTH_REM = 25

const sidebarItemClass = 'w-full h-[1.98rem] border-0 rounded-[.34rem] p-0 bg-transparent [font:inherit] text-[.9rem] font-[560] leading-none cursor-default flex items-center'
const sidebarIconClass = 'flex-[0_0_1.42rem] w-[.9rem] h-[.9rem] mr-[.3rem]'

interface SidebarProps {
  containerRef: RefObject<HTMLDivElement | null>
}

function resolveSidebarWidth(pointerRem: number, containerWidthRem: number) {
  if (pointerRem <= HIDE_AT_REM) {
    return { visible: false, widthRem: DEFAULT_WIDTH_REM }
  }

  const maxWidthRem = Math.max(0, containerWidthRem - MAIN_MIN_WIDTH_REM)
  const widthRem = Math.min(maxWidthRem, Math.max(MIN_WIDTH_REM, pointerRem))

  return { visible: true, widthRem }
}

function Sidebar({ containerRef }: SidebarProps) {
  const focused = useWindowFocus()?.focused ?? true
  const [widthRem, setWidthRem] = useState(DEFAULT_WIDTH_REM)
  const [visible, setVisible] = useState(true)
  const dragStateRef = useRef<{ pointerId: number } | null>(null)

  const sidebarBgClass = focused
    ? 'bg-#d0cccd/68 backdrop-blur-[20px] backdrop-saturate-180'
    : 'bg-#e8e7e7'
  const sidebarBorderClass = focused ? 'border-r-#bbb8ba' : 'border-r-#d5d5d5'
  const sidebarTitleClass = focused ? 'text-#8c8a8d' : 'text-#a3a3a3'
  const sidebarTextClass = focused ? 'text-#4a494b' : 'text-#a2a2a2'
  const sidebarIconColorClass = focused ? 'text-#c13584' : 'text-#ffb3da'

  const handleResizeMove = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return

    const rootFontSize = getRootFontSize()
    const containerRect = container.getBoundingClientRect()
    const containerWidthRem = containerRect.width / rootFontSize
    const pointerRem = (clientX - containerRect.left) / rootFontSize
    const next = resolveSidebarWidth(pointerRem, containerWidthRem)

    setVisible(next.visible)
    if (next.visible) setWidthRem(next.widthRem)
  }, [containerRef])

  const handleResizeEnd = useCallback(() => {
    dragStateRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const handleResizeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    dragStateRef.current = { pointerId: event.pointerId }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    handleResizeMove(event.clientX)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (dragStateRef.current?.pointerId !== moveEvent.pointerId) return
      handleResizeMove(moveEvent.clientX)
    }

    const handlePointerEnd = (endEvent: PointerEvent) => {
      if (dragStateRef.current?.pointerId !== endEvent.pointerId) return

      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerEnd)
      document.removeEventListener('pointercancel', handlePointerEnd)
      handleResizeEnd()
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerEnd)
    document.addEventListener('pointercancel', handlePointerEnd)
  }, [handleResizeEnd, handleResizeMove])

  return (
    <aside
      className={`relative h-full shrink-0 overflow-hidden border-r ${visible ? sidebarBorderClass : 'border-r-0'} ${sidebarBgClass}`}
      style={{
        width: visible ? `${widthRem}rem` : 0,
        boxShadow: visible ? 'inset -2px 0 2px rgba(0, 0, 0, 0.06)' : undefined,
      }}
    >
      <div className="h-[3.85rem]" />
      <div className="h-[calc(100%-3.25rem)] overflow-hidden pt-0 pr-[.75rem] pb-[.9rem] pl-[.9rem]">
        {sidebarSections.map((section) => (
          <section className="mb-[1.08rem]" key={section.id}>
            {section.title && <div className={`mb-[.25rem] ${sidebarTitleClass} text-[.78rem] font-700`}>{section.title}</div>}
            {section.items.map((item) => (
              <button className={`${sidebarItemClass} ${sidebarTextClass}`} key={item.id} type="button">
                <AppIcon className={`${sidebarIconClass} ${sidebarIconColorClass}`} icon={seekerIcons[item.icon]} />
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </section>
        ))}

        <section className="mb-[1.08rem]">
          <div className={`mb-[.34rem] ${sidebarTitleClass} text-[.74rem] font-700`}>标签</div>
          {tagItems.map((tag) => (
            <button className={`${sidebarItemClass} ${sidebarTextClass}`} key={tag.id} type="button">
              <span
                className="flex-[0_0_.55rem] h-[.55rem] mr-[.58rem] ml-[.22rem] rounded-full"
                style={{ backgroundColor: tag.color, opacity: focused ? 1 : 0.42 }}
              />
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tag.label}</span>
            </button>
          ))}
        </section>
      </div>

      {visible && (
        <div
          aria-orientation="vertical"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(widthRem)}
          className="absolute top-0 right-0 z-1 h-full w-[.45rem] translate-x-1/2 cursor-col-resize touch-none"
          onPointerDown={handleResizeStart}
          role="separator"
        />
      )}
    </aside>
  )
}

export default Sidebar
