import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, Clock, Globe2, MapPin, ShieldCheck } from 'lucide-react'
import { AreaTabs, ListingLayout, useListing, type Facet, type SortOption } from '@/components/app/Listing'
import { DeadlineTag, PageHeader, SampleNote, SaveButton, Tag } from '@/components/ui'
import { ExternalAction } from '@/components/ui/feedback'
import { externalLabel, fitReasons, OpportunityCard, whereOf } from '@/components/ui/cards'
import NotFound from '@/routes/site/NotFound'
import { daysUntil, formatDate, oppById, opportunities, OPP_CATEGORIES, STAGES, type OppCategory, type Opportunity } from '@/lib/data'
import { useStore, useViewMode } from '@/lib/store'

/* -------------------------------------------------------------------------- */
/* Facets and sorts, tailored per subcategory                                  */
/* -------------------------------------------------------------------------- */

const deadlineWindow = (o: Opportunity) => {
  if (!o.deadline) return ['Rolling / always open']
  const d = daysUntil(o.deadline)
  if (d < 0) return ['Closed']
  if (d <= 14) return ['Closing within 2 weeks']
  if (d <= 45) return ['Closing within 6 weeks']
  return ['Later']
}

const eventWindow = (o: Opportunity) => {
  const d = daysUntil(o.date!)
  if (d <= 7) return ['This week']
  if (d <= 31) return ['Next 30 days']
  return ['Later']
}

const F = {
  type: (label = 'Type'): Facet<Opportunity> => ({ id: 'type', label, get: (o) => [o.type] }),
  stage: { id: 'stage', label: 'Stage', get: (o) => o.stages, order: STAGES } as Facet<Opportunity>,
  region: { id: 'region', label: 'Region', get: (o) => [o.region] } as Facet<Opportunity>,
  format: { id: 'format', label: 'Format', get: (o) => [o.format] } as Facet<Opportunity>,
  deadline: { id: 'deadline', label: 'Deadline', get: deadlineWindow, order: ['Closing within 2 weeks', 'Closing within 6 weeks', 'Later', 'Rolling / always open', 'Closed'] } as Facet<Opportunity>,
  sector: { id: 'sector', label: 'Sector focus', get: (o) => o.sectors } as Facet<Opportunity>,
  category: { id: 'category', label: 'Category', get: (o) => [OPP_CATEGORIES.find((c) => c.id === o.category)!.label], order: OPP_CATEGORIES.map((c) => c.label) } as Facet<Opportunity>,
  when: { id: 'when', label: 'When', get: eventWindow, order: ['This week', 'Next 30 days', 'Later'] } as Facet<Opportunity>,
  entry: { id: 'entry', label: 'Entry', get: (o) => [o.price ?? 'See host'] } as Facet<Opportunity>,
  location: { id: 'location', label: 'Location', get: (o) => [o.location] } as Facet<Opportunity>,
  dilution: { id: 'dilution', label: 'Funding kind', get: (o) => [['Grant', 'Competition prize', 'Revenue-based financing'].includes(o.type) ? 'Non-dilutive' : 'Equity investment'] } as Facet<Opportunity>,
}

const FACETS: Record<OppCategory | 'all', Facet<Opportunity>[]> = {
  all: [F.category, F.type('Programme type'), F.stage, F.region],
  accelerators: [F.type('Programme type'), F.stage, F.deadline, F.region, F.format, F.sector],
  incubators: [F.type('Programme type'), F.stage, F.deadline, F.region, F.format],
  funding: [F.type('Funding type'), F.dilution, F.stage, F.deadline, F.region],
  events: [F.when, F.type('Event type'), F.format, F.location, F.entry],
  services: [F.type('Service'), F.region, F.format],
}

function sortsFor(cat: OppCategory | 'all', fit: (o: Opportunity) => number): SortOption<Opportunity>[] {
  const soonest: SortOption<Opportunity> = { id: 'soonest', label: 'Closing soonest', compare: (a, b) => (a.deadline ? daysUntil(a.deadline) : 9999) - (b.deadline ? daysUntil(b.deadline) : 9999) }
  const fitSort: SortOption<Opportunity> = { id: 'fit', label: 'Best fit for my profile', compare: (a, b) => fit(b) - fit(a) }
  const az: SortOption<Opportunity> = { id: 'az', label: 'A–Z', compare: (a, b) => a.title.localeCompare(b.title) }
  if (cat === 'events') return [{ id: 'date', label: 'Date', compare: (a, b) => a.date!.localeCompare(b.date!) }, az]
  if (cat === 'services') return [az, fitSort]
  return [soonest, fitSort, az]
}

/* -------------------------------------------------------------------------- */

export function oppAreaTabs(savedCount: number) {
  return [
    { id: 'all', label: 'All', to: '/app/opportunities' },
    ...OPP_CATEGORIES.map((c) => ({ id: c.id, label: c.label, to: `/app/opportunities/${c.id}` })),
    { id: 'saved', label: 'Saved', to: '/app/opportunities/saved', count: savedCount },
  ]
}

function CategoryListing({ cat, initialType }: { cat: OppCategory | 'all'; initialType: string | null }) {
  const { state } = useStore()
  const [view, setView] = useViewMode('opportunities', 'grid')
  const items = useMemo(() => (cat === 'all' ? opportunities : opportunities.filter((o) => o.category === cat)), [cat])
  const fit = (o: Opportunity) => fitReasons(o, state.profile).length
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sorts = useMemo(() => sortsFor(cat, fit), [cat, state.profile])
  const l = useListing(items, FACETS[cat], sorts, (o) => `${o.title} ${o.provider} ${o.summary} ${o.location} ${o.type}`, initialType ? { type: [initialType] } : {})
  const meta = OPP_CATEGORIES.find((c) => c.id === cat)
  return (
    <ListingLayout
      l={l}
      sorts={sorts}
      view={view}
      setView={setView}
      noun={cat === 'services' ? ['provider', 'providers'] : cat === 'events' ? ['event', 'events'] : ['opportunity', 'opportunities']}
      searchPlaceholder={`Search ${meta ? meta.label.toLowerCase() : 'all opportunities'}`}
      renderItem={(o, v) => <OpportunityCard o={o} view={v} showWhy={cat !== 'services' && cat !== 'events'} />}
    />
  )
}

export function OpportunityList() {
  const { category } = useParams()
  const [params] = useSearchParams()
  const { state } = useStore()
  const cat = (category ?? 'all') as OppCategory | 'all'
  const meta = OPP_CATEGORIES.find((c) => c.id === cat)
  if (category && !meta) return <NotFound inApp />
  const savedCount = state.saved.filter((s) => s.key.startsWith('opp:')).length
  const type = params.get('type')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Opportunities" title={meta ? meta.label : 'All opportunities'} description={meta ? meta.blurb : 'Accelerators, incubators, programmes, competitions, fellowships, grants, funding opportunities, events and service providers — all external, all in one place.'} />
      <AreaTabs items={oppAreaTabs(savedCount)} active={cat} />
      <SampleNote>Illustrative sample listings — providers and details are fictional. Spryve explains each opportunity and links to the provider’s own website; it doesn’t run programmes or provide funding.</SampleNote>
      <CategoryListing key={`${cat}-${type ?? ''}`} cat={cat} initialType={type} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                      */
/* -------------------------------------------------------------------------- */

export function OpportunityDetail() {
  const { id } = useParams()
  const { state } = useStore()
  const o = id ? oppById(id) : undefined
  if (!o) return <NotFound inApp />
  const cat = OPP_CATEGORIES.find((c) => c.id === o.category)!
  const reasons = fitReasons(o, state.profile)
  const related = opportunities.filter((x) => x.category === o.category && x.id !== o.id).slice(0, 3)
  const label = externalLabel(o)

  const facts: [typeof MapPin, string, string][] = [
    [MapPin, 'Location', whereOf(o)],
    [Globe2, 'Region', o.region],
  ]
  if (o.date) facts.unshift([CalendarDays, 'Date', `${formatDate(o.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${o.time}`])
  if (o.deadline) facts.unshift([CalendarDays, 'Deadline', formatDate(o.deadline, { day: 'numeric', month: 'long', year: 'numeric' })])
  if (o.duration) facts.push([Clock, 'Length', o.duration])

  return (
    <div className="flex flex-col gap-8">
      <Link to={`/app/opportunities/${o.category}`} className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 self-start text-[0.875rem]">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {cat.label}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag>{o.type}</Tag>
            {o.category !== 'events' && o.category !== 'services' && <DeadlineTag days={o.deadline ? daysUntil(o.deadline) : null} />}
            <Tag>Sample listing</Tag>
          </div>
          <h1 className="t-page mt-3">{o.title}</h1>
          <p className="text-fg-2 mt-1">Offered by {o.provider}</p>
          <p className="text-fg mt-6 text-[1.0625rem] leading-relaxed">{o.summary}</p>
          <p className="text-fg-2 mt-4 leading-relaxed">{o.description}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="eyebrow mb-3">{o.category === 'services' ? 'Offers' : 'What’s offered'}</h2>
              <ul className="flex flex-col gap-2">
                {o.offers.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[0.9375rem]">
                    <Check className="text-lime mt-1 h-4 w-4 shrink-0" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="eyebrow mb-3">{o.category === 'services' ? 'How it works' : 'Eligibility'}</h2>
              <ul className="flex flex-col gap-2">
                {o.eligibility.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[0.9375rem]">
                    <span className="bg-electric mt-2 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {reasons.length > 0 && (
            <div className="well mt-8 px-4 py-3">
              <p className="text-fg text-[0.875rem] font-medium">Why this is on your list</p>
              <p className="text-fg-2 mt-1 text-[0.875rem]">{reasons.join(' · ')}. Based on your profile — not a prediction of acceptance.</p>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="card p-5">
            <dl className="flex flex-col gap-3">
              {facts.map(([Icon, k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <Icon className="text-fg-2 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div>
                    <dt className="text-fg-2 text-[0.75rem]">{k}</dt>
                    <dd className="text-fg text-[0.9375rem]">{v}</dd>
                  </div>
                </div>
              ))}
              {o.range && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-fg-2 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div>
                    <dt className="text-fg-2 text-[0.75rem]">Terms</dt>
                    <dd className="text-fg text-[0.9375rem]">{o.range}</dd>
                  </div>
                </div>
              )}
            </dl>
            <div className="border-line mt-5 flex flex-col gap-2 border-t pt-5">
              <ExternalAction label={label} provider={o.provider} site={o.providerSite} variant="primary" className="!min-h-[42px] w-full" />
              <SaveButton itemKey={`opp:${o.id}`} label={o.title} withText className="!min-h-[42px] w-full" />
            </div>
            <p className="text-fg-2 mt-4 text-[0.75rem]">
              “{label}” opens <span className="text-fg font-mono">{o.providerSite}</span>. Applications, registration and terms are handled by {o.provider}, not Spryve.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="font-display mb-4 text-[1.125rem] font-semibold">More {cat.label.toLowerCase()}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <OpportunityCard key={r.id} o={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
