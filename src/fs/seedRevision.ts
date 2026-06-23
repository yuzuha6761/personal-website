import mainTree from '~/storages/hard-drive/mcintosh-hd/tree.json'
import yuzuhaTree from '~/storages/hard-drive/mcintosh-hd/users/yuzuha/tree.json'
import templateTree from '~/storages/hard-drive/mcintosh-hd/users/_template/tree.json'

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`
}

function shortHash(input: string): string {
  let hash = 5381

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index)
  }

  return (hash >>> 0).toString(16)
}

export function getFsSeedRevision(): string {
  if (import.meta.env.DEV) {
    const pinned = localStorage.getItem('dev:pinFsSeedRevision')
    if (pinned) return pinned
  }

  return shortHash(stableStringify({
    main: mainTree,
    yuzuha: yuzuhaTree,
    template: templateTree,
  }))
}

export function getFsSeedSourcesForRevision() {
  return {
    main: mainTree,
    yuzuha: yuzuhaTree,
    template: templateTree,
  }
}
