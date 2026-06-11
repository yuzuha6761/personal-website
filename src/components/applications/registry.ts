import { createElement, type ComponentType, type ReactNode } from 'react'
import type { ContextualMenuItem } from '../ContextualMenu'
import type {
  AppId,
  Application,
  ApplicationManifest,
  ApplicationWindowDisplayOptions,
  WindowState,
} from '~types'

export interface ApplicationMenuBarItem {
  id: string
  label: string
  items: ContextualMenuItem[]
}

export interface ApplicationDockMenuContext {
  appId: AppId
  appName: string
  running: boolean
  windows: WindowState[]
}

export interface ApplicationDockMenuSelectContext extends ApplicationDockMenuContext {
  openApp: (appId: AppId) => string
  openWindow: (appId: AppId, options?: { title?: string; position?: { x: number; y: number }; payload?: Record<string, unknown> }) => string
}

export type ApplicationDockMenuItemsFactory = (
  context: ApplicationDockMenuContext,
) => ContextualMenuItem[]

export type ApplicationDockMenuSelectHandler = (
  event: { itemId: string; context: ApplicationDockMenuSelectContext },
) => void

interface ApplicationEntry {
  Component: ComponentType
  dockMenuItems?: ContextualMenuItem[] | ApplicationDockMenuItemsFactory
  onDockMenuSelect?: ApplicationDockMenuSelectHandler
  menuBarItems: ApplicationMenuBarItem[]
  windowOptions: ApplicationWindowDisplayOptions
}

export interface ApplicationRenderConfig {
  children: ReactNode
  windowOptions: ApplicationWindowDisplayOptions
}

const manifestModules = import.meta.glob<{ default: ApplicationManifest }>(
  './*/manifest.ts',
  { eager: true },
)

const iconModules = import.meta.glob<string>(
  ['./*/icon.png', './*/icon.svg'],
  { eager: true, query: '?url', import: 'default' },
)

const applicationModules = import.meta.glob<{ default: ComponentType }>(
  './*/index.tsx',
  { eager: true },
)

const menuModules = import.meta.glob<{
  default?: ApplicationMenuBarItem[]
  dockMenuItems?: ContextualMenuItem[] | ApplicationDockMenuItemsFactory
  onDockMenuSelect?: ApplicationDockMenuSelectHandler
  seekerDockMenuItems?: ContextualMenuItem[] | ApplicationDockMenuItemsFactory
  seekerMenuBarItems?: ApplicationMenuBarItem[]
  onSeekerDockMenuSelect?: ApplicationDockMenuSelectHandler
}>(
  './*/menu.ts',
  { eager: true },
)

function folderNameToAppId(folderName: string): string {
  return folderName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function pickWindowOptions(manifest: ApplicationManifest): ApplicationWindowDisplayOptions {
  return {
    fullSizeContentView: manifest.fullSizeContentView,
    trafficLightsPosition: manifest.trafficLightsPosition,
  }
}

function pickApplicationMeta(
  manifest: ApplicationManifest,
): Omit<Application, 'id' | 'icon'> {
  return {
    name: manifest.name,
    defaultSizeX: manifest.defaultSizeX,
    defaultSizeY: manifest.defaultSizeY,
    singleInstance: manifest.singleInstance,
    addIconSafeArea: manifest.addIconSafeArea ?? false,
  }
}

function buildApplications(): {
  applicationList: Application[]
  applicationRegistry: Map<string, ApplicationEntry>
} {
  const applicationList: Application[] = []
  const applicationRegistry = new Map<string, ApplicationEntry>()

  for (const [path, manifestModule] of Object.entries(manifestModules)) {
    const match = path.match(/\.\/([^/]+)\/manifest\.ts$/)
    if (!match) continue

    const folderName = match[1]
    const appId = folderNameToAppId(folderName)
    const icon = iconModules[`./${folderName}/icon.png`]
      ?? iconModules[`./${folderName}/icon.svg`]

    if (!icon) {
      console.warn(`Application "${folderName}" is missing icon.png or icon.svg`)
      continue
    }

    applicationList.push({
      id: appId,
      icon,
      ...pickApplicationMeta(manifestModule.default),
    })

    const componentModule = applicationModules[`./${folderName}/index.tsx`]
    if (componentModule) {
      const menuModule = menuModules[`./${folderName}/menu.ts`]
      applicationRegistry.set(appId, {
        Component: componentModule.default,
        dockMenuItems: menuModule?.dockMenuItems ?? menuModule?.seekerDockMenuItems,
        onDockMenuSelect: menuModule?.onDockMenuSelect ?? menuModule?.onSeekerDockMenuSelect,
        menuBarItems: menuModule?.default ?? menuModule?.seekerMenuBarItems ?? [],
        windowOptions: pickWindowOptions(manifestModule.default),
      })
    }
  }

  return { applicationList, applicationRegistry }
}

const { applicationList, applicationRegistry } = buildApplications()

export { applicationList, applicationRegistry }

export function getApplicationById(id: string): Application | undefined {
  return applicationList.find((application) => application.id === id)
}

export function getApplicationEntry(appId: string): ApplicationEntry | undefined {
  return applicationRegistry.get(appId)
}

export function getApplicationMenuBarItems(appId: string): ApplicationMenuBarItem[] {
  return getApplicationEntry(appId)?.menuBarItems ?? []
}

export function getApplicationDockMenuItems(
  appId: string,
  context: ApplicationDockMenuContext,
): ContextualMenuItem[] {
  const dockMenuItems = getApplicationEntry(appId)?.dockMenuItems

  if (!dockMenuItems) return []
  if (typeof dockMenuItems === 'function') return dockMenuItems(context)

  return dockMenuItems
}

export function selectApplicationDockMenuItem(
  appId: string,
  event: { itemId: string; context: ApplicationDockMenuSelectContext },
) {
  getApplicationEntry(appId)?.onDockMenuSelect?.(event)
}

export function resolveApplication(appId: string): ApplicationRenderConfig {
  const entry = getApplicationEntry(appId)

  if (entry) {
    const { Component, windowOptions } = entry
    return {
      children: createElement(Component),
      windowOptions,
    }
  }

  return {
    children: createElement(
      'div',
      { className: 'w-full h-full flex items-center justify-center text-#30363d bg-#f6f6f3' },
      'Coming Soon',
    ),
    windowOptions: {},
  }
}
