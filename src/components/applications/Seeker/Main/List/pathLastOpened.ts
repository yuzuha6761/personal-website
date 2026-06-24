const pathLastOpenedAt = new Map<string, number>()

export function recordPathOpened(path: string) {
  pathLastOpenedAt.set(path, Date.now())
}

export function getPathLastOpenedAt(path: string, fallback = 0): number {
  return pathLastOpenedAt.get(path) ?? fallback
}
