import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, ArrowUpRight, BookOpen, FileText, GraduationCap } from 'lucide-react'
import { DashboardMock, type MockModule } from './DashboardMock'
import { Band, SceneControls, SceneSteps, SectionIntro } from './parts'
import { useCalm, useDriven, useScrollScene } from '@/lib/hooks'
import { daysUntil, formatDate, opportunities, type OppCategory } from '@/lib/data'
import { cn } from '@/lib/utils'

/* ========================================================================== */
/* 02 — One useful dashboard                                                   */
/* ========================================================================== */

const VIEWS: {
  id: string
  label: string
  focus: MockModule[]
  title: string
  body: string
}[] = [
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

/*
 * Scroll map for the dashboard (0..1 as the mock travels up the screen):
 * 0–0.34 the modules arrive in order (next steps → context → the rest),
 * 0.4–1  the four steps, each lighting its part of the dashboard.
 */
const STEP_START = 0.4
const STEP_SPAN = (1 - STEP_START) / 4
const revealFor = (v: number) => (v < 0.1 ? 0 : v < 0.22 ? 1 : v < 0.34 ? 2 : 3)
const stepFor = (v: number) => Math.max(0, Math.min(3, Math.floor((v - STEP_START) / STEP_SPAN)))

/**
 * The payoff: as the section scrolls in, the dashboard tilts up out of the
 * page and settles flat and full-size — the scattered pieces above, now one
 * working surface. Scroll-linked; static with reduced motion.
 */
function Payoff({ children }: { children: ReactNode }) {
  const calm = useCalm()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 35%'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0])
  const y = useTransform(scrollYProgress, [0, 1], [70, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.35, 1])
  return (
    <div ref={ref} style={{ perspective: 1400 }}>
      <motion.div style={calm ? undefined : { scale, rotateX, y, opacity, transformOrigin: '50% 0%' }}>{children}</motion.div>
    </div>
  )
}

export function DashboardShowcase() {
  /* Follows the scroll: nothing advances while you read unless you scroll or pick a step. */
  const scene = useScrollScene({ start: [0, 0.9], end: [1, 0.55], calmValue: STEP_START + STEP_SPAN / 2 })
  const reveal = useDriven(scene.driver, revealFor)
  const index = useDriven(scene.driver, stepFor)
  const fill = useTransform(scene.driver, [STEP_START, 1], [0, 1])
  const v = VIEWS[index]
  const select = (i: number) => scene.goTo(STEP_START + (i + 0.5) * STEP_SPAN, 0)
  return (
    <Band id="dashboard">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%] opacity-30 blur-[100px]"
        style={{
          background: 'radial-gradient(40% 50% at 70% 30%, color-mix(in oklab, var(--brand-tertiary) 50%, transparent), transparent)',
        }}
        aria-hidden
      />
      <div className="container-site relative">
        <SectionIntro
          index="02"
          eyebrow="The dashboard"
          title={
            <>
              One dashboard. <span className="text-lime">Clear next steps.</span>
            </>
          }
          body="Relevant information and what to do about it — arranged so you understand it in a few seconds."
        />

        <div className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12">
          <div className="order-2 lg:sticky lg:top-28 lg:order-1">
            <SceneSteps steps={VIEWS} index={index} onSelect={select} fill={fill} className="lg:flex-col lg:items-start" label="Dashboard story" />
            <SceneControls calm={scene.calm} onReplay={() => scene.replay(4)} className="mt-4" />
            <div className="relative mt-4 min-h-[132px]">
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
          <div ref={scene.ref} className="order-1 lg:order-2">
            <Payoff>
              <DashboardMock reveal={reveal} focus={reveal >= 3 ? v.focus : reveal >= 1 ? ['next'] : undefined} dim={0.45} />
            </Payoff>
          </div>
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

function metaFor(id: string) {
  const o = opportunities.find((x) => x.id === id)!
  if (o.category === 'events') return `${formatDate(o.date!)} · ${o.location}`
  if (o.category === 'services') return `${o.type} · ${o.location}`
  return `${o.type} · ${o.deadline ? `${daysUntil(o.deadline)} days left` : 'Rolling'}`
}

export function OpportunitiesKnowledge() {
  /* Tabs change only when you choose — nothing cycles while you read. */
  const [tab, setTab] = useState(0)
  const f = FILTERS[tab]
  const all = opportunities.filter((o) => o.category === f.id)
  const rows = all.slice(0, 3)
  const lead = rows[0]

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
          <div className="bg-base border-line min-w-0 rounded-[22px] border p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Opportunities</p>
              <span className="text-fg-2 text-[0.75rem]" aria-live="polite">
                <span className="text-fg font-mono">{rows.length}</span> of {all.length} sample listings
              </span>
            </div>
            <LayoutGroup id="p5-dir">
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Directory">
                {FILTERS.map((x, i) => {
                  const on = i === tab
                  return (
                    <button
                      key={x.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setTab(i)}
                      className={cn('relative shrink-0 rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors', on ? 'text-fg border-transparent' : 'border-line text-fg-2 hover:text-fg')}
                    >
                      {on && (
                        <motion.span
                          layoutId="p5-dir-pill"
                          className="border-electric/60 bg-electric/16 absolute inset-0 rounded-full border"
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          aria-hidden
                        />
                      )}
                      <span className="relative">{x.label}</span>
                    </button>
                  )
                })}
              </div>
            </LayoutGroup>
            <div className="relative mt-4 min-h-[228px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={f.id}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    show: { transition: { staggerChildren: 0.05 } },
                    exit: { transition: { duration: 0.12 } },
                  }}
                  className="flex flex-col gap-2"
                >
                  {rows.map((o, i) => (
                    <motion.li
                      key={o.id}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        show: { opacity: 1, y: 0 },
                        exit: { opacity: 0, transition: { duration: 0.12 } },
                      }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className={cn('bg-raised flex items-center justify-between gap-4 rounded-[14px] border px-4 py-3 transition-colors duration-500', i === 0 ? 'border-electric/35' : 'border-line')}
                    >
                      <span className="min-w-0">
                        <span className="text-fg block truncate text-[0.9375rem] font-medium">{o.title}</span>
                        <span className="text-fg-2 block truncate text-[0.8125rem]">
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

            {/* Where a listing leads: out of Spryve, to the provider. */}
            <div className="border-line mt-4 border-t pt-4">
              <div className="flex items-center gap-2 text-[0.75rem] sm:gap-3" aria-hidden>
                <span className="border-line-strong bg-raised text-fg shrink-0 rounded-full border px-2.5 py-1">Spryve listing</span>
                <span className="relative h-px min-w-6 flex-1 bg-[var(--line-strong)]">
                  <motion.span
                    key={`pulse-${f.id}`}
                    className="bg-electric absolute top-[-1px] left-0 h-[3px] w-8 rounded-full"
                    initial={{ left: '0%', opacity: 0 }}
                    animate={{ left: ['0%', '85%'], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.9,
                      ease: 'easeInOut',
                      delay: 0.25,
                    }}
                  />
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={lead?.providerSite}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                    className="border-electric/50 text-fg inline-flex max-w-[55%] shrink-0 items-center gap-1 truncate rounded-full border px-2.5 py-1"
                  >
                    <span className="truncate">{lead?.providerSite}</span>
                    <ArrowUpRight className="text-electric h-3 w-3 shrink-0" />
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="text-fg-2 mt-3 text-[0.8125rem]">Each listing explains the opportunity and links to the provider’s own website. Spryve doesn’t run programmes, provide funding or offer legal services.</p>
            </div>
          </div>

          {/* Library */}
          <div className="bg-base border-line flex flex-col rounded-[22px] border p-5 sm:p-6">
            <p className="eyebrow">Library</p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                {
                  icon: BookOpen,
                  kind: 'Resource',
                  title: 'Pricing your first B2B product',
                  meta: 'Guide · 18 min',
                },
                {
                  icon: FileText,
                  kind: 'Template',
                  title: 'Pre-seed pitch deck',
                  meta: 'Slides · 12 slides',
                },
              ].map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="border-line bg-raised flex items-center gap-3 rounded-[14px] border px-4 py-3"
                >
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
                  <motion.div
                    className="bg-electric h-full rounded-full"
                    initial={{ width: '0%' }}
                    whileInView={{ width: '50%' }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.3,
                    }}
                  />
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
