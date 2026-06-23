import type { SeekerSidebarItem } from '~/components/applications/Seeker/Main/types'
import { getStorageDevicesByCategoryId } from '~/storages'
import { isStorageCategoryId } from '~/storages/categories'

export const PERMANENT_LOCATION_NETWORK_ITEM: SeekerSidebarItem = {
  id: 'network',
  label: '网络',
  icon: 'globe',
  checked: true,
}

export function isSidebarItemVisible(item: { checked?: boolean; indeterminate?: boolean }) {
  return Boolean(item.checked || item.indeterminate)
}

export interface LocationSidebarEntry {
  item: SeekerSidebarItem
  depth: number
}

export function buildLocationSidebarEntries(categories: SeekerSidebarItem[]): LocationSidebarEntry[] {
  const entries: LocationSidebarEntry[] = []

  for (const item of categories) {
    if (item.id === 'yuzuha-website') {
      if (isSidebarItemVisible(item)) {
        entries.push({ item, depth: 0 })
      }
      continue
    }

    if (!isStorageCategoryId(item.id) || !isSidebarItemVisible(item)) continue

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

export function buildVisibleSidebarEntries(sectionId: string, items: SeekerSidebarItem[]): LocationSidebarEntry[] {
  if (sectionId === 'locations') {
    return buildLocationSidebarEntries(items)
  }

  return items
    .filter(isSidebarItemVisible)
    .map((item) => ({ item, depth: 0 }))
}
