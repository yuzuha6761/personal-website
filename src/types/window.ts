import type { AppId } from './app'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  minimized: boolean
  maximized: boolean
  zIndex: number
  payload?: Record<string, unknown>
}

export interface OpenWindowOptions {
  title?: string
  position?: { x: number; y: number }
  payload?: Record<string, unknown>
}
