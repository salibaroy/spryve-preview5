import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from 'motion/react'
import { ChevronsDown } from 'lucide-react'
import { ReplayButton } from './parts'
import { SpryveMark } from '@/components/ui'
import { useCalm } from '@/lib/hooks'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

/* P1's four-stage narrative, told with the four parts of Spryve. */
const STAGES = [
  { name: 'Origin', title: 'It starts scattered.', body: 'Opportunities, knowledge, people and building help live in separate places. Each is useful; none of them talk to each other.' },
  { name: 'Ignition', title: 'The parts start moving.', body: 'Tell Spryve your stage and focus, and the parts that matter begin travelling toward you.' },
  { name: 'Spryve', title: 'Spryve connects them.', body: 'One centre links the four, so what you learn, who you meet and what you apply for inform each other.' },
  { name: 'Connections', title: 'One founder experience.', body: 'A clear next step, the knowledge you need and the founders worth meeting — with building help only if you ask.' },
] as const

const C = { x: 200, y: 150 }
type P = { x: number; y: number }

/* Each part's position in each stage: scattered → inward → linked → holding the result. */
const PARTS: { id: string; label: string; color: string; row: string; at: [P, P, P, P] }[] = [
  { id: 'opp', label: 'Opportunities', color: 'var(--brand-secondary)', row: 'Opportunities for your stage', at: [{ x: 38, y: 46 }, { x: 118, y: 96 }, { x: 128, y: 92 }, { x: 88, y: 70 }] },
  { id: 'know', label: 'Knowledge', color: 'var(--brand-tertiary)', row: 'Guides and your next lesson', at: [{ x: 366, y: 64 }, { x: 284, y: 100 }, { x: 272, y: 92 }, { x: 312, y: 70 }] },
  { id: 'people', label: 'People', color: 'var(--text-1)', row: 'Founders worth meeting', at: [{ x: 56, y: 262 }, { x: 122, y: 206 }, { x: 128, y: 208 }, { x: 88, y: 230 }] },
  { id: 'build', label: 'Building help', color: 'var(--brand-tertiary)', row: 'Build help, only if you ask', at: [{ x: 348, y: 254 }, { x: 280, y: 204 }, { x: 272, y: 208 }, { x: 312, y: 230 }] },
]

/* Scroll progress at which each stage begins. */
const AT = [0, 0.22, 0.47, 0.72]
const stageFor = (p: number) => AT.reduce((s, t, i) => (p >= t ? i : s), 0)

function Diagram({ phase, calm }: { phase: number; calm: boolean }) {
  const d = calm ? 0 : 1
  return (
    <div className="relative">
      <svg viewBox="0 0 400 300" className="h-auto w-full" role="img" aria-label={`The Spryve Nexus, stage ${phase + 1} of 4: ${STAGES[phase].name}. ${STAGES[phase].title}`}>
        <defs>
          <radialGradient id="p5-nexus-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--brand-tertiary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--brand-tertiary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* core glow — ignites, then holds */}
        <motion.circle cx={C.x} cy={C.y} r="92" fill="url(#p5-nexus-core)" initial={false} animate={{ opacity: phase === 0 ? 0 : phase === 1 ? 0.45 : 1 }} transition={{ duration: 0.5 * d }} />

        {/* Ignition: a trail from where each part was to where it is going */}
        {PARTS.map((p, i) => (
          <motion.line
            key={`trail-${p.id}`}
            x1={p.at[0].x}
            y1={p.at[0].y}
            x2={p.at[1].x}
            y2={p.at[1].y}
            stroke={p.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="2 5"
            initial={false}
            animate={{ pathLength: phase >= 1 ? 1 : 0, opacity: phase === 1 ? 0.7 : phase > 1 ? 0.18 : 0 }}
            transition={{ duration: 0.6 * d, ease, delay: phase === 1 ? i * 0.06 * d : 0 }}
          />
        ))}

        {/* Spryve: each part links to the centre, and to its neighbours */}
        {PARTS.map((p, i) => {
          const at = p.at[Math.max(2, phase) as 2 | 3]
          return (
            <motion.line
              key={`link-${p.id}`}
              x1={C.x}
              y1={C.y}
              stroke={p.color}
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={false}
              animate={{ x2: at.x, y2: at.y, pathLength: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? (phase === 3 ? 0.35 : 0.85) : 0 }}
              transition={{ duration: 0.55 * d, ease, delay: phase === 2 ? i * 0.07 * d : 0 }}
            />
          )
        })}
        <motion.path
          d="M128 92 L272 92 L272 208 L128 208 Z"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1"
          strokeDasharray="3 5"
          initial={false}
          animate={{ pathLength: phase === 2 ? 1 : 0, opacity: phase === 2 ? 1 : 0 }}
          transition={{ duration: 0.7 * d, ease, delay: phase === 2 ? 0.25 * d : 0 }}
        />

        {/* the four parts */}
        {PARTS.map((p, i) => {
          const at = p.at[phase]
          const left = at.x < C.x
          const top = at.y < C.y
          return (
            <motion.g key={p.id} initial={false} animate={{ x: at.x, y: at.y }} transition={{ duration: 0.75 * d, ease, delay: phase === 1 ? i * 0.06 * d : 0 }}>
              <motion.g initial={calm ? false : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 * d, delay: i * 0.08 * d }}>
                <circle r="9" fill="var(--surface-2)" stroke={p.color} strokeWidth="1.5" />
                <circle r="3" fill={p.color} />
                <motion.text
                  initial={false}
                  animate={{ opacity: phase === 3 ? 0 : 1 }}
                  transition={{ duration: 0.3 * d }}
                  x={(phase === 0) === left ? 14 : -14}
                  y={phase === 0 ? (top ? -15 : 25) : top ? 26 : -16}
                  textAnchor={(phase === 0) === left ? 'start' : 'end'}
                  fontSize="13"
                  fontFamily="var(--font-sans)"
                  fill="var(--text-1)"
                >
                  {p.label}
                </motion.text>
              </motion.g>
            </motion.g>
          )
        })}

        {/* the centre: an ember at Ignition, Spryve at stage three */}
        <motion.g
          initial={false}
          animate={{ scale: phase === 0 ? 0 : phase === 1 ? 0.35 : phase === 2 ? 1 : 1.5, opacity: phase === 0 || phase === 3 ? 0 : 1 }}
          transition={{ duration: 0.5 * d, ease }}
          style={{ transformOrigin: `${C.x}px ${C.y}px` }}
        >
          <circle cx={C.x} cy={C.y} r="28" fill="var(--surface-1)" stroke="var(--brand-secondary)" strokeWidth="1.5" />
          <g transform={`translate(${C.x - 11} ${C.y - 11}) scale(0.92)`} color="var(--brand-secondary)">
            <path d="M3 17.5 9.2 10l4 4.4L21 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="21" cy="5.5" r="2" fill="currentColor" />
          </g>
        </motion.g>
      </svg>

      {/* Connections: the result, held by the four parts */}
      <motion.div
        initial={false}
        animate={{ opacity: phase === 3 ? 1 : 0, scale: phase === 3 ? 1 : 0.85 }}
        transition={{ duration: 0.45 * d, ease }}
        className="border-lime/45 bg-raised glow-lime absolute top-1/2 left-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border p-2.5 sm:w-[52%] sm:p-3"
        aria-hidden={phase !== 3}
      >
        <p className="eyebrow mb-1 flex items-center gap-1.5 !text-[0.5rem] sm:!text-[0.5625rem]">
          <SpryveMark className="text-lime h-3 w-3" />
          One founder experience
        </p>
        {PARTS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={false}
            animate={{ opacity: phase === 3 ? 1 : 0, x: phase === 3 ? 0 : -6 }}
            transition={{ duration: 0.3 * d, delay: phase === 3 ? (0.1 + i * 0.06) * d : 0 }}
            className="border-line flex items-center gap-2 border-t py-[3px] first:border-t-0 sm:py-1"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color }} />
            <span className="text-fg truncate text-[0.625rem] sm:text-[0.75rem]">{p.row}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

/**
 * The Spryve Nexus. Scrolling through the section advances the four stages
 * (the stage stays in view while you do); the stage tabs, Replay and Skip
 * take over at any point. Control goes back to scroll once the section has
 * left the screen. Reduced motion: no pinning, the resolved stage, tabs only.
 */
export function NexusSection() {
  const calm = useCalm()
  const ref = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const [phase, setPhase] = useState(calm ? 3 : 0)
  const [manual, setManual] = useState(false)
  const inView = useInView(ref, { amount: 0 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const clear = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }
  useEffect(() => clear, [])
  useEffect(() => {
    if (calm) setPhase(3)
  }, [calm])
  useEffect(() => {
    if (!inView) setManual(false)
  }, [inView])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (bar.current) bar.current.style.transform = `scaleX(${p})`
    if (!manual && !calm) setPhase(stageFor(p))
  })

  const select = useCallback((i: number) => {
    clear()
    setManual(true)
    setPhase(i)
  }, [])
  const replay = useCallback(() => {
    clear()
    setManual(true)
    setPhase(0)
    if (calm) return setPhase(3)
    timers.current = [1, 2, 3].map((s) => window.setTimeout(() => setPhase(s), s * 900))
  }, [calm])
  const skip = useCallback(() => {
    clear()
    setManual(true)
    setPhase(3)
    // Scroll on the next frame, once the stage change has rendered — a smooth
    // scroll started during that render gets cancelled by the layout change.
    window.requestAnimationFrame(() => {
      const el = document.getElementById('who-we-are')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: calm ? 'auto' : 'smooth' })
    })
  }, [calm])

  const s = STAGES[phase]

  return (
    <section id="about" ref={ref} className={cn('relative scroll-mt-0', calm ? 'band' : 'h-[230vh] sm:h-[250vh]')} aria-labelledby="nexus-title">
      <div className={cn(!calm && 'sticky top-0 flex h-[100svh] items-center overflow-hidden pt-[68px]')}>
        <div className="pointer-events-none absolute inset-0 opacity-30 blur-[110px]" style={{ background: 'radial-gradient(35% 45% at 68% 50%, color-mix(in oklab, var(--brand-tertiary) 55%, transparent), transparent)' }} aria-hidden />
        <div className="container-site relative grid w-full items-center gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          {/* narration */}
          <div className="order-2 lg:order-1">
            <p className="eyebrow mb-3 flex items-center gap-2.5 max-lg:hidden">
              <span className="text-lime">07</span>
              <span className="bg-fg/20 h-px w-6" aria-hidden />
              About Spryve · The Spryve Nexus
            </p>
            <h2 id="nexus-title" className="t-section max-w-[16ch] max-lg:hidden">
              How Spryve <span className="text-lime">comes together.</span>
            </h2>

            {/* desktop: the four stages, the current one open */}
            <ol className="mt-8 hidden flex-col lg:flex" role="tablist" aria-label="Spryve Nexus stages">
              {STAGES.map((st, i) => {
                const on = i === phase
                return (
                  <li key={st.name} className="border-line relative border-b">
                    <button type="button" role="tab" aria-selected={on} onClick={() => select(i)} className="flex w-full items-start gap-4 py-3 text-left">
                      <span className={cn('mt-[3px] w-6 shrink-0 font-mono text-[0.6875rem] transition-colors', on ? 'text-lime' : 'text-fg-2')}>{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-[0.9375rem] font-semibold transition-colors', on ? 'text-fg' : 'text-fg-2')}>
                          {st.name} <span className={cn('font-normal', on ? 'text-fg-2' : 'text-fg-2/70')}>· {st.title}</span>
                        </span>
                        <AnimatePresence initial={false}>
                          {on && (
                            <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: calm ? 0 : 0.35, ease }} className="text-fg-2 block overflow-hidden text-[0.875rem] leading-relaxed">
                              <span className="block pt-1.5">{st.body}</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </button>
                    {on && <motion.span layoutId="p5-nexus-mark" className="bg-lime absolute bottom-[-1px] left-0 h-px w-full" transition={{ duration: calm ? 0 : 0.35, ease }} aria-hidden />}
                  </li>
                )
              })}
            </ol>

            {/* mobile: current stage caption + compact tabs */}
            <div className="lg:hidden" aria-live="polite">
              <p className="eyebrow !text-[0.625rem]">
                The Spryve Nexus · {String(phase + 1).padStart(2, '0')} / 04 · {s.name}
              </p>
              <p className="font-display text-fg mt-1 text-[1.125rem] font-semibold">{s.title}</p>
              <p className="text-fg-2 mt-1 min-h-[4.2em] text-[0.8125rem] leading-snug">{s.body}</p>
              <div className="mt-3 grid grid-cols-4 gap-1.5" role="tablist" aria-label="Spryve Nexus stages">
                {STAGES.map((st, i) => (
                  <button key={st.name} type="button" role="tab" aria-selected={phase === i} onClick={() => select(i)} className={cn('rounded-full border px-1 py-1.5 text-[0.6875rem] transition-colors', phase === i ? 'border-lime/50 bg-lime/10 text-lime' : 'border-line text-fg-2')}>
                    {st.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mt-6">
              <ReplayButton onClick={replay} />
              <button type="button" onClick={skip} className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.8125rem]">
                <ChevronsDown className="h-3.5 w-3.5" aria-hidden />
                Skip to Who we are
              </button>
              {!calm && !manual && phase < 3 && <span className="text-fg-2 text-[0.75rem] max-sm:hidden">Scroll to advance</span>}
            </div>
          </div>

          {/* the diagram (on phones, the section title sits just above it) */}
          <div className="order-1 lg:order-2">
            <p className="eyebrow mb-2 flex items-center gap-2.5 lg:hidden">
              <span className="text-lime">07</span>
              <span className="bg-fg/20 h-px w-6" aria-hidden />
              About Spryve
            </p>
            <p className="font-display mb-4 text-[1.5rem] leading-tight font-semibold tracking-tight lg:hidden" aria-hidden>
              How Spryve <span className="text-lime">comes together.</span>
            </p>
            <div className="border-line bg-base/80 relative overflow-hidden rounded-[24px] border p-3 sm:p-6">
              <Diagram phase={phase} calm={calm} />
              {!calm && (
                <div className="bg-fg/10 absolute inset-x-0 bottom-0 h-[2px]" aria-hidden>
                  <div ref={bar} className="bg-lime h-full origin-left" style={{ transform: 'scaleX(0)', opacity: manual ? 0.3 : 1 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
