import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, BookOpen, FileText, GraduationCap } from 'lucide-react'
import { DashboardMock, type MockModule } from './DashboardMock'
import { Band, SceneSteps, SectionIntro } from './parts'
import { useAutoCycle } from '@/lib/hooks'
import { daysUntil, formatDate, opportunities, type OppCategory } from '@/lib/data'

/* ========================================================================== */
/* 02 — One useful dashboard                                                   */
/* ========================================================================== */

const VIEWS: { id: string; label: string; focus: MockModule[]; title: string; body: string }[] = [
  {
    id: 'next',
    label: 'Next steps',
    focus: ['next', 'company'],
    title: 'Start with what to do next',
    body: 'The top of your dashboard is a short, ordered list of next steps — not a wall of equal cards. Tick one off and the next moves up.',
  },
  {
    id: 'opps',
    label: 'Opportunities',
    focus: ['opps', 'upcoming'],
    title: 'Only what fits your stage',
    body: 'Programmes, funding opportunities and events that match your stage and sector, with deadlines in plain view and a note on why each one is there.',
  },
  {
    id: 'people',
    label: 'People',
    focus: ['people', 'messages'],
    title: 'The people around your work',
    body: 'Founders worth meeting and the conversations you have going, one click from Founders Hub.',
  },
  {
    id: 'learn',
    label: 'Learning & saved',
    focus: ['learning', 'saved'],
    title: 'Pick up where you left off',
    body: 'The course you are halfway through and the things you saved from anywhere in Spryve, without a separate place to go looking.',
  },
]

const VIEW_MS = 5200

export function DashboardShowcase() {
  const scene = useAutoCycle(VIEWS.length, VIEW_MS, { loop: true })
  const v = VIEWS[scene.index]
  return (
    <Band id="dashboard">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%] opacity-30 blur-[100px]" style={{ background: 'radial-gradient(40% 50% at 70% 30%, color-mix(in oklab, var(--brand-tertiary) 50%, transparent), transparent)' }} aria-hidden />
      <div className="container-site relative">
        <SectionIntro index="02" eyebrow="The dashboard" title={<>One dashboard. <span className="text-lime">Clear next steps.</span></>} body="Relevant information and what to do about it — arranged so you understand it in a few seconds." />

        <div ref={scene.ref} className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12">
          <div className="lg:sticky lg:top-28">
            <SceneSteps steps={VIEWS} index={scene.index} onSelect={scene.select} playing={scene.playing} duration={VIEW_MS} className="lg:flex-col lg:items-start" />
            <div className="relative mt-6 min-h-[132px]">
              <AnimatePresence mode="wait">
                <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
                  <h3 className="font-display text-fg text-[1.25rem] font-semibold">{v.title}</h3>
                  <p className="text-fg-2 mt-2 text-[0.9375rem]">{v.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <Link to="/app" className="btn btn-secondary mt-4">
              Open the sample dashboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <DashboardMock focus={v.focus} />
        </div>
      </div>
    </Band>
  )
}

/* ========================================================================== */
/* 03 — Relevant opportunities and knowledge                                   */
/* ========================================================================== */

const FILTERS: { id: OppCategory; label: string }[] = [
  { id: 'accelerators', label: 'Accelerators' },
  { id: 'funding', label: 'Funding opportunities' },
  { id: 'events', label: 'Events' },
  { id: 'services', label: 'Services' },
]

const FILTER_MS = 3600

function metaFor(id: string) {
  const o = opportunities.find((x) => x.id === id)!
  if (o.category === 'events') return `${formatDate(o.date!)} · ${o.location}`
  if (o.category === 'services') return `${o.type} · ${o.location}`
  return `${o.type} · ${o.deadline ? `${daysUntil(o.deadline)} days left` : 'Rolling'}`
}

export function OpportunitiesKnowledge() {
  const scene = useAutoCycle(FILTERS.length, FILTER_MS, { loop: true })
  const f = FILTERS[scene.index]
  const rows = opportunities.filter((o) => o.category === f.id).slice(0, 3)

  return (
    <Band id="opportunities" tone="raised">
      <div className="container-site">
        <SectionIntro
          index="03"
          eyebrow="Opportunities & knowledge"
          title="What’s open to you, and how to use it."
          body="Spryve gathers external opportunities and providers into clear directories, and pairs them with a library of guides, templates and short courses."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          {/* Directory */}
          <div ref={scene.ref} className="bg-base border-line rounded-[22px] border p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Opportunities</p>
              <span className="text-fg-2 text-[0.75rem]">Sample listings</span>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Directory">
              {FILTERS.map((x, i) => (
                <button key={x.id} type="button" role="tab" aria-selected={i === scene.index} data-active={i === scene.index} onClick={() => scene.select(i)} className="chip shrink-0">
                  {x.label}
                </button>
              ))}
            </div>
            <div className="relative mt-4 min-h-[228px]">
              <AnimatePresence mode="wait">
                <motion.ul key={f.id} initial="hidden" animate="show" exit="exit" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="flex flex-col gap-2">
                  {rows.map((o) => (
                    <motion.li
                      key={o.id}
                      variants={{ hidden: { opacity: 0, x: 14 }, show: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 } }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="border-line bg-raised flex items-center justify-between gap-4 rounded-[14px] border px-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="text-fg block truncate text-[0.9375rem] font-medium">{o.title}</span>
                        <span className="text-fg-2 block text-[0.8125rem]">
                          {o.provider} · {metaFor(o.id)}
                        </span>
                      </span>
                      <span className="text-fg inline-flex shrink-0 items-center gap-1 text-[0.8125rem] max-sm:hidden">
                        {o.category === 'services' ? 'Visit provider' : 'View opportunity'}
                        <ArrowUpRight className="text-electric h-3.5 w-3.5" aria-hidden />
                      </span>
                      <ArrowUpRight className="text-electric h-4 w-4 shrink-0 sm:hidden" aria-label="External link" />
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
            <p className="text-fg-2 border-line mt-4 border-t pt-4 text-[0.8125rem]">
              Each listing explains the opportunity and links to the provider’s own website. Spryve doesn’t run programmes, provide funding or offer legal services.
            </p>
          </div>

          {/* Library */}
          <div className="bg-base border-line flex flex-col rounded-[22px] border p-5 sm:p-6">
            <p className="eyebrow">Library</p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { icon: BookOpen, kind: 'Resource', title: 'Pricing your first B2B product', meta: 'Guide · 18 min' },
                { icon: FileText, kind: 'Template', title: 'Pre-seed pitch deck', meta: 'Slides · 12 slides' },
              ].map((r, i) => (
                <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="border-line bg-raised flex items-center gap-3 rounded-[14px] border px-4 py-3">
                  <span className="border-line bg-base text-fg-2 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border">
                    <r.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="text-fg-2 block font-mono text-[0.625rem] tracking-widest uppercase">{r.kind}</span>
                    <span className="text-fg block truncate text-[0.9375rem] font-medium">{r.title}</span>
                    <span className="text-fg-2 block text-[0.8125rem]">{r.meta}</span>
                  </span>
                </motion.div>
              ))}
              <div className="border-electric/40 bg-raised rounded-[14px] border px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="border-electric/40 bg-electric/12 text-electric grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border">
                    <GraduationCap className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="text-fg-2 block font-mono text-[0.625rem] tracking-widest uppercase">Learn · in progress</span>
                    <span className="text-fg block text-[0.9375rem] font-medium">Pricing fundamentals</span>
                  </span>
                </div>
                <div className="bg-fg/10 mt-3 h-1.5 overflow-hidden rounded-full">
                  <motion.div className="bg-electric h-full rounded-full" initial={{ width: '0%' }} whileInView={{ width: '50%' }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
                </div>
                <p className="text-fg-2 mt-2 text-[0.75rem]">2 of 4 lessons · next: Running pricing interviews</p>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <Link to="/app/library" className="btn btn-secondary">
                Browse the Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Band>
  )
}
