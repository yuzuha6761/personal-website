import type { CSSProperties } from 'react'
import { getRootFontSize } from '~/services/window'

export type GlassPanelArrowEdge = 'bottom' | 'left' | 'right'

export const GLASS_PANEL_ARROW_HEIGHT_REM = 0.875
export const GLASS_PANEL_ARROW_WIDTH_REM = 1.75
export const GLASS_PANEL_ARROW_HALF_WIDTH_REM = GLASS_PANEL_ARROW_WIDTH_REM / 2
export const GLASS_PANEL_ARROW_CORNER_RADIUS_REM = 0.34375
export const GLASS_PANEL_RADIUS_REM = 0.5625
export const DOCK_TOOLTIP_PANEL_RADIUS_REM = 0.375

export function remToPx(rem: number) {
  return rem * getRootFontSize()
}

function getGlassPanelPxMetrics() {
  return {
    arrowHeight: remToPx(GLASS_PANEL_ARROW_HEIGHT_REM),
    arrowHalfWidth: remToPx(GLASS_PANEL_ARROW_HALF_WIDTH_REM),
    arrowCornerRadius: remToPx(GLASS_PANEL_ARROW_CORNER_RADIUS_REM),
  }
}

export function getGlassPanelArrowHalfWidthPx() {
  return remToPx(GLASS_PANEL_ARROW_HALF_WIDTH_REM)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function svgPathToCssPath(path: string) {
  return `path('${path}')`
}

function getBottomArrowPathSegment(
  offset: number,
  baseY: number,
  tipY: number,
  arrowHalfWidth: number,
  arrowCornerRadius: number,
) {
  const radius = arrowCornerRadius
  const tipRadius = radius * 0.52
  const leftBaseX = offset - arrowHalfWidth
  const rightBaseX = offset + arrowHalfWidth

  return [
    `L ${rightBaseX + radius} ${baseY}`,
    `Q ${rightBaseX} ${baseY} ${rightBaseX - (radius * 0.72)} ${baseY + (radius * 0.72)}`,
    `L ${offset + tipRadius} ${tipY - tipRadius}`,
    `Q ${offset} ${tipY} ${offset - tipRadius} ${tipY - tipRadius}`,
    `L ${leftBaseX + (radius * 0.72)} ${baseY + (radius * 0.72)}`,
    `Q ${leftBaseX} ${baseY} ${leftBaseX - radius} ${baseY}`,
  ]
}

function getLeftArrowPathSegment(
  baseX: number,
  offset: number,
  arrowHalfWidth: number,
  arrowCornerRadius: number,
) {
  const radius = arrowCornerRadius
  const tipRadius = radius * 0.52
  const topBaseY = offset - arrowHalfWidth
  const bottomBaseY = offset + arrowHalfWidth

  return [
    `L ${baseX} ${bottomBaseY + radius}`,
    `Q ${baseX} ${bottomBaseY} ${baseX - (radius * 0.72)} ${bottomBaseY - (radius * 0.72)}`,
    `L ${tipRadius} ${offset + tipRadius}`,
    `Q 0 ${offset} ${tipRadius} ${offset - tipRadius}`,
    `L ${baseX - (radius * 0.72)} ${topBaseY + (radius * 0.72)}`,
    `Q ${baseX} ${topBaseY} ${baseX} ${topBaseY - radius}`,
  ]
}

function getRightArrowPathSegment(
  baseX: number,
  tipX: number,
  offset: number,
  arrowHalfWidth: number,
  arrowCornerRadius: number,
) {
  const radius = arrowCornerRadius
  const tipRadius = radius * 0.52
  const topBaseY = offset - arrowHalfWidth
  const bottomBaseY = offset + arrowHalfWidth

  return [
    `L ${baseX} ${topBaseY - radius}`,
    `Q ${baseX} ${topBaseY} ${baseX + (radius * 0.72)} ${topBaseY + (radius * 0.72)}`,
    `L ${tipX - tipRadius} ${offset - tipRadius}`,
    `Q ${tipX} ${offset} ${tipX - tipRadius} ${offset + tipRadius}`,
    `L ${baseX + (radius * 0.72)} ${bottomBaseY - (radius * 0.72)}`,
    `Q ${baseX} ${bottomBaseY} ${baseX} ${bottomBaseY + radius}`,
  ]
}

export function getGlassPanelPath(
  size?: { width: number; height: number },
  edge?: GlassPanelArrowEdge,
  offset?: number,
  panelRadiusRem = GLASS_PANEL_RADIUS_REM,
) {
  if (!size) return undefined

  const panelRadius = remToPx(panelRadiusRem)
  const { arrowHeight, arrowHalfWidth, arrowCornerRadius } = getGlassPanelPxMetrics()

  if (!edge || offset === undefined) {
    const { width, height } = size
    const radius = Math.min(panelRadius, width / 2, height / 2)

    return [
      `M ${radius} 0`,
      `L ${width - radius} 0`,
      `Q ${width} 0 ${width} ${radius}`,
      `L ${width} ${height - radius}`,
      `Q ${width} ${height} ${width - radius} ${height}`,
      `L ${radius} ${height}`,
      `Q 0 ${height} 0 ${height - radius}`,
      `L 0 ${radius}`,
      `Q 0 0 ${radius} 0`,
      'Z',
    ].join(' ')
  }

  const { width, height } = size
  const radius = Math.min(panelRadius, width / 2, height / 2)
  const safeOffset = edge === 'bottom'
    ? clamp(offset, radius + arrowHalfWidth, width - radius - arrowHalfWidth)
    : clamp(offset, radius + arrowHalfWidth, height - radius - arrowHalfWidth)

  if (edge === 'bottom') {
    const baseY = height - arrowHeight

    return [
      `M ${radius} 0`,
      `L ${width - radius} 0`,
      `Q ${width} 0 ${width} ${radius}`,
      `L ${width} ${baseY - radius}`,
      `Q ${width} ${baseY} ${width - radius} ${baseY}`,
      ...getBottomArrowPathSegment(safeOffset, baseY, height, arrowHalfWidth, arrowCornerRadius),
      `L ${radius} ${baseY}`,
      `Q 0 ${baseY} 0 ${baseY - radius}`,
      `L 0 ${radius}`,
      `Q 0 0 ${radius} 0`,
      'Z',
    ].join(' ')
  }

  if (edge === 'left') {
    const baseX = arrowHeight

    return [
      `M ${baseX + radius} 0`,
      `L ${width - radius} 0`,
      `Q ${width} 0 ${width} ${radius}`,
      `L ${width} ${height - radius}`,
      `Q ${width} ${height} ${width - radius} ${height}`,
      `L ${baseX + radius} ${height}`,
      `Q ${baseX} ${height} ${baseX} ${height - radius}`,
      ...getLeftArrowPathSegment(baseX, safeOffset, arrowHalfWidth, arrowCornerRadius),
      `L ${baseX} ${radius}`,
      `Q ${baseX} 0 ${baseX + radius} 0`,
      'Z',
    ].join(' ')
  }

  const baseX = width - arrowHeight

  return [
    `M ${radius} 0`,
    `L ${baseX - radius} 0`,
    `Q ${baseX} 0 ${baseX} ${radius}`,
    ...getRightArrowPathSegment(baseX, width, safeOffset, arrowHalfWidth, arrowCornerRadius),
    `L ${baseX} ${height - radius}`,
    `Q ${baseX} ${height} ${baseX - radius} ${height}`,
    `L ${radius} ${height}`,
    `Q 0 ${height} 0 ${height - radius}`,
    `L 0 ${radius}`,
    `Q 0 0 ${radius} 0`,
    'Z',
  ].join(' ')
}

export function getGlassPanelClipPath(
  size?: { width: number; height: number },
  edge?: GlassPanelArrowEdge,
  offset?: number,
  panelRadiusRem = GLASS_PANEL_RADIUS_REM,
) {
  const path = getGlassPanelPath(size, edge, offset, panelRadiusRem)

  return path ? svgPathToCssPath(path) : undefined
}

export function getGlassPanelArrowPadding(edge?: GlassPanelArrowEdge): CSSProperties {
  if (edge === 'bottom') return { paddingBottom: `${GLASS_PANEL_ARROW_HEIGHT_REM}rem` }
  if (edge === 'left') return { paddingLeft: `${GLASS_PANEL_ARROW_HEIGHT_REM}rem` }
  if (edge === 'right') return { paddingRight: `${GLASS_PANEL_ARROW_HEIGHT_REM}rem` }

  return {}
}
