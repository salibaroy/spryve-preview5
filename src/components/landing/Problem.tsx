import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { easeInOut, motion, useTransform, type MotionValue } from 'motion/react'
import { SCATTER } from '@/lib/data'
import { useDriven, useMedia, useScrollScene } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { Band, ReplayButton, SectionIntro } from './parts'

/* Deliberately uneven scatter — a tidy ring would read as decoration. (% of the stage) */
const SPOTS = [
  { left: 2, top: 6, rot: -5 },
  { left: 56, top: 0, rot: 4 },
  { left: 30, top: 24, rot: -2 },
  { left: 64, top: 30, rot: 6 },
  { left: 0, top: 50, rot: 3 },
  { left: 38, top: 58, rot: -4 },
  { left: 62, top: 74, rot: -6 },
  { left: 12, top: 82, rot: 5 },
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
const UNIFIED = ['3 open to your stage', '2 worth a look this month', 'Pricing script, saved', '2 this month near you', 'Founders to meet', 'Independent providers ↗', 'Picked for your next step', 'Create your company profile']

const MODULES: { id: string; title: string; tone: 'lime' | 'blue'; items: number[] }[] = [
  { id: 'next', title: 'Your next step', tone: 'lime', items: [7] },
  { id: 'opps', title: 'Opportunities', tone: 'lime', items: [0, 1, 3] },
  { id: 'know', title: 'Knowledge', tone: 'blue', items: [2, 6] },
  { id: 'people', title: 'People & providers', tone: 'blue', items: [4, 5] },
]
const TONE = Object.fromEntries(MODULES.flatMap((m) => m.items.map((i) => [i, m.tone]))) as Record<number, 'lime' | 'blue'>
/* Next steps lands last — it is the point of the view. */
const FLIGHT_ORDER = [0, 1, 3, 2, 6, 4, 5, 7]

type Box = { l: number; t: number; w: number; h: number }
const ease = easeInOut

/**
 * One fragment. Its position, size, tilt and wording are CSS calc()s between
 * the scattered spot and its measured slot, mixed by `--t` — a MotionValue
 * tied to scroll. Scroll down and it travels in; scroll up and it leaves.
 */
function Fragment({ i, t, from, to, rot, lit, fade }: { i: number; t: MotionValue<number>; from: Box; to: Box; rot: number; lit: MotionValue<number>; fade?: boolean }) {
  const f = SCATTER[i]
  const mix = (a: number, b: number) => `calc(${a}px + ${b - a}px * var(--t))`
  const style = {
    '--t': t,
    '--l': lit,
    left: mix(from.l, to.l),
    top: mix(from.t, to.t),
    width: mix(from.w, to.w),
    height: mix(from.h, to.h),
    rotate: `calc(${rot}deg * (1 - var(--t)))`,
    /* not scattered on phones: it simply appears in its slot as the others arrive */
    ...(fade ? { opacity: 'var(--t)' } : {}),
  } as unknown as CSSProperties
  return (
    <motion.div style={style} className="absolute z-10">
      <div className="bg-raised border-line-strong relative flex h-full flex-col justify-center overflow-hidden rounded-[11px] border px-2.5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.9)] sm:px-3">
        {i === 7 && <span className="border-lime/70 glow-lime pointer-events-none absolute inset-0 rounded-[11px] border" style={{ opacity: 'var(--l)' }} aria-hidden />}
        <p className="text-fg flex items-center gap-1.5 text-[0.6875rem] leading-tight font-semibold sm:text-[0.75rem]">
          <span className="relative h-1.5 w-1.5 shrink-0" aria-hidden>
            <span className="bg-fg/25 absolute inset-0 rounded-full" />
            <span className={cn('absolute inset-0 rounded-full', TONE[i] === 'lime' ? 'bg-lime' : 'bg-electric')} style={{ opacity: 'var(--t)' }} />
          </span>
          <span className="truncate">{f.label}</span>
        </p>
        <p className="relative mt-0.5 h-[1.2em] text-[0.625rem] leading-tight sm:text-[0.6875rem]">
          <span className="text-fg-2 absolute inset-0 truncate" style={{ opacity: 'calc(1 - var(--t) * 1.6)' }}>
            {f.where}
          </span>
          <span className={cn('absolute inset-0 truncate', i === 7 ? 'text-lime' : 'text-fg-2')} style={{ opacity: 'calc(var(--t) * 1.6 - 0.6)' }}>
            {UNIFIED[i]}
          </span>
        </p>
      </div>
    </motion.div>
  )
}

function FragmentAt({ i, order, driver, from, to, rot, lit, fade }: { i: number; order: number; driver: MotionValue<number>; from: Box; to: Box; rot: number; lit: MotionValue<number>; fade?: boolean }) {
  const s = 0.22 + order * 0.045
  const t = useTransform(driver, [s, s + 0.4], [0, 1], { ease })
  return <Fragment i={i} t={t} from={from} to={to} rot={rot} lit={lit} fade={fade} />
}

export function Problem() {
  const wide = useMedia('(min-width: 640px)')
  const spots = wide ? SPOTS : SPOTS_SM
  /* From the stage's top reaching 85% down the screen to its centre at mid-screen: a normal scroll, no pinning. */
  const scene = useScrollScene({ start: [0, 0.85], end: [0.5, 0.5] })
  const { driver } = scene
  const frame = useTransform(driver, [0.02, 0.26], [0, 1])
  const lit = useTransform(driver, [0.9, 1], [0, 1])
  const together = useDriven(driver, (v) => v > 0.62)
  const settled = useDriven(driver, (v) => v > 0.95)

  const stage = useRef<HTMLDivElement | null>(null)
  const slots = useRef<(HTMLDivElement | null)[]>([])
  const [geo, setGeo] = useState<{ W: number; H: number; slots: Box[] } | null>(null)
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      setGeo({
        W: r.width,
        H: r.height,
        slots: SCATTER.map((_, i) => {
          const b = slots.current[i]?.getBoundingClientRect()
          return b ? { l: b.left - r.left, t: b.top - r.top, w: b.width, h: b.height } : { l: 0, t: 0, w: 0, h: 0 }
        }),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [wide])

  const frameStyle = { '--f': frame, opacity: 'var(--f)', clipPath: 'inset(0 0 calc((1 - var(--f)) * 100%) 0 round 22px)' } as unknown as CSSProperties
  const cardH = wide ? 50 : 46
  const setRef = (el: HTMLDivElement | null) => {
    scene.ref.current = el
    stage.current = el
  }

  return (
    <Band id="problem" tone="raised">
      <div className="container-site grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionIntro index="01" eyebrow="The problem" title="Building a company means searching everywhere." body="Programmes on one site, funding in a spreadsheet, templates in someone’s drive, events in three group chats." />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-label="Show state" className="border-line bg-base inline-flex rounded-full border p-1">
              {['Scattered', 'In one place'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={(together ? 1 : 0) === i}
                  onClick={() => scene.goTo(i === 0 ? 0 : 1, 1.1)}
                  className={cn('rounded-full px-4 py-1.5 text-[0.8125rem] font-medium transition-colors', (together ? 1 : 0) === i ? (i === 1 ? 'bg-lime text-[var(--on-lime)]' : 'bg-raised text-fg') : 'text-fg-2 hover:text-fg')}
                >
                  {label}
                </button>
              ))}
            </div>
            {!scene.calm && <ReplayButton onClick={() => scene.replay(2.6)} />}
          </div>
          <p className={cn('mt-5 flex max-w-[46ch] items-start gap-2.5 text-[0.9375rem] transition-colors duration-500', together ? 'text-fg' : 'text-fg-2')} aria-live="polite">
            <span className={cn('mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500', together ? 'bg-lime' : 'bg-fg/30')} aria-hidden />
            {together ? 'Spryve brings them into one dashboard, each source in its place and ordered around what you’re working on this week.' : `${SCATTER.length} places to check, and nothing connects them.`}
          </p>
          {!scene.calm && <p className="text-fg-2 mt-3 text-[0.75rem]">Scroll to bring them together — scroll back to scatter them again.</p>}
        </div>

        <div ref={setRef} className="relative aspect-[3/4] w-full sm:aspect-[4/3]" role="img" aria-label={together ? 'The scattered sources arranged into one dashboard' : 'Founder resources scattered across many places'}>
          {/* the dashboard that forms around the fragments */}
          <motion.div style={frameStyle} className="border-line-strong bg-base absolute inset-0 flex flex-col rounded-[22px] border">
            <div className="border-line flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4 sm:py-3">
              <span className="flex items-center gap-2">
                <span className="flex gap-1" aria-hidden>
                  <span className="bg-fg/15 h-2 w-2 rounded-full" />
                  <span className="bg-fg/15 h-2 w-2 rounded-full" />
                  <span className="bg-fg/15 h-2 w-2 rounded-full" />
                </span>
                <span className="font-display text-fg text-[0.8125rem] font-semibold sm:text-[0.875rem]">Your dashboard</span>
              </span>
              <span className={cn('font-mono text-[0.5625rem] tracking-widest uppercase transition-colors duration-500 sm:text-[0.625rem]', settled ? 'text-lime' : 'text-fg-2')}>{settled ? 'Ordered for this week' : 'Today'}</span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-3">
              {(['next', 'grid'] as const).map((row) =>
                row === 'next' ? (
                  <ModuleShell key="next" m={MODULES[0]} slots={slots} settled={settled} />
                ) : (
                  <div key="grid" className="grid flex-1 gap-1.5 sm:grid-cols-[1.1fr_1fr] sm:gap-2">
                    <ModuleShell m={MODULES[1]} slots={slots} settled={settled} />
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-1 sm:gap-2">
                      <ModuleShell m={MODULES[2]} slots={slots} settled={settled} />
                      <ModuleShell m={MODULES[3]} slots={slots} settled={settled} />
                    </div>
                  </div>
                ),
              )}
            </div>
          </motion.div>

          {/* the fragments, travelling with the scroll */}
          {geo &&
            SCATTER.map((_, i) => {
              const to = geo.slots[i]
              const spot = spots[i]
              const from: Box = spot ? { l: (spot.left / 100) * geo.W, t: (spot.top / 100) * geo.H, w: geo.W * (wide ? 0.36 : 0.46), h: cardH } : to
              return <FragmentAt key={`${i}-${wide}`} i={i} order={FLIGHT_ORDER.indexOf(i)} driver={driver} from={from} to={to} rot={spot?.rot ?? 0} lit={lit} fade={!spot} />
            })}
        </div>
      </div>
    </Band>
  )
}

function ModuleShell({ m, slots, settled }: { m: (typeof MODULES)[number]; slots: React.MutableRefObject<(HTMLDivElement | null)[]>; settled: boolean }) {
  return (
    <div className={cn('rounded-[14px] border p-2 transition-colors duration-500 sm:p-2.5', settled && m.id === 'next' ? 'border-lime/30' : 'border-line')}>
      <p className="mb-1.5 flex items-center justify-between font-mono text-[0.5625rem] tracking-[0.14em] text-[var(--text-2)] uppercase sm:text-[0.625rem]">
        {m.title}
        {m.id !== 'next' && <span className={cn('transition-opacity duration-500', settled ? 'opacity-100' : 'opacity-0', m.tone === 'lime' ? 'text-lime' : 'text-electric')}>{m.items.length}</span>}
      </p>
      <div className="flex flex-col gap-[5px] sm:gap-1.5">
        {m.items.map((i) => (
          /* the empty slot a fragment lands in (measured, so the layout decides where "together" is) */
          <div
            key={i}
            ref={(el) => {
              slots.current[i] = el
            }}
            className="border-line-strong h-[38px] rounded-[10px] border border-dashed opacity-60 sm:h-[42px]"
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}
