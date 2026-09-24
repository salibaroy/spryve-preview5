import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ViewToggle } from '@/components/ui'
import type { ViewMode } from '@/lib/store'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/* Shared listing framework for Opportunities and Library.                      */
/* Each subcategory supplies its own facets, sorts and card — the frame stays. */
/* -------------------------------------------------------------------------- */

export interface Facet<T> {
  id: string
  label: string
  get: (item: T) => string[]
  /** Fixed option order (otherwise by count). */
  order?: string[]
}

export interface SortOption<T> {
  id: string
  label: string
  compare: (a: T, b: T) => number
}

export type Selection = Record<string, string[]>

export function useListing<T>(items: T[], facets: Facet<T>[], sorts: SortOption<T>[], search: (item: T) => string, initial: Selection = {}) {
  const [selected, setSelected] = useState<Selection>(initial)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(sorts[0]?.id ?? '')

  const options = useMemo(
    () =>
      facets.map((f) => {
        const counts = new Map<string, number>()
        for (const it of items) for (const v of f.get(it)) counts.set(v, (counts.get(v) ?? 0) + 1)
        let entries = [...counts.entries()]
        entries = f.order ? entries.sort((a, b) => f.order!.indexOf(a[0]) - f.order!.indexOf(b[0])) : entries.sort((a, b) => b[1] - a[1])
        return { facet: f, entries }
      }),
    [items, facets],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = items.filter((it) => {
      for (const f of facets) {
        const sel = selected[f.id]
        if (sel?.length && !f.get(it).some((v) => sel.includes(v))) return false
      }
      return !q || search(it).toLowerCase().includes(q)
    })
    const s = sorts.find((x) => x.id === sort)
    return s ? [...out].sort(s.compare) : out
  }, [items, facets, selected, query, sort, sorts, search])

  const toggle = (facetId: string, value: string) =>
    setSelected((s) => {
      const cur = s[facetId] ?? []
      return { ...s, [facetId]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] }
    })

  const activeCount = Object.values(selected).reduce((n, v) => n + v.length, 0) + (query ? 1 : 0)
  const reset = () => {
    setSelected({})
    setQuery('')
  }

  return { options, results, selected, toggle, query, setQuery, sort, setSort, activeCount, reset }
}

type ListingState<T> = ReturnType<typeof useListing<T>>

function FilterPanel<T>({ l }: { l: ListingState<T> }) {
  return (
    <div className="flex flex-col">
      {l.options.map(({ facet, entries }) =>
        entries.length < 2 && !(l.selected[facet.id]?.length) ? null : (
          <fieldset key={facet.id} className="border-line border-t py-4 first:border-t-0 first:pt-0">
            <legend className="eyebrow mb-3 !text-[0.625rem]">{facet.label}</legend>
            <div className="flex flex-col gap-0.5">
              {entries.map(([value, count]) => {
                const on = l.selected[facet.id]?.includes(value) ?? false
                return (
                  <label key={value} className={cn('hover:bg-raised flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[0.875rem]', on ? 'text-fg' : 'text-fg-2')}>
                    <input type="checkbox" checked={on} onChange={() => l.toggle(facet.id, value)} className="sr-only" />
                    <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-colors', on ? 'bg-electric border-electric' : 'border-line-strong')} aria-hidden>
                      {on && <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{value}</span>
                    <span className="text-fg-2 font-mono text-[0.6875rem]">{count}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ),
      )}
      {l.activeCount > 0 && (
        <button type="button" onClick={l.reset} className="text-electric mt-2 self-start text-[0.8125rem] hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  )
}

export function ListingLayout<T>({
  l,
  sorts,
  view,
  setView,
  noun,
  searchPlaceholder,
  renderItem,
  empty,
  showViewToggle = true,
}: {
  l: ListingState<T>
  sorts: SortOption<T>[]
  view: ViewMode
  setView: (v: ViewMode) => void
  noun: [string, string]
  searchPlaceholder: string
  renderItem: (item: T, view: ViewMode) => ReactNode
  empty?: ReactNode
  showViewToggle?: boolean
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const count = l.results.length
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-24">
          <FilterPanel l={l} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="border-line-strong bg-base focus-within:border-electric flex h-10 flex-1 items-center gap-2 rounded-full border px-3.5">
            <Search className="text-fg-2 h-4 w-4 shrink-0" aria-hidden />
            <input value={l.query} onChange={(e) => l.setQuery(e.target.value)} placeholder={searchPlaceholder} className="text-fg w-full bg-transparent text-[0.875rem] outline-none" aria-label="Search this list" />
            {l.query && (
              <button type="button" onClick={() => l.setQuery('')} aria-label="Clear search" className="text-fg-2 hover:text-fg">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setFiltersOpen(true)} className="btn btn-secondary btn-sm lg:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Filters{l.activeCount ? ` · ${l.activeCount}` : ''}
            </button>
            <label className="sr-only" htmlFor="sort">
              Sort
            </label>
            <select id="sort" value={l.sort} onChange={(e) => l.setSort(e.target.value)} className="input !min-h-[34px] !w-auto max-w-[190px] !rounded-full !py-1 !pr-8 !text-[0.8125rem]">
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {showViewToggle && <ViewToggle value={view} onChange={setView} />}
          </div>
        </div>

        <p className="text-fg-2 mt-4 mb-4 text-[0.8125rem]" aria-live="polite">
          <span className="text-fg font-medium">{count}</span> {count === 1 ? noun[0] : noun[1]}
          {l.activeCount > 0 && ' match your filters'}
        </p>

        {count === 0 ? (
          empty ?? (
            <div className="border-line-strong rounded-[20px] border border-dashed px-6 py-12 text-center">
              <p className="text-fg font-medium">No {noun[1]} match these filters</p>
              <button type="button" onClick={l.reset} className="btn btn-secondary btn-sm mt-4">
                Clear filters
              </button>
            </div>
          )
        ) : (
          /* Switching area remounts the listing, so the result set fades in once — a
             clear change without moving long lists around. Filters only re-flow. */
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className={cn(view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-2.5')}>
            <AnimatePresence initial={false}>
              {l.results.map((item) => (
                <motion.div key={(item as { id: string }).id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {renderItem(item, view)}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* mobile filter sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.button type="button" tabIndex={-1} aria-label="Close filters" className="bg-base/80 absolute inset-0 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="bg-raised border-line absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[22px] border-t p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display font-semibold">Filters</p>
                <button type="button" onClick={() => setFiltersOpen(false)} className="text-fg-2 hover:text-fg rounded-full p-1" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <FilterPanel l={l} />
              <button type="button" onClick={() => setFiltersOpen(false)} className="btn btn-primary mt-5 w-full">
                Show {count} {count === 1 ? noun[0] : noun[1]}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Sub-navigation shared by Opportunities and Library (works on every screen size). */
export function AreaTabs({ items, active }: { items: { id: string; label: string; to: string; count?: number }[]; active: string }) {
  return (
    <nav aria-label="Sections" className="border-line -mx-4 flex gap-1 overflow-x-auto border-b px-4 no-scrollbar md:mx-0 md:px-0">
      {items.map((it) => {
        const on = it.id === active
        return (
          <Link key={it.id} to={it.to} aria-current={on ? 'page' : undefined} className={cn('relative shrink-0 px-3 pt-2 pb-3 text-[0.875rem] font-medium transition-colors', on ? 'text-fg' : 'text-fg-2 hover:text-fg')}>
            {it.label}
            {it.count !== undefined && <span className="text-fg-2 ml-1.5 font-mono text-[0.75rem]">{it.count}</span>}
            {on && <motion.span layoutId="p5-area-tab" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="bg-electric absolute inset-x-2 -bottom-px h-[2px] rounded-full" />}
          </Link>
        )
      })}
    </nav>
  )
}
