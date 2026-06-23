import { createElement, type ComponentType, type ReactNode } from 'react'
import type { ContextualMenuItem } from '~/components/ContextualMenu'
import { getSeekerWindowKind, resolveSeekerWindowOptions } from './Seeker/windows'
import type {
  AppId,
  Application,
  ApplicationManifest,
  ApplicationWindowHandlers,
  WindowDisplayOptions,
  OpenWindowOptions,
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

export interface ApplicationMenuBarSelectContext {
  appId: AppId
  menuId: string
  windows: WindowState[]
  openWindow: (appId: AppId, options?: OpenWindowOptions) => string
  focusWindow: (windowId: string) => void
}

export type ApplicationMenuBarSelectHandler = (
  event: { itemId: string; context: ApplicationMenuBarSelectContext },
) => void

type ApplicationComponentModule = { default: ComponentType }
type ApplicationComponentLoader = () => Promise<ApplicationComponentModule>

interface ApplicationEntry {
  Component?: ComponentType
  loadComponent: ApplicationComponentLoader
  dockMenuItems?: ContextualMenuItem[] | ApplicationDockMenuItemsFactory
  onDockMenuSelect?: ApplicationDockMenuSelectHandler
  onMenuBarSelect?: ApplicationMenuBarSelectHandler
  menuBarItems: ApplicationMenuBarItem[]
  windowOptions: WindowDisplayOptions
}

export interface ApplicationRenderConfig {
  children: ReactNode
  windowOptions: WindowDisplayOptions
}

const manifestModules = import.meta.glob<{ default: ApplicationManifest }>(
  './*/manifest.ts',
  { eager: true },
)

const iconModules = import.meta.glob<string>(
  ['./*/icon.png', './*/icon.svg'],
  { eager: true, query: '?url', import: 'default' },
)

const applicationModules = import.meta.glob<ApplicationComponentModule>(
  './*/index.tsx',
)

const menuModules = import.meta.glob<{
  default?: ApplicationMenuBarItem[]
  dockMenuItems?: ContextualMenuItem[] | ApplicationDockMenuItemsFactory
  onDockMenuSelect?: ApplicationDockMenuSelectHandler
  onMenuBarSelect?: ApplicationMenuBarSelectHandler
  seekerDockMenuItems?: ContextualMenuItem[] | ApplicationDockMenuItemsFactory
  seekerMenuBarItems?: ApplicationMenuBarItem[]
  onSeekerDockMenuSelect?: ApplicationDockMenuSelectHandler
  onSeekerMenuBarSelect?: ApplicationMenuBarSelectHandler
}>(
  './*/menu.ts',
  { eager: true },
)

const applicationWindowHandlerModules = import.meta.glob<{
  applicationWindowHandlers?: ApplicationWindowHandlers
}>(
  './*/windows.ts',
  { eager: true },
)

function folderNameToAppId(folderName: string): string {
  return folderName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function pickWindowOptions(manifest: ApplicationManifest): WindowDisplayOptions {
  return {
    fullSizeContentView: manifest.fullSizeContentView,
    trafficLightsPosition: manifest.trafficLightsPosition,
    zoomDisabled: manifest.zoomDisabled,
    minimizeDisabled: manifest.minimizeDisabled,
    resizable: manifest.resizable,
    minSize: manifest.minSize,
    size: manifest.size,
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

function buildApplicationWindowHandlersRegistry(): Map<string, ApplicationWindowHandlers> {
  const registry = new Map<string, ApplicationWindowHandlers>()

  for (const [path, module] of Object.entries(applicationWindowHandlerModules)) {
    const match = path.match(/\.\/([^/]+)\/windows\.ts$/)
    if (!match || !module.applicationWindowHandlers) continue

    registry.set(folderNameToAppId(match[1]), module.applicationWindowHandlers)
  }

  return registry
}

function buildApplications(): {
  applicationList: Application[]
  applicationRegistry: Map<string, ApplicationEntry>
  applicationWindowHandlersRegistry: Map<string, ApplicationWindowHandlers>
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

    const componentLoader = applicationModules[`./${folderName}/index.tsx`]
    if (componentLoader) {
      const menuModule = menuModules[`./${folderName}/menu.ts`]
      applicationRegistry.set(appId, {
        loadComponent: componentLoader,
        dockMenuItems: menuModule?.dockMenuItems ?? menuModule?.seekerDockMenuItems,
        onDockMenuSelect: menuModule?.onDockMenuSelect ?? menuModule?.onSeekerDockMenuSelect,
        onMenuBarSelect: menuModule?.onMenuBarSelect ?? menuModule?.onSeekerMenuBarSelect,
        menuBarItems: menuModule?.default ?? menuModule?.seekerMenuBarItems ?? [],
        windowOptions: pickWindowOptions(manifestModule.default),
      })
    }
  }

  return {
    applicationList,
    applicationRegistry,
    applicationWindowHandlersRegistry: buildApplicationWindowHandlersRegistry(),
  }
}

const { applicationList, applicationRegistry, applicationWindowHandlersRegistry } = buildApplications()
const applicationPreloadPromises = new Map<string, Promise<void>>()

export { applicationList, applicationRegistry }

export function getApplicationById(id: string): Application | undefined {
  return applicationList.find((application) => application.id === id)
}

export function getApplicationEntry(appId: string): ApplicationEntry | undefined {
  return applicationRegistry.get(appId)
}

export function isApplicationLoaded(appId: string): boolean {
  return Boolean(getApplicationEntry(appId)?.Component)
}

export function preloadApplication(appId: string): Promise<void> {
  const entry = getApplicationEntry(appId)

  if (!entry) return Promise.reject(new Error(`Unknown application: ${appId}`))
  if (entry.Component) return Promise.resolve()

  const existingPromise = applicationPreloadPromises.get(appId)
  if (existingPromise) return existingPromise

  const promise = entry.loadComponent().then((module) => {
    entry.Component = module.default
    applicationPreloadPromises.delete(appId)
  }).catch((error) => {
    applicationPreloadPromises.delete(appId)
    throw error
  })

  applicationPreloadPromises.set(appId, promise)
  return promise
}

export function getApplicationWindowHandlers(appId: string): ApplicationWindowHandlers | undefined {
  return applicationWindowHandlersRegistry.get(appId)
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

export function selectApplicationMenuBarItem(
  appId: string,
  event: { itemId: string; context: ApplicationMenuBarSelectContext },
) {
  getApplicationEntry(appId)?.onMenuBarSelect?.(event)
}

function resolveWindowOptions(
  appId: string,
  baseOptions: WindowDisplayOptions,
  window?: WindowState,
): WindowDisplayOptions {
  if (appId === 'seeker') {
    return resolveSeekerWindowOptions(getSeekerWindowKind(window?.payload))
  }

  return baseOptions
}

export function resolveApplication(appId: string, window?: WindowState): ApplicationRenderConfig {
  const entry = getApplicationEntry(appId)

  if (entry) {
    const { Component, windowOptions } = entry

    if (!Component) {
      return {
        children: null,
        windowOptions: resolveWindowOptions(appId, windowOptions, window),
      }
    }

    return {
      children: createElement(Component),
      windowOptions: resolveWindowOptions(appId, windowOptions, window),
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
