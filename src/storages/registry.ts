import type { StorageDevice, StorageTreeNode, StorageVolumeManifest } from './types'
import { buildStorageDevices } from './scan'

const storageDevices = buildStorageDevices()

const storageDeviceById = new Map<string, StorageDevice>(storageDevices.map((device) => [device.id, device]))
const storageDeviceByPath = new Map<string, StorageDevice>(storageDevices.map((device) => [device.path, device]))
const storageDevicesByCategoryId = storageDevices.reduce<Map<string, StorageDevice[]>>((groups, device) => {
  const devices = groups.get(device.categoryId) ?? []
  devices.push(device)
  groups.set(device.categoryId, devices)
  return groups
}, new Map())

const bootStorageDevice = storageDevices.find((device) => device.boot) ?? storageDevices[0]

export function getAllStorageDevices(): StorageDevice[] {
  return storageDevices
}

export function getStorageDeviceById(deviceId: string): StorageDevice | undefined {
  return storageDeviceById.get(deviceId)
}

export function getStorageDeviceByPath(path: string): StorageDevice | undefined {
  return storageDeviceByPath.get(path)
}

export function getStorageDevicesByCategoryId(categoryId: string): StorageDevice[] {
  return storageDevicesByCategoryId.get(categoryId) ?? []
}

export function getBootStorageDevice(): StorageDevice {
  if (!bootStorageDevice) {
    throw new Error('No boot storage device found under src/storages')
  }
  return bootStorageDevice
}

export function resolveStorageDevicePath(deviceId: string): string | undefined {
  return getStorageDeviceById(deviceId)?.path
}

export function isStorageVolumePath(path: string): boolean {
  return storageDeviceByPath.has(path)
}

export type { StorageTreeNode, StorageVolumeManifest }
