import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Bookmark, Building2, Check, CircleDashed, MessageCircle, PlayCircle } from 'lucide-react'
import { Avatar, CompanyMark, DeadlineTag, EmptyState, Progress, StageTag, Tag } from '@/components/ui'
import { ExternalAction } from '@/components/ui/feedback'
import { EventRow, externalLabel, fitReasons, useCourseProgress } from '@/components/ui/cards'
import { companies, companyBySlug, daysUntil, founderName, initialsOf, library, opportunities, SAMPLE_TODAY } from '@/lib/data'
import { profileChecks, useStore } from '@/lib/store'
import { resolveSaved } from '@/lib/saved'
import { cn, timeAgo } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

function Panel({ title, action, children, className, delay = 0 }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay }} className={cn('card p-5', className)} aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-[1rem] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

const MoreLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={to} className="text-fg-2 hover:text-fg inline-flex items-center gap-1 text-[0.8125rem]">
    {children}
    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
  </Link>
)

/* -------------------------------------------------------------------------- */

function useNextSteps() {
  const { state, unread } = useStore()
  const missing = profileChecks(state.profile).filter((c) => !c.done)
  const inProgress = library.find((l) => l.category === 'learn' && (state.lessonsDone[l.id]?.length ?? 0) > 0 && (state.lessonsDone[l.id]?.length ?? 0) < (l.lessons?.length ?? 0))
  const firstThread = state.threads.find((t) => t.unread)
  const isNew = state.scenario === 'new'

  const steps: { id: string; title: string; detail: string; to: string; cta: string }[] = []
  if (!state.company) steps.push({ id: 'company', title: 'Create your company profile', detail: 'So other founders — and programmes you apply to — can find you in Founders Hub.', to: '/app/hub/my-company/new', cta: 'Create company' })
  if (missing.length) steps.push({ id: 'profile', title: 'Complete your personal profile', detail: `Still missing: ${missing.map((m) => m.label.toLowerCase()).join(', ')}.`, to: '/app/account', cta: 'Edit profile' })
  steps.push(
    isNew
      ? { id: 'browse', title: 'Find programmes open to your stage', detail: 'Start with accelerators and incubators, then save the ones worth a closer look.', to: '/app/opportunities/accelerators', cta: 'Browse accelerators' }
      : { id: 'deadlines', title: 'Review opportunities closing this month', detail: 'Launchway Health Accelerator closes in 11 days; Open Build Challenge in 16.', to: '/app/opportunities/accelerators', cta: 'Review' },
  )
  if (inProgress) {
    const done = state.lessonsDone[inProgress.id] ?? []
    const nextLesson = inProgress.lessons!.find((l) => !done.includes(l.id))!
    steps.push({ id: 'course', title: `Continue ${inProgress.title}`, detail: `Next lesson: ${nextLesson.title} · ${nextLesson.minutes} min`, to: `/app/library/item/${inProgress.id}`, cta: 'Continue' })
  } else {
    steps.push({ id: 'course', title: 'Start a short course', detail: 'Validate before you build — five lessons, about an hour.', to: '/app/library/item/validate-course', cta: 'Start' })
  }
  if (firstThread && unread) steps.push({ id: 'reply', title: `Reply to ${firstThread.person}`, detail: `${unread} unread conversation${unread > 1 ? 's' : ''} in Founders Hub.`, to: `/app/hub/messages?thread=${firstThread.id}`, cta: 'Open messages' })
  return steps
}

function NextSteps() {
  const { state, toggleStep } = useStore()
  const steps = useNextSteps()
  const done = steps.filter((s) => state.stepsDone.includes(s.id)).length
  const upNext = steps.find((s) => !state.stepsDone.includes(s.id))
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="card border-lime/30 relative overflow-hidden p-5 sm:p-6" aria-label="Your next steps">
      <span className="bg-lime absolute inset-y-0 left-0 w-[3px]" aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow !text-lime">Your next steps</p>
        <span className="text-fg-2 font-mono text-[0.75rem]">
          {done} of {steps.length} done
        </span>
      </div>
      {upNext ? (
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-[1.375rem] leading-tight font-semibold">{upNext.title}</h2>
            <p className="text-fg-2 mt-1.5 max-w-[52ch] text-[0.9375rem]">{upNext.detail}</p>
          </div>
          <Link to={upNext.to} className="btn btn-primary shrink-0 self-start sm:self-auto">
            {upNext.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-3">
          <h2 className="font-display text-[1.375rem] font-semibold">All caught up.</h2>
          <p className="text-fg-2 mt-1.5">New steps appear here as deadlines, messages and courses move.</p>
        </div>
      )}
      <Progress value={(done / steps.length) * 100} label="Next steps completed" className="mt-5" />
      <ul className="border-line mt-4 divide-y divide-[var(--line)] border-t">
        {steps.map((s) => {
          const isDone = state.stepsDone.includes(s.id)
          const isNext = s === upNext
          return (
            <li key={s.id} className="flex items-center gap-3 py-2.5">
              <button
                type="button"
                onClick={() => toggleStep(s.id)}
                aria-pressed={isDone}
                aria-label={isDone ? `Mark “${s.title}” as not done` : `Mark “${s.title}” as done`}
                className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors', isDone ? 'bg-lime border-lime text-[var(--on-lime)]' : 'border-line-strong hover:border-lime')}
              >
                {isDone && <Check className="h-3 w-3" aria-hidden />}
              </button>
              <Link to={s.to} className="group min-w-0 flex-1">
                <span className={cn('block truncate text-[0.875rem] group-hover:underline', isDone ? 'text-fg-2 line-through' : 'text-fg', isNext && 'font-medium')}>{s.title}</span>
                {!isDone && !isNext && <span className="text-fg-2 block truncate text-[0.75rem]">{s.detail}</span>}
              </Link>
              {isNext && <Tag tone="lime">Up next</Tag>}
            </li>
          )
        })}
      </ul>
    </motion.section>
  )
}

function CompanyStatus() {
  const { state } = useStore()
  const c = state.company
  if (!c) {
    return (
      <Panel title="Company" delay={0.05}>
        <div className="border-line-strong flex flex-col items-start gap-3 rounded-[14px] border border-dashed p-4">
          <Building2 className="text-fg-2 h-5 w-5" aria-hidden />
          <p className="text-fg text-[0.9375rem] font-medium">No company profile yet</p>
          <p className="text-fg-2 -mt-1 text-[0.8125rem]">Present your company in Founders Hub. It takes about five minutes and you can save a draft.</p>
          <Link to="/app/hub/my-company/new" className="btn btn-primary btn-sm">
            Create your company
          </Link>
        </div>
      </Panel>
    )
  }
  const sections = [c.short, c.about, c.founders.length, c.products.length, c.lookingFor.length, c.website]
  const pct = (sections.filter(Boolean).length / sections.length) * 100
  return (
    <Panel title="Company" delay={0.05} action={<MoreLink to="/app/hub/my-company">Manage</MoreLink>}>
      <div className="flex items-center gap-3">
        <CompanyMark mark={c.mark} accent="lime" />
        <div className="min-w-0">
          <p className="text-fg truncate font-medium">{c.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <StageTag stage={c.stage} />
            <span className="text-fg-2 text-[0.75rem]">{c.visibility}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={pct} label="Company profile completeness" />
        <span className="text-fg-2 shrink-0 font-mono text-[0.75rem]">{Math.round(pct)}%</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Link to="/app/hub/my-company/edit" className="btn btn-secondary btn-sm">
          Edit company
        </Link>
        <Link to={`/app/hub/company/${c.slug}?preview=1`} className="btn btn-quiet btn-sm">
          Public profile
        </Link>
      </div>
    </Panel>
  )
}

function MessagesMini() {
  const { state, unread } = useStore()
  const threads = state.threads.slice(0, 3)
  return (
    <Panel title="Messages" delay={0.1} action={<MoreLink to="/app/hub/messages">{unread ? `${unread} unread` : 'Open'}</MoreLink>}>
      {threads.length === 0 ? (
        <p className="text-fg-2 text-[0.875rem]">
          No conversations yet. <Link to="/app/hub" className="text-fg underline underline-offset-4">Find founders to talk to</Link>.
        </p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {threads.map((t) => {
            const c = companyBySlug(t.companySlug)
            const last = t.messages[t.messages.length - 1]
            return (
              <li key={t.id}>
                <Link to={`/app/hub/messages?thread=${t.id}`} className="hover:bg-lift flex items-center gap-3 rounded-[12px] px-2 py-2">
                  <Avatar initials={initialsOf(t.person)} size="sm" accent={c?.accent ?? 'blue'} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-[0.875rem]', t.unread ? 'text-fg font-medium' : 'text-fg')}>{t.person}</span>
                    <span className="text-fg-2 block truncate text-[0.75rem]">{last ? last.body : 'New conversation'}</span>
                  </span>
                  {t.unread && <span className="bg-electric h-2 w-2 shrink-0 rounded-full" aria-label="Unread" />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

function RelevantOpportunities() {
  const { state } = useStore()
  const pool = opportunities.filter((o) => o.category !== 'events' && o.category !== 'services')
  const ranked = pool
    .map((o) => ({ o, reasons: fitReasons(o, state.profile) }))
    .filter((x) => x.o.deadline === undefined || daysUntil(x.o.deadline) >= 0)
    .sort((a, b) => b.reasons.length - a.reasons.length || (a.o.deadline ? daysUntil(a.o.deadline) : 999) - (b.o.deadline ? daysUntil(b.o.deadline) : 999))
    .slice(0, 4)
  return (
    <Panel title="Relevant opportunities" delay={0.1} action={<MoreLink to="/app/opportunities">Browse all</MoreLink>}>
      <ul className="divide-y divide-[var(--line)]">
        {ranked.map(({ o, reasons }) => (
          <li key={o.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Tag>{o.type}</Tag>
                <DeadlineTag days={o.deadline ? daysUntil(o.deadline) : null} />
              </div>
              <Link to={`/app/opportunities/item/${o.id}`} className="text-fg text-[0.9375rem] font-medium hover:underline">
                {o.title}
              </Link>
              <p className="text-fg-2 text-[0.8125rem]">
                {o.provider}
                {reasons.length > 0 && <span className="text-fg-2"> · {reasons[0]}</span>}
              </p>
            </div>
            <ExternalAction label={externalLabel(o)} provider={o.provider} site={o.providerSite} variant="link" className="shrink-0" />
          </li>
        ))}
      </ul>
      <p className="text-fg-2 border-line mt-4 border-t pt-3 text-[0.75rem]">Listed from external providers. Shown because they fit your stage or sector — not a prediction of success.</p>
    </Panel>
  )
}

function Upcoming() {
  const items = [
    ...opportunities.filter((o) => o.category === 'events').map((o) => ({ date: o.date!, o, kind: 'event' as const })),
    ...opportunities.filter((o) => o.deadline && o.category !== 'events').map((o) => ({ date: o.deadline!, o, kind: 'deadline' as const })),
  ]
    .filter((x) => daysUntil(x.date) >= 0 && daysUntil(x.date) <= 30)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
  return (
    <Panel title="Upcoming" delay={0.15} action={<MoreLink to="/app/opportunities/events">Events</MoreLink>}>
      <ul className="flex flex-col">
        {items.map((x) =>
          x.kind === 'event' ? (
            <li key={x.o.id}>
              <EventRow o={x.o} />
            </li>
          ) : (
            <li key={x.o.id}>
              <Link to={`/app/opportunities/item/${x.o.id}`} className="hover:bg-lift -mx-2 flex items-center gap-3 rounded-[12px] px-2 py-2">
                <span className="border-lime/40 bg-lime/8 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[12px] border">
                  <span className="text-lime font-mono text-[0.625rem] uppercase">{new Date(x.date + 'T12:00').toLocaleDateString('en-GB', { month: 'short' })}</span>
                  <span className="font-display text-[1.125rem] leading-none font-semibold">{new Date(x.date + 'T12:00').getDate()}</span>
                </span>
                <span className="min-w-0">
                  <span className="text-fg block truncate text-[0.875rem] font-medium">{x.o.title}</span>
                  <span className="text-fg-2 block text-[0.75rem]">Deadline · {x.o.type}</span>
                </span>
              </Link>
            </li>
          ),
        )}
      </ul>
    </Panel>
  )
}

function PeopleToMeet() {
  const { state } = useStore()
  const sector = state.profile.sector || state.company?.industry
  const picks = [...companies].sort((a, b) => Number(b.industry === sector) - Number(a.industry === sector) || Number(b.location.includes('Beirut')) - Number(a.location.includes('Beirut'))).slice(0, 3)
  return (
    <Panel title="People to meet" delay={0.15} action={<MoreLink to="/app/hub">Founders Hub</MoreLink>}>
      <ul className="grid gap-3 sm:grid-cols-3">
        {picks.map((c) => {
          const status = state.connections[c.slug]
          return (
            <li key={c.slug} className="well flex flex-col p-4">
              <div className="flex items-center gap-2.5">
                <Avatar initials={initialsOf(founderName(c))} size="sm" accent={c.accent} />
                <span className="min-w-0">
                  <span className="text-fg block truncate text-[0.875rem] font-medium">{founderName(c)}</span>
                  <span className="text-fg-2 block truncate text-[0.75rem]">{c.name}</span>
                </span>
              </div>
              <p className="text-fg-2 mt-3 line-clamp-2 text-[0.8125rem]">{c.short}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-fg-2 text-[0.75rem]">{status === 'connected' ? 'Connected' : status === 'pending' ? 'Request sent' : c.lookingFor[0]}</span>
                <Link to={`/app/hub/company/${c.slug}`} className="text-electric text-[0.8125rem] font-medium hover:underline">
                  View
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

function ContinueLearning() {
  const { state } = useStore()
  const course = library.find((l) => l.category === 'learn' && (state.lessonsDone[l.id]?.length ?? 0) > 0 && (state.lessonsDone[l.id]?.length ?? 0) < (l.lessons?.length ?? 0)) ?? library.find((l) => l.id === 'validate-course')!
  const p = useCourseProgress(course)
  const next = course.lessons!.find((l) => !(state.lessonsDone[course.id] ?? []).includes(l.id))
  return (
    <Panel title="Continue learning" delay={0.2} action={<MoreLink to="/app/library/learn">Learn</MoreLink>}>
      <p className="eyebrow !text-[0.625rem]">{course.topic}</p>
      <p className="text-fg mt-1 font-medium">{course.title}</p>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={p.pct} label={`${course.title} progress`} tone="blue" />
        <span className="text-fg-2 shrink-0 font-mono text-[0.75rem]">
          {p.done}/{p.total}
        </span>
      </div>
      {next && (
        <Link to={`/app/library/item/${course.id}`} className="well hover:border-line-strong mt-4 flex items-center gap-3 px-3 py-2.5 transition-colors">
          <PlayCircle className="text-electric h-5 w-5 shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="text-fg block truncate text-[0.875rem]">{next.title}</span>
            <span className="text-fg-2 block text-[0.75rem]">{p.done === 0 ? 'Start' : 'Next lesson'} · {next.minutes} min</span>
          </span>
        </Link>
      )}
    </Panel>
  )
}

function SavedCompact() {
  const { state } = useStore()
  const items = state.saved
    .map((s) => ({ ...s, r: resolveSaved(s.key) }))
    .filter((x) => x.r)
    .slice(0, 4)
  return (
    <Panel title="Saved" delay={0.2} action={state.saved.length > 0 ? <MoreLink to="/app/saved">View all {state.saved.length}</MoreLink> : undefined}>
      {items.length === 0 ? (
        <EmptyState icon={<Bookmark />} title="Nothing saved yet" body="Use the bookmark on any opportunity, resource or company. Everything you save gathers here." action={<Link to="/app/opportunities" className="btn btn-secondary btn-sm">Browse opportunities</Link>} className="py-8" />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map(({ r, savedAt }) => (
            <li key={r!.key}>
              <Link to={r!.to} className="well hover:border-line-strong flex h-full flex-col gap-1 p-4 transition-colors">
                <span className="eyebrow !text-[0.625rem]">{r!.group}</span>
                <span className="text-fg line-clamp-2 text-[0.875rem] font-medium">{r!.title}</span>
                <span className="text-fg-2 mt-auto pt-2 text-[0.75rem]">Saved {timeAgo(savedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const { state, unread } = useStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const first = state.profile.name.split(' ')[0]
  const closing = opportunities.filter((o) => o.deadline && daysUntil(o.deadline) >= 0 && daysUntil(o.deadline) <= 14).length

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-fg-2 text-[0.8125rem]">{SAMPLE_TODAY.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · sample date</p>
        <h1 className="t-page">
          {greeting}, {first}
        </h1>
        <p className="text-fg-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.875rem]">
          {unread > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="text-electric h-3.5 w-3.5" aria-hidden />
              {unread} unread message{unread > 1 ? 's' : ''}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CircleDashed className="text-lime h-3.5 w-3.5" aria-hidden />
            {closing} deadline{closing === 1 ? '' : 's'} in the next two weeks
          </span>
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <NextSteps />
        <div className="flex flex-col gap-6">
          <CompanyStatus />
          <MessagesMini />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RelevantOpportunities />
        <Upcoming />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <PeopleToMeet />
        <ContinueLearning />
      </div>

      <SavedCompact />
    </div>
  )
}
