import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import useSystemSettingsStore from '~/stores/settings/system-settings'
import styles from './Scrollbar.module.scss'
import './Scrollbar.theme.scss'

const SCROLLBAR_FADE_DELAY_MS = 900
const MIN_THUMB_HEIGHT_PX = 28

interface ScrollbarProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  contentRef?: Ref<HTMLDivElement>
  style?: CSSProperties
  viewportProps?: Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'ref' | 'onScroll'>
}

interface ScrollMetrics {
  scrollable: boolean
  thumbHeight: number
  thumbTop: number
  trackHeight: number
}

function getScrollMetrics(viewport: HTMLDivElement): ScrollMetrics {
  const { clientHeight, scrollHeight, scrollTop } = viewport
  const scrollable = scrollHeight > clientHeight + 1

  if (!scrollable || clientHeight <= 0) {
    return {
      scrollable: false,
      thumbHeight: 0,
      thumbTop: 0,
      trackHeight: clientHeight,
    }
  }

  const trackHeight = clientHeight
  const thumbHeight = Math.max(
    MIN_THUMB_HEIGHT_PX,
    (clientHeight / scrollHeight) * trackHeight,
  )
  const maxThumbTop = trackHeight - thumbHeight
  const scrollRange = scrollHeight - clientHeight
  const thumbTop = scrollRange > 0
    ? (scrollTop / scrollRange) * maxThumbTop
    : 0

  return {
    scrollable,
    thumbHeight,
    thumbTop,
    trackHeight,
  }
}

function Scrollbar(props: ScrollbarProps) {
  const { children, className = '', contentClassName = '', contentRef, style, viewportProps } = props
  const scrollBarsVisibility = useSystemSettingsStore((state) => state.scrollBars)
  const scrollbarClick = useSystemSettingsStore((state) => state.scrollbarClick)
  const viewportRef = useRef<HTMLDivElement>(null)
  const fadeTimerRef = useRef<number | undefined>(undefined)
  const dragStateRef = useRef<{ pointerId: number, startY: number, startScrollTop: number } | null>(null)
  const [metrics, setMetrics] = useState<ScrollMetrics>(() => ({
    scrollable: false,
    thumbHeight: 0,
    thumbTop: 0,
    trackHeight: 0,
  }))
  const [thumbActive, setThumbActive] = useState(false)
  const [scrollingVisible, setScrollingVisible] = useState(false)

  const syncMetrics = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    setMetrics(getScrollMetrics(viewport))
  }, [])

  const revealScrollingThumb = useCallback(() => {
    if (scrollBarsVisibility !== 'scrolling') return

    setScrollingVisible(true)
    window.clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = window.setTimeout(() => {
      setScrollingVisible(false)
    }, SCROLLBAR_FADE_DELAY_MS)
  }, [scrollBarsVisibility])

  const handleScroll = useCallback(() => {
    syncMetrics()
    revealScrollingThumb()
  }, [revealScrollingThumb, syncMetrics])

  useEffect(() => {
    syncMetrics()
  }, [children, syncMetrics])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const resizeObserver = new ResizeObserver(() => {
      syncMetrics()
    })

    resizeObserver.observe(viewport)

    const content = viewport.firstElementChild
    if (content instanceof HTMLElement) {
      resizeObserver.observe(content)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [syncMetrics])

  useEffect(() => () => {
    window.clearTimeout(fadeTimerRef.current)
  }, [])

  useEffect(() => {
    if (scrollBarsVisibility === 'always') {
      setScrollingVisible(false)
    }
  }, [scrollBarsVisibility])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || metrics.scrollable) return

    if (viewport.scrollTop !== 0) {
      viewport.scrollTop = 0
    }
  }, [metrics.scrollable])

  const assignViewportRef = useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node

    if (!contentRef) return

    if (typeof contentRef === 'function') {
      contentRef(node)
      return
    }

    contentRef.current = node
  }, [contentRef])

  const scrollToThumbTop = useCallback((nextThumbTop: number) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const { clientHeight, scrollHeight } = viewport
    const trackHeight = clientHeight
    const thumbHeight = Math.max(
      MIN_THUMB_HEIGHT_PX,
      (clientHeight / scrollHeight) * trackHeight,
    )
    const maxThumbTop = trackHeight - thumbHeight
    const scrollRange = scrollHeight - clientHeight
    const clampedThumbTop = Math.max(0, Math.min(maxThumbTop, nextThumbTop))
    const nextScrollTop = maxThumbTop > 0
      ? (clampedThumbTop / maxThumbTop) * scrollRange
      : 0

    viewport.scrollTop = nextScrollTop
    syncMetrics()
    revealScrollingThumb()
  }, [revealScrollingThumb, syncMetrics])

  const handleTrackPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    if (!viewport || !metrics.scrollable) return

    const trackRect = event.currentTarget.getBoundingClientRect()
    const clickOffsetY = event.clientY - trackRect.top
    const thumbStart = metrics.thumbTop
    const thumbEnd = metrics.thumbTop + metrics.thumbHeight

    if (clickOffsetY >= thumbStart && clickOffsetY <= thumbEnd) {
      return
    }

    event.preventDefault()

    if (scrollbarClick === 'next-page') {
      const pageDelta = viewport.clientHeight * (clickOffsetY < thumbStart ? -1 : 1)
      viewport.scrollTop += pageDelta
      syncMetrics()
      revealScrollingThumb()
      return
    }

    const targetThumbTop = clickOffsetY - metrics.thumbHeight / 2
    scrollToThumbTop(targetThumbTop)
  }, [
    metrics.scrollable,
    metrics.thumbHeight,
    metrics.thumbTop,
    revealScrollingThumb,
    scrollToThumbTop,
    scrollbarClick,
    syncMetrics,
  ])

  const handleThumbPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    if (!viewport || !metrics.scrollable) return

    event.preventDefault()
    event.stopPropagation()

    const thumbElement = event.currentTarget

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: viewport.scrollTop,
    }
    setThumbActive(true)
    revealScrollingThumb()
    thumbElement.setPointerCapture(event.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dragState = dragStateRef.current
      const activeViewport = viewportRef.current
      if (!dragState || !activeViewport || dragState.pointerId !== moveEvent.pointerId) return

      const { clientHeight, scrollHeight } = activeViewport
      const trackHeight = clientHeight
      const thumbHeight = Math.max(
        MIN_THUMB_HEIGHT_PX,
        (clientHeight / scrollHeight) * trackHeight,
      )
      const maxThumbTop = trackHeight - thumbHeight
      const scrollRange = scrollHeight - clientHeight
      const deltaY = moveEvent.clientY - dragState.startY
      const scrollDelta = maxThumbTop > 0
        ? (deltaY / maxThumbTop) * scrollRange
        : 0

      activeViewport.scrollTop = dragState.startScrollTop + scrollDelta
      syncMetrics()
      revealScrollingThumb()
    }

    const handlePointerEnd = (endEvent: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== endEvent.pointerId) return

      dragStateRef.current = null
      setThumbActive(false)
      thumbElement.releasePointerCapture(endEvent.pointerId)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerEnd)
      document.removeEventListener('pointercancel', handlePointerEnd)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerEnd)
    document.addEventListener('pointercancel', handlePointerEnd)
  }, [metrics.scrollable, revealScrollingThumb, syncMetrics])

  const showThumb = metrics.scrollable && (
    scrollBarsVisibility === 'always'
    || (scrollBarsVisibility === 'scrolling' && scrollingVisible)
  )

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      <div
        className={`${styles.viewport} ${contentClassName}`}
        onScroll={handleScroll}
        ref={assignViewportRef}
        style={{ overflowY: metrics.scrollable ? 'auto' : 'hidden' }}
        {...viewportProps}
      >
        {children}
      </div>

      {metrics.scrollable ? (
        <div
          aria-hidden
          className={`${styles.track} ${showThumb ? styles.trackInteractive : ''}`}
          onPointerDown={handleTrackPointerDown}
        >
          <div
            className={[
              styles.thumb,
              thumbActive ? styles.thumbActive : '',
              showThumb ? styles.thumbVisible : styles.thumbHidden,
            ].filter(Boolean).join(' ')}
            onPointerDown={handleThumbPointerDown}
            style={{
              height: metrics.thumbHeight,
              transform: `translateY(${metrics.thumbTop}px)`,
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default Scrollbar
