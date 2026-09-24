import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Download, FileText, PlayCircle } from 'lucide-react'
import { AreaTabs, ListingLayout, useListing, type Facet, type SortOption } from '@/components/app/Listing'
import { PageHeader, Progress, SampleNote, SaveButton, Tag } from '@/components/ui'
import { useToast } from '@/components/ui/feedback'
import { LibraryCard, useCourseProgress } from '@/components/ui/cards'
import NotFound from '@/routes/site/NotFound'
import { courseMinutes, formatMinutes, libById, library, LIB_CATEGORIES, STAGES, type LibCategory, type LibraryItem } from '@/lib/data'
import { useStore, useViewMode } from '@/lib/store'
import { cn } from '@/lib/utils'

export function libAreaTabs(savedCount: number) {
  return [
    { id: 'all', label: 'All', to: '/app/library' },
    ...LIB_CATEGORIES.map((c) => ({ id: c.id, label: c.label, to: `/app/library/${c.id}` })),
    { id: 'saved', label: 'Saved', to: '/app/library/saved', count: savedCount },
  ]
}

function CategoryListing({ cat }: { cat: LibCategory | 'all' }) {
  const { state } = useStore()
  const [view, setView] = useViewMode(`library-${cat}`, 'grid')
  const items = useMemo(() => (cat === 'all' ? library : library.filter((l) => l.category === cat)), [cat])

  const progressOf = (l: LibraryItem) => {
    const done = (state.lessonsDone[l.id] ?? []).length
    const total = l.lessons?.length ?? 0
    return done === 0 ? 'Not started' : done >= total ? 'Completed' : 'In progress'
  }
  const stageFit = (l: LibraryItem) => (state.profile.stage && l.stages.includes(state.profile.stage) ? 1 : 0)

  const facets: Facet<LibraryItem>[] = useMemo(() => {
    const topic: Facet<LibraryItem> = { id: 'topic', label: 'Topic', get: (l) => [l.topic] }
    const stage: Facet<LibraryItem> = { id: 'stage', label: 'Stage', get: (l) => l.stages, order: STAGES }
    const format: Facet<LibraryItem> = { id: 'format', label: 'Format', get: (l) => [l.format] }
    if (cat === 'resources') return [topic, format, stage, { id: 'length', label: 'Length', get: (l) => [(l.minutes ?? 0) < 10 ? 'Under 10 min' : (l.minutes ?? 0) <= 20 ? '10–20 min' : 'Over 20 min'], order: ['Under 10 min', '10–20 min', 'Over 20 min'] }]
    if (cat === 'templates') return [topic, format, stage]
    if (cat === 'learn')
      return [
        topic,
        { id: 'progress', label: 'Progress', get: (l) => [progressOf(l)], order: ['In progress', 'Not started', 'Completed'] },
        { id: 'level', label: 'Level', get: (l) => [l.level ?? ''] },
        { id: 'duration', label: 'Duration', get: (l) => [courseMinutes(l) < 60 ? 'Under 1 hour' : '1 hour or more'] },
      ]
    return [{ id: 'section', label: 'Section', get: (l) => [LIB_CATEGORIES.find((c) => c.id === l.category)!.label], order: LIB_CATEGORIES.map((c) => c.label) }, topic, stage]
  }, [cat, state.lessonsDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const sorts: SortOption<LibraryItem>[] = useMemo(() => {
    const az = { id: 'az', label: 'A–Z', compare: (a: LibraryItem, b: LibraryItem) => a.title.localeCompare(b.title) }
    const rec = { id: 'rec', label: 'Recommended for my stage', compare: (a: LibraryItem, b: LibraryItem) => stageFit(b) - stageFit(a) }
    if (cat === 'resources') return [rec, { id: 'short', label: 'Shortest first', compare: (a, b) => (a.minutes ?? 0) - (b.minutes ?? 0) }, az]
    if (cat === 'learn') {
      const rank = (l: LibraryItem) => ({ 'In progress': 0, 'Not started': 1, Completed: 2 })[progressOf(l)]
      return [{ id: 'progress', label: 'In progress first', compare: (a, b) => rank(a) - rank(b) }, { id: 'short', label: 'Shortest first', compare: (a, b) => courseMinutes(a) - courseMinutes(b) }, az]
    }
    return [rec, az]
  }, [cat, state.profile.stage, state.lessonsDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const l = useListing(items, facets, sorts, (x) => `${x.title} ${x.summary} ${x.topic} ${x.format}`)
  const noun: [string, string] = cat === 'learn' ? ['course', 'courses'] : cat === 'templates' ? ['template', 'templates'] : cat === 'resources' ? ['resource', 'resources'] : ['item', 'items']

  return <ListingLayout l={l} sorts={sorts} view={view} setView={setView} noun={noun} searchPlaceholder={`Search ${noun[1]}`} renderItem={(item, v) => <LibraryCard item={item} view={v} />} />
}

export function LibraryList() {
  const { category } = useParams()
  const { state } = useStore()
  const cat = (category ?? 'all') as LibCategory | 'all'
  const meta = LIB_CATEGORIES.find((c) => c.id === cat)
  if (category && !meta) return <NotFound inApp />
  const savedCount = state.saved.filter((s) => s.key.startsWith('lib:')).length
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Library" title={meta ? meta.label : 'Library'} description={meta ? meta.blurb : 'Resources, templates and short courses to help with the step in front of you.'} />
      <AreaTabs items={libAreaTabs(savedCount)} active={cat} />
      <SampleNote>Sample library content for layout review. Titles and lengths are illustrative; full materials are not included in this preview.</SampleNote>
      <CategoryListing key={cat} cat={cat} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                      */
/* -------------------------------------------------------------------------- */

function CourseDetail({ item }: { item: LibraryItem }) {
  const { state, toggleLesson } = useStore()
  const toast = useToast()
  const p = useCourseProgress(item)
  const done = state.lessonsDone[item.id] ?? []
  const firstOpen = item.lessons!.find((l) => !done.includes(l.id))
  const [active, setActive] = useState(firstOpen?.id ?? item.lessons![0].id)
  const lesson = item.lessons!.find((l) => l.id === active)!
  const isDone = done.includes(lesson.id)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="card overflow-hidden">
        <div className="bg-base dot-grid border-line relative grid aspect-video place-items-center border-b">
          <div className="text-center">
            <PlayCircle className="text-electric mx-auto h-12 w-12" aria-hidden />
            <p className="text-fg mt-3 font-medium">{lesson.title}</p>
            <p className="text-fg-2 text-[0.8125rem]">Lesson player placeholder · {lesson.minutes} min</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-fg-2 text-[0.875rem]">Lesson {item.lessons!.indexOf(lesson) + 1} of {item.lessons!.length}</p>
          <button
            type="button"
            onClick={() => {
              toggleLesson(item.id, lesson.id)
              if (!isDone) {
                toast('Lesson marked complete.')
                const next = item.lessons!.find((l) => l.id !== lesson.id && !done.includes(l.id))
                if (next) setActive(next.id)
              }
            }}
            className={cn('btn btn-sm', isDone ? 'btn-secondary' : 'btn-primary')}
          >
            {isDone ? 'Mark as not complete' : 'Mark lesson complete'}
          </button>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <Progress value={p.pct} label="Course progress" tone="blue" />
          <span className="text-fg-2 shrink-0 font-mono text-[0.75rem]">
            {p.done}/{p.total}
          </span>
        </div>
        <ol className="mt-4 flex flex-col gap-1">
          {item.lessons!.map((l, i) => {
            const d = done.includes(l.id)
            return (
              <li key={l.id}>
                <button type="button" onClick={() => setActive(l.id)} aria-current={l.id === active ? 'step' : undefined} className={cn('flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left', l.id === active ? 'bg-electric/14' : 'hover:bg-lift')}>
                  <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.625rem]', d ? 'bg-lime border-lime text-[var(--on-lime)]' : 'border-line-strong text-fg-2')}>{d ? <Check className="h-3 w-3" aria-hidden /> : i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="text-fg block truncate text-[0.875rem]">{l.title}</span>
                    <span className="text-fg-2 block text-[0.75rem]">{l.minutes} min</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export function LibraryDetail() {
  const { id } = useParams()
  const toast = useToast()
  const item = id ? libById(id) : undefined
  if (!item) return <NotFound inApp />
  const cat = LIB_CATEGORIES.find((c) => c.id === item.category)!
  const related = library.filter((l) => l.topic === item.topic && l.id !== item.id).slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <Link to={`/app/library/${item.category}`} className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 self-start text-[0.875rem]">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {cat.label}
      </Link>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Tag>{item.format}</Tag>
            <Tag>{item.topic}</Tag>
            <Tag>Sample content</Tag>
          </div>
          <h1 className="t-page mt-3">{item.title}</h1>
          <p className="text-fg-2 mt-2 max-w-[60ch]">{item.summary}</p>
          <p className="text-fg-2 mt-2 text-[0.8125rem]">
            {item.category === 'learn' ? `${item.lessons!.length} lessons · ${formatMinutes(courseMinutes(item))} · ${item.level}` : item.category === 'templates' ? item.pages : `${item.minutes} min`} · For {item.stages.join(', ')} stage
          </p>
        </div>
        <div className="flex gap-2">
          {item.category === 'templates' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => toast('Downloads aren’t available in the preview.')}>
              <Download className="h-3.5 w-3.5" aria-hidden />
              Use template
            </button>
          )}
          <SaveButton itemKey={`lib:${item.id}`} label={item.title} withText />
        </div>
      </header>

      {item.note && <SampleNote>{item.note}</SampleNote>}

      {item.category === 'learn' ? (
        <CourseDetail item={item} />
      ) : item.category === 'templates' ? (
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div className="card bg-base dot-grid grid min-h-[280px] place-items-center p-8">
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn('border-line-strong bg-raised flex h-40 w-28 flex-col gap-2 rounded-[8px] border p-3', i === 1 && '-translate-y-3')}>
                  <FileText className="text-fg-2 h-4 w-4" aria-hidden />
                  <span className="bg-fg/15 h-1.5 w-3/4 rounded-full" />
                  <span className="bg-fg/10 h-1.5 w-full rounded-full" />
                  <span className="bg-fg/10 h-1.5 w-5/6 rounded-full" />
                  <span className={cn('mt-auto h-6 rounded-[4px]', i === 1 ? 'bg-electric/30' : 'bg-fg/8')} />
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="eyebrow mb-3">What’s inside</h2>
            <ul className="flex flex-col gap-2 text-[0.9375rem]">
              {['Structure with guidance notes', 'Worked example you can overwrite', 'Checklist before you share it'].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="text-lime mt-1 h-4 w-4 shrink-0" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
            <p className="text-fg-2 mt-6 text-[0.8125rem]">Template files will be attached in the content phase.</p>
          </div>
        </div>
      ) : (
        <article className="card max-w-3xl p-6 sm:p-8">
          <p className="eyebrow mb-4">In this {item.format.toLowerCase()}</p>
          <ol className="flex flex-col gap-3">
            {['Why this matters at your stage', 'The approach, step by step', 'Common mistakes', 'What to do next'].map((x, i) => (
              <li key={x} className="flex gap-3">
                <span className="text-electric font-mono text-[0.8125rem]">{String(i + 1).padStart(2, '0')}</span>
                <span>{x}</span>
              </li>
            ))}
          </ol>
          <p className="text-fg-2 border-line mt-6 border-t pt-6">The full {item.format.toLowerCase()} would appear here. Body copy is not included in this layout preview.</p>
        </article>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="font-display mb-4 text-[1.125rem] font-semibold">More on {item.topic.toLowerCase()}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <LibraryCard key={r.id} item={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
