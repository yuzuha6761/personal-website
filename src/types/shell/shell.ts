export type DesktopSortBy = 'none' | 'name' | 'kind' | 'date' | 'size'

export interface DesktopIconPosition {
  x: number
  y: number
}

export interface ShellStore {
  wallpaper: string
  useStacks: boolean
  sortBy: DesktopSortBy
  iconPositions: Record<string, DesktopIconPosition>
  setWallpaper: (wallpaper: string) => void
  setUseStacks: (useStacks: boolean) => void
  setSortBy: (sortBy: DesktopSortBy) => void
  setIconPosition: (nodeId: string, position: DesktopIconPosition) => void
  removeIconPosition: (nodeId: string) => void
}
