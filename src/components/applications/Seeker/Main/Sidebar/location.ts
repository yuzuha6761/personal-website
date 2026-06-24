import type { SidebarItem } from '../types'
import { getStorageDevicesByCategoryId } from '~/storages'
import { isStorageCategoryId } from '~/storages/categories'

export const PERMANENT_LOCATION_NETWORK_ITEM: SidebarItem = {
  id: 'network',
  label: '网络',
  icon: 'globe',
  checked: true,
}

export function isItemVisible(item: { checked?: boolean; indeterminate?: boolean }) {
  return Boolean(item.checked || item.indeterminate)
}

export interface LocationEntry {
  item: SidebarItem
  depth: number
}

export function buildLocationEntries(categories: SidebarItem[]): LocationEntry[] {
  const entries: LocationEntry[] = []

  for (const item of categories) {
    if (item.id === 'yuzuha-website') {
      if (isItemVisible(item)) {
        entries.push({ item, depth: 0 })
      }
      continue
    }

    if (!isStorageCategoryId(item.id) || !isItemVisible(item)) continue

    for (const device of getStorageDevicesByCategoryId(item.id)) {
      entries.push({
        item: {
          id: device.id,
          label: device.name,
          icon: device.icon,
          checked: true,
        },
        depth: 0,
      })
    }
  }

  entries.push({ item: PERMANENT_LOCATION_NETWORK_ITEM, depth: 0 })

  return entries
}

export function buildVisibleEntries(sectionId: string, items: SidebarItem[]): LocationEntry[] {
  if (sectionId === 'locations') {
    return buildLocationEntries(items)
  }

  return items
    .filter(isItemVisible)
    .map((item) => ({ item, depth: 0 }))
}
