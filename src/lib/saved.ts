import { companyBySlug, libById, LIB_CATEGORIES, oppById, OPP_CATEGORIES } from './data'
import type { SavedKey } from './store'

export type SavedArea = 'opportunities' | 'library' | 'hub'

export interface ResolvedSaved {
  key: SavedKey
  area: SavedArea
  /** Group heading used by the Saved views (e.g. "Accelerators", "Templates"). */
  group: string
  title: string
  meta: string
  to: string
}

/** Turns a saved key into something any Saved surface can render. */
export function resolveSaved(key: SavedKey): ResolvedSaved | null {
  const [kind, id] = key.split(':') as [string, string]
  if (kind === 'opp') {
    const o = oppById(id)
    if (!o) return null
    return {
      key,
      area: 'opportunities',
      group: OPP_CATEGORIES.find((c) => c.id === o.category)!.label,
      title: o.title,
      meta: `${o.type} · ${o.provider}`,
      to: `/app/opportunities/item/${o.id}`,
    }
  }
  if (kind === 'lib') {
    const l = libById(id)
    if (!l) return null
    return {
      key,
      area: 'library',
      group: LIB_CATEGORIES.find((c) => c.id === l.category)!.label,
      title: l.title,
      meta: `${l.format} · ${l.topic}`,
      to: `/app/library/item/${l.id}`,
    }
  }
  if (kind === 'company') {
    const c = companyBySlug(id)
    if (!c) return null
    return { key, area: 'hub', group: 'Founders & companies', title: c.name, meta: `${c.industry} · ${c.stage}`, to: `/app/hub/company/${c.slug}` }
  }
  return null
}

export const GROUP_ORDER = [
  ...OPP_CATEGORIES.map((c) => c.label),
  ...LIB_CATEGORIES.map((c) => c.label),
  'Founders & companies',
]
