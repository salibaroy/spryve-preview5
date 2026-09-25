import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, MessageCircle, Plus, Search } from 'lucide-react'
import { AreaTabs } from '@/components/app/Listing'
import { CompanyMark, PageHeader, SampleNote, ViewToggle } from '@/components/ui'
import { CompanyCard } from '@/components/ui/cards'
import { companies, STAGES } from '@/lib/data'
import { useStore, useViewMode } from '@/lib/store'
import { cn } from '@/lib/utils'

export function hubTabs(unread: number) {
  return [
    { id: 'overview', label: 'Hub overview', to: '/app/hub' },
    { id: 'company', label: 'My company', to: '/app/hub/my-company' },
    { id: 'messages', label: 'Messages', to: '/app/hub/messages', count: unread || undefined },
  ]
}

function Pills({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="eyebrow w-24 shrink-0 !text-[0.625rem]">{label}</span>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label={label}>
        {['All', ...options].map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className="chip shrink-0">
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HubOverview() {
  const { state, unread } = useStore()
  const [view, setView] = useViewMode('hub', 'grid')
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('All')
  const [stage, setStage] = useState('All')
  const [need, setNeed] = useState('All')

  const industries = useMemo(() => [...new Set(companies.map((c) => c.industry))], [])
  const needs = useMemo(() => [...new Set(companies.flatMap((c) => c.lookingFor))], [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return companies.filter((c) => {
      if (industry !== 'All' && c.industry !== industry) return false
      if (stage !== 'All' && c.stage !== stage) return false
      if (need !== 'All' && !c.lookingFor.includes(need)) return false
      if (!q) return true
      return [c.name, c.short, c.industry, c.subIndustry, c.location, ...c.founders.map((f) => `${f.firstName} ${f.familyName}`)].join(' ').toLowerCase().includes(q)
    })
  }, [query, industry, stage, need])

  const c = state.company
  const connected = Object.values(state.connections).filter((v) => v === 'connected').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Hub"
        title="See what others are building"
        description="Discover founders and companies, present your own, connect and keep the conversation going."
        actions={
          <>
            <Link to="/app/hub/messages" className="btn btn-secondary btn-sm">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Messages{unread ? ` · ${unread}` : ''}
            </Link>
            {c ? (
              <Link to="/app/hub/my-company" className="btn btn-connect btn-sm">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                My company
              </Link>
            ) : (
              <Link to="/app/hub/my-company/new" className="btn btn-primary btn-sm">
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Create your company
              </Link>
            )}
          </>
        }
      />
      <AreaTabs items={hubTabs(unread)} active="overview" />

      {/* Your place in the Hub */}
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        {c ? (
          <Link to="/app/hub/my-company" className="card card-interactive flex items-center gap-4 p-5">
            <CompanyMark mark={c.mark} accent="lime" />
            <span className="min-w-0 flex-1">
              <span className="eyebrow block !text-[0.625rem]">Your company</span>
              <span className="text-fg block font-medium">{c.name}</span>
              <span className="text-fg-2 block truncate text-[0.8125rem]">{c.short}</span>
            </span>
            <span className="text-electric text-[0.8125rem] font-medium max-sm:hidden">Manage</span>
          </Link>
        ) : (
          <div className="card border-lime/30 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="border-line-strong text-fg-2 grid h-11 w-11 shrink-0 place-items-center rounded-[11px] border border-dashed">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-fg block font-medium">Present your company</span>
              <span className="text-fg-2 block text-[0.8125rem]">A guided profile so founders can find you and see what you’re looking for.</span>
            </span>
            <Link to="/app/hub/my-company/new" className="btn btn-primary btn-sm self-start sm:self-auto">
              Create your company
            </Link>
          </div>
        )}
        <div className="card flex items-center justify-around gap-4 p-5">
          {[
            ['Connections', connected],
            ['Conversations', state.threads.length],
            ['Unread', unread],
          ].map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="font-display text-[1.5rem] font-semibold">{v}</p>
              <p className="text-fg-2 text-[0.75rem]">{k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* P4's browsing layout: one search, three rows of filters, a clear grid */}
      <div className="flex flex-col gap-4">
        <label className="border-line-strong bg-raised focus-within:border-electric flex h-12 items-center gap-3 rounded-full border px-5">
          <Search className="text-fg-2 h-4 w-4 shrink-0" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search founders, companies, industries or cities" className="text-fg w-full bg-transparent text-[0.9375rem] outline-none" aria-label="Search Founders Hub" />
        </label>
        <Pills label="Industry" options={industries} value={industry} onChange={setIndustry} />
        <Pills label="Stage" options={STAGES} value={stage} onChange={setStage} />
        <Pills label="Looking for" options={needs} value={need} onChange={setNeed} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-fg-2 text-[0.8125rem]" aria-live="polite">
          <span className="text-fg font-medium">{results.length}</span> {results.length === 1 ? 'company' : 'companies'} · sample profiles
        </p>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {results.length === 0 ? (
        <div className="border-line-strong rounded-[20px] border border-dashed px-6 py-12 text-center">
          <p className="text-fg font-medium">No companies match those filters</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-4"
            onClick={() => {
              setQuery('')
              setIndustry('All')
              setStage('All')
              setNeed('All')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div layout className={cn(view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-2.5')}>
          <AnimatePresence initial={false}>
            {results.map((co) => (
              <motion.div key={co.slug} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <CompanyCard c={co} view={view} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      <SampleNote>All companies and people shown are fictional sample profiles.</SampleNote>
    </div>
  )
}
