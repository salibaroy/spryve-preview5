import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Bookmark, BookmarkX } from 'lucide-react'
import { AreaTabs } from '@/components/app/Listing'
import { EmptyState, PageHeader } from '@/components/ui'
import { useToast } from '@/components/ui/feedback'
import { oppAreaTabs } from './Opportunities'
import { libAreaTabs } from './Library'
import { useStore, type SavedEntry } from '@/lib/store'
import { GROUP_ORDER, resolveSaved, type ResolvedSaved, type SavedArea } from '@/lib/saved'
import { cn, timeAgo } from '@/lib/utils'

function SavedCard({ r, savedAt }: { r: ResolvedSaved; savedAt: number }) {
  const { removeSaved } = useStore()
  const toast = useToast()
  return (
    <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }} className="card card-interactive relative flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow !text-[0.625rem]">{r.meta.split(' · ')[0]}</span>
        <button
          type="button"
          onClick={() => {
            removeSaved(r.key)
            toast('Removed from saved.')
          }}
          className="border-lime/40 bg-lime/10 text-lime hover:bg-lime/20 relative z-10 grid h-8 w-8 place-items-center rounded-full border"
          aria-label={`Remove ${r.title} from saved`}
        >
          <BookmarkX className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <h3 className="t-card mt-2">
        <Link to={r.to} className="after:absolute after:inset-0 hover:underline">
          {r.title}
        </Link>
      </h3>
      <p className="text-fg-2 mt-1 text-[0.8125rem]">{r.meta.split(' · ').slice(1).join(' · ')}</p>
      <p className="text-fg-2 mt-auto pt-4 text-[0.75rem]">Saved {timeAgo(savedAt)}</p>
    </motion.article>
  )
}

function useGrouped(entries: SavedEntry[], area?: SavedArea) {
  return useMemo(() => {
    const rows = entries.map((e) => ({ e, r: resolveSaved(e.key) })).filter((x): x is { e: SavedEntry; r: ResolvedSaved } => Boolean(x.r) && (!area || x.r!.area === area))
    const groups = new Map<string, typeof rows>()
    for (const row of rows) groups.set(row.r.group, [...(groups.get(row.r.group) ?? []), row])
    return { rows, groups: [...groups.entries()].sort((a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0])) }
  }, [entries, area])
}

/** P3-style grouped view: filter chips with counts, then one section per group. */
function GroupedSaved({ area, emptyAction }: { area?: SavedArea; emptyAction: React.ReactNode }) {
  const { state } = useStore()
  const { rows, groups } = useGrouped(state.saved, area)
  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? groups.filter(([g]) => g === filter) : groups

  if (rows.length === 0) {
    return <EmptyState icon={<Bookmark />} title="Nothing saved here yet" body="Use the bookmark on any listing. Saved items appear on your Dashboard, in Saved, and in the area they came from." action={emptyAction} />
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter saved items">
        <button type="button" data-active={!filter} aria-pressed={!filter} onClick={() => setFilter(null)} className="chip shrink-0">
          All <span className="font-mono text-[0.75rem]">{rows.length}</span>
        </button>
        {groups.map(([g, items]) => (
          <button key={g} type="button" data-active={filter === g} aria-pressed={filter === g} onClick={() => setFilter(filter === g ? null : g)} className="chip shrink-0">
            {g} <span className="font-mono text-[0.75rem]">{items.length}</span>
          </button>
        ))}
      </div>
      <div className="grid items-start gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence initial={false}>
        {shown.map(([g, items]) => (
          <motion.section key={g} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label={g}>
            <div className="border-line mb-4 flex items-baseline justify-between border-b pb-2">
              <h2 className="font-display text-[1.0625rem] font-semibold">{g}</h2>
              <span className="text-fg-2 font-mono text-[0.75rem]">{items.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {items.map(({ e, r }) => (
                  <SavedCard key={r.key} r={r} savedAt={e.savedAt} />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        ))}
      </AnimatePresence>
      </div>
    </div>
  )
}

export function SavedAll() {
  const { state } = useStore()
  const areas: { id: SavedArea; label: string; to: string }[] = [
    { id: 'opportunities', label: 'Opportunities', to: '/app/opportunities/saved' },
    { id: 'library', label: 'Library', to: '/app/library/saved' },
    { id: 'hub', label: 'Founders Hub', to: '/app/hub' },
  ]
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Saved"
        title="Everything you’ve saved"
        description="From anywhere in Spryve, grouped the way you found it. The same list feeds your Dashboard and the Saved views inside Opportunities and Library."
        actions={
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => {
              const n = state.saved.filter((s) => resolveSaved(s.key)?.area === a.id).length
              return (
                <Link key={a.id} to={a.to} className={cn('btn btn-secondary btn-sm')}>
                  {a.label} <span className="text-fg-2 font-mono text-[0.75rem]">{n}</span>
                </Link>
              )
            })}
          </div>
        }
      />
      <GroupedSaved emptyAction={<Link to="/app/opportunities" className="btn btn-primary btn-sm">Browse opportunities</Link>} />
    </div>
  )
}

export function AreaSaved({ area }: { area: 'opportunities' | 'library' }) {
  const { state } = useStore()
  const count = state.saved.filter((s) => s.key.startsWith(area === 'opportunities' ? 'opp:' : 'lib:')).length
  const isOpp = area === 'opportunities'
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={isOpp ? 'Opportunities' : 'Library'}
        title={`Saved in ${isOpp ? 'Opportunities' : 'Library'}`}
        description="Filtered from your one saved list."
        actions={
          <Link to="/app/saved" className="btn btn-secondary btn-sm">
            All saved items
          </Link>
        }
      />
      <AreaTabs items={isOpp ? oppAreaTabs(count) : libAreaTabs(count)} active="saved" />
      <GroupedSaved area={area} emptyAction={<Link to={isOpp ? '/app/opportunities' : '/app/library'} className="btn btn-primary btn-sm">{isOpp ? 'Browse opportunities' : 'Browse the Library'}</Link>} />
    </div>
  )
}
