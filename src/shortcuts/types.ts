export interface ShortcutBinding {
  id: string
  match: (event: KeyboardEvent) => boolean
  handler: (event: KeyboardEvent) => void
  preventDefault?: boolean
}
