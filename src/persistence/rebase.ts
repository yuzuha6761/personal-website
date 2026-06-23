import type { UserProfile } from '~/session/types'
import {
  applyFsOverlayToEffectiveHome,
  compactFsOverlay,
  diffHomeTrees,
  extractHomeSubtree,
  type FsOverlay,
  EMPTY_FS_OVERLAY,
} from '~/fs/overlay'
import type { FsNode } from '~types'
import { getFsSeedRevision } from '~/fs/seedRevision'
import type { UserFsRecord } from './types'

export function rebaseUserFsRecord(
  record: UserFsRecord,
  baseHomeNodes: Record<string, FsNode>,
): UserFsRecord {
  const currentRevision = getFsSeedRevision()
  if (record.baseRevision === currentRevision) return record

  const effectiveHome = record.strategy === 'homeSnapshot' && record.homeSnapshot
    ? record.homeSnapshot
    : applyFsOverlayToEffectiveHome(baseHomeNodes, record.overlay ?? EMPTY_FS_OVERLAY)

  const overlay = diffHomeTrees(baseHomeNodes, effectiveHome)

  if (import.meta.env.DEV) {
    console.info('[fs] rebase', record.baseRevision, '→', currentRevision)
  }

  return {
    version: 1,
    baseRevision: currentRevision,
    strategy: 'overlay',
    overlay: compactFsOverlay(overlay, baseHomeNodes),
    compactedAt: Date.now(),
  }
}

export function createEmptyUserFsRecord(): UserFsRecord {
  return {
    version: 1,
    baseRevision: getFsSeedRevision(),
    strategy: 'overlay',
    overlay: EMPTY_FS_OVERLAY,
  }
}

export function createRuntimeUserFsRecord(
  baseHomeNodes: Record<string, FsNode>,
): UserFsRecord {
  return {
    version: 1,
    baseRevision: getFsSeedRevision(),
    strategy: 'homeSnapshot',
    homeSnapshot: { ...baseHomeNodes },
  }
}

export function overlayFromUserFsRecord(
  record: UserFsRecord,
  baseHomeNodes: Record<string, FsNode>,
): FsOverlay {
  if (record.strategy === 'homeSnapshot' && record.homeSnapshot) {
    return diffHomeTrees(baseHomeNodes, record.homeSnapshot)
  }

  return record.overlay ?? EMPTY_FS_OVERLAY
}

export function userFsRecordFromOverlay(
  overlay: FsOverlay,
  user: UserProfile,
  baseHomeNodes: Record<string, FsNode>,
): UserFsRecord {
  const compacted = compactFsOverlay(overlay, baseHomeNodes)

  if (!user.builtin) {
    const effective = applyFsOverlayToEffectiveHome(baseHomeNodes, compacted)
    return {
      version: 1,
      baseRevision: getFsSeedRevision(),
      strategy: 'homeSnapshot',
      homeSnapshot: effective,
      compactedAt: Date.now(),
    }
  }

  return {
    version: 1,
    baseRevision: getFsSeedRevision(),
    strategy: 'overlay',
    overlay: compacted,
    compactedAt: Date.now(),
  }
}

export function extractBaseHomeNodes(
  baseNodes: Record<string, FsNode>,
  homePath: string,
): Record<string, FsNode> {
  return extractHomeSubtree(baseNodes, homePath)
}
