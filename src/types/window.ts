import type { AppId } from './app'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  minimized: boolean
  minimizedAt?: number
  maximized: boolean
  zIndex: number
  openedAt: number
  payload?: Record<string, unknown>
}

export interface OpenWindowOptions {
  title?: string
  position?: { x: number; y: number }
  size?: { width?: number; height?: number }
  payload?: Record<string, unknown>
  zIndex?: number
}
