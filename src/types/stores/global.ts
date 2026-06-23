export interface GlobalStore {
  timestamp: number
  showHiddenFiles: boolean
  setTimestamp: (value: number) => void
  setShowHiddenFiles: (showHiddenFiles: boolean) => void
  toggleShowHiddenFiles: () => void
}
