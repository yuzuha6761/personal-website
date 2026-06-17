interface WindowSnapshot {
  dataUrl: string
  height: number
  width: number
}

const snapshots = new Map<string, WindowSnapshot>()
const listeners = new Set<() => void>()

function emitSnapshotChange() {
  listeners.forEach((listener) => listener())
}

export function subscribeWindowSnapshots(listener: () => void) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export function getWindowSnapshot(windowId: string) {
  return snapshots.get(windowId) ?? null
}

export function deleteWindowSnapshot(windowId: string) {
  snapshots.delete(windowId)
  emitSnapshotChange()
}

export function publishWindowSnapshot(windowId: string, snapshot: WindowSnapshot) {
  snapshots.set(windowId, snapshot)
  emitSnapshotChange()
}

function copyComputedStyles(source: Element, target: Element) {
  if (!(source instanceof HTMLElement) || !(target instanceof HTMLElement)) return

  const computedStyle = window.getComputedStyle(source)
  for (const property of computedStyle) {
    target.style.setProperty(
      property,
      computedStyle.getPropertyValue(property),
      computedStyle.getPropertyPriority(property),
    )
  }

  target.style.animation = 'none'
  target.style.contain = 'paint'
  target.style.pointerEvents = 'none'
  target.style.transition = 'none'

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children[index]
    if (targetChild) copyComputedStyles(sourceChild, targetChild)
  })
}

function renderElementToSvgDataUrl(source: HTMLElement, rect: DOMRect) {
  const clone = source.cloneNode(true) as HTMLElement

  copyComputedStyles(source, clone)
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  clone.style.height = `${rect.height}px`
  clone.style.left = '0'
  clone.style.margin = '0'
  clone.style.position = 'relative'
  clone.style.top = '0'
  clone.style.transform = 'none'
  clone.style.width = `${rect.width}px`

  const serialized = new XMLSerializer().serializeToString(clone)
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">`,
    `<foreignObject width="100%" height="100%">${serialized}</foreignObject>`,
    '</svg>',
  ].join('')

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export async function createWindowSnapshot(source: HTMLElement): Promise<WindowSnapshot | null> {
  const rect = new DOMRect(
    0,
    0,
    source.offsetWidth || source.getBoundingClientRect().width,
    source.offsetHeight || source.getBoundingClientRect().height,
  )

  if (rect.width <= 0 || rect.height <= 0) return null

  const dataUrl = renderElementToSvgDataUrl(source, rect)
  return {
    dataUrl,
    height: rect.height,
    width: rect.width,
  }
}

export async function captureWindowSnapshot(windowId: string, source: HTMLElement) {
  const snapshot = await createWindowSnapshot(source)

  if (!snapshot) return

  publishWindowSnapshot(windowId, snapshot)
}
