import { createElement, type ComponentType, type ReactNode } from 'react'
import type {
  Application,
  ApplicationManifest,
  ApplicationWindowDisplayOptions,
} from '~types'

interface ApplicationEntry {
  Component: ComponentType
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
  './*/icon.png',
  { eager: true, query: '?url', import: 'default' },
)

const applicationModules = import.meta.glob<{ default: ComponentType }>(
  './*/index.tsx',
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

    if (!icon) {
      console.warn(`Application "${folderName}" is missing icon.png`)
      continue
    }

    applicationList.push({
      id: appId,
      icon,
      ...pickApplicationMeta(manifestModule.default),
    })

    const componentModule = applicationModules[`./${folderName}/index.tsx`]
    if (componentModule) {
      applicationRegistry.set(appId, {
        Component: componentModule.default,
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
