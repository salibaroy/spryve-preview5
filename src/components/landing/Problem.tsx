import { LayoutGroup, motion } from 'motion/react'
import { SCATTER } from '@/lib/data'
import { useMedia, useSequence } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { Band, ReplayButton, SectionIntro } from './parts'

const ease = [0.22, 1, 0.36, 1] as const
const travel = [0.65, 0, 0.35, 1] as const

/* Deliberately uneven scatter — a tidy ring would read as decoration. */
const SPOTS = [
  { left: 2, top: 6, rot: -5 },
  { left: 56, top: 0, rot: 4 },
  { left: 30, top: 24, rot: -2 },
  { left: 64, top: 30, rot: 6 },
  { left: 0, top: 50, rot: 3 },
  { left: 38, top: 58, rot: -4 },
  { left: 62, top: 74, rot: -6 },
  { left: 12, top: 80, rot: 5 },
]
/* Phones get six fragments and a taller stage — the same mess, less of it. */
const SPOTS_SM = [
  { left: 2, top: 4, rot: -5 },
  { left: 50, top: 12, rot: 4 },
  { left: 6, top: 30, rot: 3 },
  { left: 50, top: 42, rot: -4 },
  { left: 0, top: 62, rot: -3 },
  { left: 48, top: 76, rot: 5 },
]

/* What each fragment becomes once it is part of the dashboard. */
const UNIFIED = [
  '3 open to your stage',
  '2 worth a look this month',
  'Pricing script, saved',
  '2 this month near you',
  'Founders to meet',
  'Independent providers ↗',
  'Picked for your next step',
  'Create your company profile',
]

/* Where each fragment lands. Next steps goes last — it is the point of the view. */
const MODULES: {
  id: string
  title: string
  tone: 'lime' | 'blue'
  items: number[]
}[] = [
  { id: 'next', title: 'Your next step', tone: 'lime', items: [7] },
  { id: 'opps', title: 'Opportunities', tone: 'lime', items: [0, 1, 3] },
  { id: 'know', title: 'Knowledge', tone: 'blue', items: [2, 6] },
  { id: 'people', title: 'People & providers', tone: 'blue', items: [4, 5] },
]
const FLIGHT_ORDER = [0, 1, 3, 2, 6, 4, 5, 7]

/*
 * 0  scattered (8 places, no shared view)
 * 1  the dashboard frame draws in, with an empty slot for every fragment
 * 2  each fragment travels into its slot and takes on its dashboard meaning
 * 3  settled: next step lit, the view reads as one thing
 */
const TIMES = [450, 950, 1900]

function Fragment({ i, layoutId, rot }: { i: number; layoutId?: string; rot: number }) {
  const f = SCATTER[i]
  return (
    <motion.div
      layoutId={layoutId}
      initial={{ rotate: 0 }}
      animate={{ rotate: rot }}
      transition={{ duration: 0.6, ease, layout: { duration: 0.75, ease: travel } }}
      className="border-line-strong bg-raised rounded-[12px] border px-3 py-2.5 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)] sm:px-3.5"
    >
      <motion.p layout="position" className="text-fg flex items-center gap-2 text-[0.75rem] font-semibold sm:text-[0.8125rem]">
        <span className="bg-fg/25 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
        {f.label}
      </motion.p>
      <motion.p layout="position" className="text-fg-2 mt-0.5 truncate text-[0.6875rem] sm:text-[0.75rem]">
        {f.where}
      </motion.p>
    </motion.div>
  )
}

function Row({ i, tone, layoutId, lit }: { i: number; tone: 'lime' | 'blue'; layoutId?: string; lit: boolean }) {
  const f = SCATTER[i]
  const order = FLIGHT_ORDER.indexOf(i)
  return (
    <motion.div
      layoutId={layoutId}
      initial={layoutId ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.8, ease: travel, delay: order * 0.07 },
        duration: 0.4,
        delay: 0.3 + order * 0.07,
      }}
      className={cn('bg-raised flex h-[38px] flex-col justify-center rounded-[10px] border px-2.5 transition-[border-color,box-shadow] duration-500 sm:h-[42px] sm:px-3', lit ? 'border-lime/60 glow-lime' : 'border-line')}
    >
      <motion.p layout="position" className="text-fg flex items-center gap-1.5 text-[0.6875rem] leading-tight font-semibold sm:text-[0.75rem]">
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tone === 'lime' ? 'bg-lime' : 'bg-electric')} aria-hidden />
        <span className="truncate">{f.label}</span>
      </motion.p>
      <motion.p
        layout="position"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.55 + order * 0.07 }}
        className={cn('truncate text-[0.625rem] leading-tight sm:text-[0.6875rem]', lit ? 'text-lime' : 'text-fg-2')}
      >
        {UNIFIED[i]}
      </motion.p>
    </motion.div>
  )
}

function Module({ m, phase, travels }: { m: (typeof MODULES)[number]; phase: number; travels: (i: number) => boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 8 }}
      transition={{
        duration: 0.45,
        ease,
        delay: phase >= 1 ? MODULES.indexOf(m) * 0.08 : 0,
      }}
      className={cn('rounded-[14px] border p-2 sm:p-2.5', phase >= 3 && m.id === 'next' ? 'border-lime/30' : 'border-line')}
    >
      <p className="mb-1.5 flex items-center justify-between font-mono text-[0.5625rem] tracking-[0.14em] text-[var(--text-2)] uppercase sm:text-[0.625rem]">
        {m.title}
        {phase >= 3 && m.id !== 'next' && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={m.tone === 'lime' ? 'text-lime' : 'text-electric'}>
            {m.items.length}
          </motion.span>
        )}
      </p>
      <div className="flex flex-col gap-[5px] sm:gap-1.5">
        {m.items.map((i) =>
          phase >= 2 ? (
            <Row key={i} i={i} tone={m.tone} layoutId={travels(i) ? `p5-frag-${i}` : undefined} lit={phase >= 3 && m.id === 'next'} />
          ) : (
            /* the empty slot the fragment will land in */
            <div key={i} className="border-line-strong h-[38px] rounded-[10px] border border-dashed opacity-60 sm:h-[42px]" aria-hidden />
          ),
        )}
      </div>
    </motion.div>
  )
}

export function Problem() {
  const scene = useSequence(TIMES)
  const { phase } = scene
  const wide = useMedia('(min-width: 640px)')
  const spots = wide ? SPOTS : SPOTS_SM
  const travels = (i: number) => i < spots.length
  const together = phase >= 2
  const mod = (id: string) => MODULES.find((m) => m.id === id)!

  return (
    <Band id="problem" tone="raised">
      <div className="container-site grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionIntro
            index="01"
            eyebrow="The problem"
            title="Building a company means searching everywhere."
            body="Programmes on one site, funding in a spreadsheet, templates in someone’s drive, events in three group chats."
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-label="Show state" className="border-line bg-base inline-flex rounded-full border p-1">
              {['Scattered', 'In one place'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={(together ? 1 : 0) === i}
                  onClick={() => scene.select(i === 0 ? 0 : TIMES.length)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-[0.8125rem] font-medium transition-colors',
                    (together ? 1 : 0) === i ? (i === 1 ? 'bg-lime text-[var(--on-lime)]' : 'bg-raised text-fg') : 'text-fg-2 hover:text-fg',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <ReplayButton onClick={scene.replay} />
          </div>
          <p className={cn('mt-5 flex max-w-[46ch] items-start gap-2.5 text-[0.9375rem] transition-colors duration-500', together ? 'text-fg' : 'text-fg-2')} aria-live="polite">
            <span className={cn('mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500', together ? 'bg-lime' : 'bg-fg/30')} aria-hidden />
            {together ? 'Spryve brings them into one dashboard, each source in its place and ordered around what you’re working on this week.' : `${SCATTER.length} places to check, and nothing connects them.`}
          </p>
        </div>

        <LayoutGroup id="p5-problem">
          <div
            ref={scene.ref}
            className="relative aspect-[3/4] w-full sm:aspect-[4/3]"
            aria-label={together ? 'The scattered sources arranged into one dashboard' : 'Founder resources scattered across many places'}
            role="img"
          >
            {/* The dashboard that forms around the fragments */}
            <motion.div
              className="border-line-strong bg-base absolute inset-0 flex flex-col rounded-[22px] border"
              initial={false}
              animate={
                phase >= 1
                  ? {
                      opacity: 1,
                      clipPath: 'inset(0% 0% 0% 0% round 22px)',
                      transitionEnd: { clipPath: 'none' },
                    }
                  : { opacity: 0, clipPath: 'inset(0% 0% 100% 0% round 22px)' }
              }
              transition={{ duration: 0.6, ease }}
            >
              <div className="border-line flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4 sm:py-3">
                <span className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden>
                    <span className="bg-fg/15 h-2 w-2 rounded-full" />
                    <span className="bg-fg/15 h-2 w-2 rounded-full" />
                    <span className="bg-fg/15 h-2 w-2 rounded-full" />
                  </span>
                  <span className="font-display text-fg text-[0.8125rem] font-semibold sm:text-[0.875rem]">Your dashboard</span>
                </span>
                <span className={cn('font-mono text-[0.5625rem] tracking-widest uppercase transition-colors duration-500 sm:text-[0.625rem]', phase >= 3 ? 'text-lime' : 'text-fg-2')}>
                  {phase >= 3 ? 'Ordered for this week' : 'Today'}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-3">
                <Module m={mod('next')} phase={phase} travels={travels} />
                <div className="grid flex-1 gap-1.5 sm:grid-cols-[1.1fr_1fr] sm:gap-2">
                  <Module m={mod('opps')} phase={phase} travels={travels} />
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-1 sm:gap-2">
                    <Module m={mod('know')} phase={phase} travels={travels} />
                    <Module m={mod('people')} phase={phase} travels={travels} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* The mess */}
            {!together &&
              spots.map((spot, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[46%] sm:w-[36%]"
                  style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
                  initial={scene.inView ? false : { opacity: 0, y: 10 }}
                  animate={scene.inView || scene.calm ? { opacity: phase >= 1 ? 0.92 : 1, y: 0 } : undefined}
                  transition={{
                    duration: 0.5,
                    ease,
                    delay: phase === 0 ? i * 0.06 : 0,
                  }}
                >
                  <Fragment i={i} rot={spot.rot} layoutId={`p5-frag-${i}`} />
                </motion.div>
              ))}
          </div>
        </LayoutGroup>
      </div>
    </Band>
  )
}
