import { Link } from 'react-router-dom'
import { BookOpen, CalendarDays, FileSpreadsheet, FileText, MapPin, Presentation, PlayCircle, ListChecks, GraduationCap } from 'lucide-react'
import {
  courseMinutes,
  daysUntil,
  formatDate,
  formatMinutes,
  founderName,
  initialsOf,
  type Company,
  type LibraryItem,
  type Opportunity,
  type Profile,
} from '@/lib/data'
import { useStore, type ViewMode } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Avatar, CompanyMark, DeadlineTag, Progress, SaveButton, StageTag, Tag } from './index'
import { ExternalAction } from './feedback'

/* -------------------------------------------------------------------------- */
/* Relevance — plain reasons, never a score                                    */
/* -------------------------------------------------------------------------- */

export function fitReasons(o: Opportunity, p: Profile) {
  const out: string[] = []
  if (p.stage && o.stages.includes(p.stage)) out.push(`Open to ${p.stage}-stage companies`)
  if (p.sector && o.sectors.some((s) => s.toLowerCase().includes(p.sector.toLowerCase()))) out.push(`Focused on ${p.sector}`)
  const city = p.location.split(',')[0]?.trim()
  if (city && o.location.includes(city)) out.push(`Based in ${city}`)
  return out
}

/** "Beirut · Hybrid", but never "Online · Online". */
export const whereOf = (o: Opportunity) => (o.location === o.format ? o.location : `${o.location} · ${o.format}`)

export const externalLabel = (o: Opportunity) =>
  o.category === 'services' ? 'Visit provider' : o.category === 'events' ? 'View event' : 'View opportunity'

/* -------------------------------------------------------------------------- */
/* Opportunity                                                                 */
/* -------------------------------------------------------------------------- */

function OppFacts({ o }: { o: Opportunity }) {
  const rows: [string, string][] = []
  if (o.category === 'accelerators' || o.category === 'incubators') {
    rows.push(['Stage', o.stages.join(', ')])
    rows.push(['Location', whereOf(o)])
    rows.push(['Eligibility', o.eligibility[0]])
    if (o.duration) rows.push(['Length', o.duration])
  } else if (o.category === 'funding') {
    rows.push(['Stage', o.stages.join(', ')])
    rows.push(['Region', o.region])
    rows.push(['Eligibility', o.eligibility[0]])
    rows.push(['Terms', o.range ?? 'Set by provider'])
  } else if (o.category === 'events') {
    rows.push(['When', `${formatDate(o.date!, { weekday: 'short', day: 'numeric', month: 'short' })} · ${o.time}`])
    rows.push(['Where', whereOf(o)])
    rows.push(['Entry', o.price ?? 'See host'])
  } else {
    rows.push(['Offers', o.offers.join(', ')])
    rows.push(['Where', whereOf(o)])
    rows.push(['Pricing', 'Published by the provider'])
  }
  return (
    <dl className="grid gap-1.5 text-[0.8125rem]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[84px_1fr] gap-2">
          <dt className="text-fg-2">{k}</dt>
          <dd className="text-fg min-w-0">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function EventDate({ iso, compact }: { iso: string; compact?: boolean }) {
  const d = new Date(iso + 'T12:00:00')
  return (
    <span className={cn('border-line bg-base flex shrink-0 flex-col items-center justify-center rounded-[12px] border', compact ? 'h-12 w-12' : 'h-14 w-14')}>
      <span className="text-electric font-mono text-[0.625rem] tracking-wider uppercase">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
      <span className="font-display text-fg text-[1.125rem] leading-none font-semibold">{d.getDate()}</span>
    </span>
  )
}

function oppStatus(o: Opportunity) {
  if (o.category === 'events') return <Tag>{o.type}</Tag>
  if (o.category === 'services') return <Tag>{o.type}</Tag>
  return <DeadlineTag days={o.deadline ? daysUntil(o.deadline) : null} />
}

export function OpportunityCard({ o, view = 'grid', showWhy = false }: { o: Opportunity; view?: ViewMode; showWhy?: boolean }) {
  const { state } = useStore()
  const reasons = showWhy ? fitReasons(o, state.profile) : []
  const href = `/app/opportunities/item/${o.id}`

  if (view === 'list') {
    return (
      <article className="card card-interactive group relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        {o.category === 'events' && o.date && <EventDate iso={o.date} compact />}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {o.category !== 'events' && <Tag>{o.type}</Tag>}
            {oppStatus(o)}
          </div>
          <h3 className="t-card">
            <Link to={href} className="after:absolute after:inset-0 hover:underline">
              {o.title}
            </Link>
          </h3>
          <p className="text-fg-2 mt-0.5 text-[0.8125rem]">
            {o.provider} · {o.category === 'events' ? `${formatDate(o.date!)} · ${o.location}` : `${o.location} · ${o.stages.join(', ')}`}
          </p>
        </div>
        <div className="relative z-10 flex shrink-0 items-center gap-2">
          <ExternalAction label={externalLabel(o)} provider={o.provider} site={o.providerSite} variant="link" />
          <SaveButton itemKey={`opp:${o.id}`} label={o.title} />
        </div>
      </article>
    )
  }

  return (
    <article className="card card-interactive group relative flex h-full flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {o.category === 'events' && o.date ? <EventDate iso={o.date} compact /> : <Tag>{o.type}</Tag>}
          {o.category !== 'events' && oppStatus(o)}
        </div>
        <SaveButton itemKey={`opp:${o.id}`} label={o.title} className="relative z-10" />
      </div>
      <h3 className="t-card">
        <Link to={href} className="after:absolute after:inset-0 hover:underline">
          {o.title}
        </Link>
      </h3>
      <p className="text-fg-2 mt-0.5 text-[0.8125rem]">by {o.provider}</p>
      <p className="text-fg-2 mt-3 text-[0.875rem] leading-relaxed">{o.summary}</p>
      <div className="border-line mt-4 border-t pt-4">
        <OppFacts o={o} />
      </div>
      {reasons.length > 0 && (
        <p className="text-fg-2 mt-3 text-[0.75rem]">
          <span className="text-electric">Why you’re seeing this:</span> {reasons.join(' · ')}
        </p>
      )}
      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 pt-5">
        <Link to={href} className="text-fg-2 hover:text-fg text-[0.8125rem]">
          Details
        </Link>
        <ExternalAction label={externalLabel(o)} provider={o.provider} site={o.providerSite} />
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Library                                                                     */
/* -------------------------------------------------------------------------- */

const formatIcon: Record<string, typeof FileText> = {
  Guide: BookOpen,
  Checklist: ListChecks,
  Video: PlayCircle,
  Doc: FileText,
  Slides: Presentation,
  Spreadsheet: FileSpreadsheet,
  Course: GraduationCap,
}

export function useCourseProgress(item: LibraryItem) {
  const { state } = useStore()
  const total = item.lessons?.length ?? 0
  const done = (state.lessonsDone[item.id] ?? []).filter((id) => item.lessons?.some((l) => l.id === id)).length
  return { total, done, pct: total ? (done / total) * 100 : 0 }
}

function LibMeta({ item }: { item: LibraryItem }) {
  const progress = useCourseProgress(item)
  if (item.category === 'learn') {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-fg-2 text-[0.8125rem]">
          {item.lessons?.length} lessons · {formatMinutes(courseMinutes(item))} · {item.level}
        </p>
        <div className="flex items-center gap-3">
          <Progress value={progress.pct} label={`${item.title} progress`} tone="blue" />
          <span className="text-fg-2 shrink-0 font-mono text-[0.75rem]">
            {progress.done === progress.total ? 'Complete' : progress.done === 0 ? 'Not started' : `${progress.done}/${progress.total}`}
          </span>
        </div>
      </div>
    )
  }
  return (
    <p className="text-fg-2 text-[0.8125rem]">
      {item.format} · {item.category === 'templates' ? item.pages : `${item.minutes} min`}
    </p>
  )
}

export function LibraryCard({ item, view = 'grid' }: { item: LibraryItem; view?: ViewMode }) {
  const Icon = formatIcon[item.format] ?? FileText
  const href = `/app/library/item/${item.id}`
  if (view === 'list') {
    return (
      <article className="card card-interactive relative flex items-center gap-4 p-4">
        <span className="border-line bg-base text-fg-2 grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="t-card truncate">
            <Link to={href} className="after:absolute after:inset-0 hover:underline">
              {item.title}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-fg-2 text-[0.8125rem]">{item.topic}</span>
            <div className="min-w-[180px] flex-1">
              <LibMeta item={item} />
            </div>
          </div>
        </div>
        <SaveButton itemKey={`lib:${item.id}`} label={item.title} className="relative z-10" />
      </article>
    )
  }
  return (
    <article className="card card-interactive relative flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between">
        <span className="border-line bg-base text-fg-2 grid h-11 w-11 place-items-center rounded-[12px] border">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <SaveButton itemKey={`lib:${item.id}`} label={item.title} className="relative z-10" />
      </div>
      <p className="eyebrow mb-1.5 !text-[0.625rem]">{item.topic}</p>
      <h3 className="t-card">
        <Link to={href} className="after:absolute after:inset-0 hover:underline">
          {item.title}
        </Link>
      </h3>
      <p className="text-fg-2 mt-2 text-[0.875rem] leading-relaxed">{item.summary}</p>
      <div className="mt-auto pt-5">
        <LibMeta item={item} />
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Founders Hub                                                                */
/* -------------------------------------------------------------------------- */

export function CompanyCard({ c, view = 'grid' }: { c: Company; view?: ViewMode }) {
  const href = `/app/hub/company/${c.slug}`
  const person = founderName(c)
  if (view === 'list') {
    return (
      <article className="card card-interactive relative flex items-center gap-4 p-4">
        <CompanyMark mark={c.mark} accent={c.accent} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="t-card">
              <Link to={href} className="after:absolute after:inset-0 hover:underline">
                {c.name}
              </Link>
            </h3>
            <StageTag stage={c.stage} />
          </div>
          <p className="text-fg-2 truncate text-[0.8125rem]">{c.short}</p>
        </div>
        <SaveButton itemKey={`company:${c.slug}`} label={c.name} className="relative z-10" />
      </article>
    )
  }
  return (
    <article className="card card-interactive relative flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <CompanyMark mark={c.mark} accent={c.accent} />
        <SaveButton itemKey={`company:${c.slug}`} label={c.name} className="relative z-10" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h3 className="t-card text-[1.0625rem]">
          <Link to={href} className="after:absolute after:inset-0 hover:underline">
            {c.name}
          </Link>
        </h3>
        <StageTag stage={c.stage} />
      </div>
      <p className="text-fg-2 mt-2 text-[0.875rem] leading-relaxed">{c.short}</p>
      <p className="text-fg-2 mt-3 flex items-center gap-1.5 text-[0.8125rem]">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        {c.industry} · {c.location}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {c.lookingFor.slice(0, 3).map((l) => (
          <span key={l} className="border-electric/35 text-fg rounded-full border px-2.5 py-0.5 text-[0.75rem]">
            {l}
          </span>
        ))}
      </div>
      <div className="border-line mt-auto flex items-center gap-2.5 border-t pt-4">
        <Avatar initials={initialsOf(person)} size="xs" accent={c.accent} />
        <span className="text-fg-2 text-[0.8125rem]">
          {person} · {c.founders[0].position}
        </span>
      </div>
    </article>
  )
}

export function EventRow({ o }: { o: Opportunity }) {
  return (
    <Link to={`/app/opportunities/item/${o.id}`} className="hover:bg-lift -mx-2 flex items-center gap-3 rounded-[12px] px-2 py-2 transition-colors">
      <EventDate iso={o.date!} compact />
      <span className="min-w-0 flex-1">
        <span className="text-fg block truncate text-[0.875rem] font-medium">{o.title}</span>
        <span className="text-fg-2 flex items-center gap-1 text-[0.75rem]">
          <CalendarDays className="h-3 w-3" aria-hidden />
          {o.time} · {o.location}
        </span>
      </span>
    </Link>
  )
}
