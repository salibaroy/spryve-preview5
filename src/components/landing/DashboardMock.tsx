import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, Check } from 'lucide-react'
import { SpryveMark } from '@/components/ui'
import { cn } from '@/lib/utils'

/**
 * Renders children at a fixed design width and scales them to fit, so the
 * product mock keeps its proportions from phone to desktop.
 */
export function ScaledFrame({ width = 780, children, className }: { width?: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [h, setH] = useState<number | undefined>()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const s = el.clientWidth / width
      setScale(s)
      if (inner.current) setH(inner.current.offsetHeight * s)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])
  return (
    <div ref={ref} className={cn('relative w-full', className)} style={{ height: h }}>
      <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="absolute top-0 left-0">
        {children}
      </div>
    </div>
  )
}

export type MockModule = 'next' | 'company' | 'opps' | 'upcoming' | 'people' | 'learning' | 'messages' | 'saved'

const ease = [0.22, 1, 0.36, 1] as const

/** Entrance order used when the mock builds itself (hero): frame → next steps → context → the rest. */
const REVEAL_AT: Record<MockModule, number> = { next: 1, company: 2, opps: 2, upcoming: 2, people: 3, messages: 3, learning: 3, saved: 3 }

interface MockCtx {
  focus?: MockModule[]
  reveal?: number
  dim: number
}

function Module({ id, ctx, title, children, className, accent }: { id: MockModule; ctx: MockCtx; title: string; children: ReactNode; className?: string; accent?: 'lime' | 'blue' }) {
  const { focus, reveal, dim } = ctx
  const shown = reveal === undefined || reveal >= REVEAL_AT[id]
  const on = !focus || focus.length === 0 || focus.includes(id)
  const lit = Boolean(focus?.includes(id))
  return (
    <motion.div
      initial={false}
      animate={{ opacity: shown ? (on ? 1 : dim) : 0, y: shown ? 0 : 10, scale: lit ? 1.015 : 1 }}
      transition={{ duration: 0.5, ease }}
      className={cn(
        'relative rounded-[14px] border p-3.5 transition-[border-color,box-shadow] duration-500',
        lit ? (accent === 'blue' ? 'border-electric/70 glow-blue' : 'border-lime/60 glow-lime') : 'border-line',
        'bg-raised',
        className,
      )}
    >
      <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.14em] text-[var(--text-2)] uppercase">
        {lit && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={cn('h-1.5 w-1.5 rounded-full', accent === 'blue' ? 'bg-electric' : 'bg-lime')} aria-hidden />}
        {title}
      </p>
      {children}
    </motion.div>
  )
}

const Bar = ({ w, className }: { w: string; className?: string }) => <span className={cn('bg-fg/10 block h-[6px] rounded-full', className)} style={{ width: w }} />

/**
 * The sample dashboard. `focus` lights modules (and replays their small
 * in-module animation), `reveal` builds the frame up in order, and `dim` sets
 * how far unlit modules recede.
 */
export function DashboardMock({ focus, reveal, dim = 0.32, className }: { focus?: MockModule[]; reveal?: number; dim?: number; className?: string }) {
  const ctx: MockCtx = { focus, reveal, dim }
  const lit = (m: MockModule) => Boolean(focus?.includes(m))
  return (
    <ScaledFrame className={className}>
      <div className="border-line-strong bg-base overflow-hidden rounded-[20px] border shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        {/* chrome */}
        <div className="border-line flex h-10 items-center gap-3 border-b px-4">
          <span className="flex gap-1.5">
            <span className="bg-fg/15 h-2.5 w-2.5 rounded-full" />
            <span className="bg-fg/15 h-2.5 w-2.5 rounded-full" />
            <span className="bg-fg/15 h-2.5 w-2.5 rounded-full" />
          </span>
          <span className="border-line text-fg-2 mx-auto flex h-6 w-64 items-center justify-center rounded-full border text-[10px]">spryve · dashboard</span>
        </div>
        <div className="flex">
          {/* rail */}
          <div className="border-line flex w-12 flex-col items-center gap-3 border-r py-4">
            <SpryveMark className="text-lime h-4 w-4" />
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={cn('h-5 w-5 rounded-[6px]', i === 0 ? 'bg-lime/20 border-lime/40 border' : 'bg-fg/8')} />
            ))}
          </div>
          {/* content */}
          <div className="flex-1 p-4">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-fg-2 text-[10px]">Monday, 28 September</p>
                <p className="font-display text-fg text-[17px] font-semibold tracking-tight">Good morning, Lina</p>
              </div>
              <span className="border-line text-fg-2 rounded-full border px-2.5 py-1 text-[9.5px]">Search Spryve ⌘K</span>
            </div>

            <div className="grid grid-cols-[1.7fr_1fr] gap-3">
              <Module id="next" ctx={ctx} title="Your next steps" accent="lime">
                <p className="font-display text-fg text-[13px] font-semibold">Create your company profile</p>
                <p className="text-fg-2 mt-0.5 text-[10px]">So founders and programmes can find Cadence.</p>
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {[
                    ['Complete your profile', true],
                    ['Review 2 opportunities closing this month', false],
                    ['Continue Pricing fundamentals — lesson 3', false],
                  ].map(([t, done], i) => (
                    <motion.span
                      key={`${t as string}-${lit('next')}`}
                      initial={lit('next') ? { opacity: 0, x: -6 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease, delay: 0.15 + i * 0.12 }}
                      className={cn('flex items-center gap-2 rounded-[6px] text-[10.5px]', lit('next') && i === 1 && 'bg-lime/10 -mx-1 px-1 py-0.5')}
                    >
                      <span className={cn('grid h-3.5 w-3.5 place-items-center rounded-full border', done ? 'bg-lime border-lime text-[var(--on-lime)]' : i === 1 && lit('next') ? 'border-lime' : 'border-line-strong')}>
                        {done && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span className={done ? 'text-fg-2 line-through' : 'text-fg'}>{t as string}</span>
                      {lit('next') && i === 1 && <span className="text-lime ml-auto font-mono text-[8.5px] tracking-wider uppercase">Up next</span>}
                    </motion.span>
                  ))}
                </div>
              </Module>
              <Module id="company" ctx={ctx} title="Company status">
                <div className="flex items-center gap-2">
                  <span className="border-lime/40 text-lime bg-lime/10 grid h-7 w-7 place-items-center rounded-[7px] border font-mono text-[9px]">CD</span>
                  <div>
                    <p className="text-fg text-[11px] font-semibold">Cadence</p>
                    <p className="text-fg-2 text-[9.5px]">Draft · 3 of 6 sections</p>
                  </div>
                </div>
                <div className="bg-fg/10 mt-3 h-1 rounded-full">
                  <div className="bg-lime h-1 w-1/2 rounded-full" />
                </div>
              </Module>
            </div>

            <div className="mt-3 grid grid-cols-[1.7fr_1fr] gap-3">
              <Module id="opps" ctx={ctx} title="Relevant opportunities" accent="lime">
                {[
                  ['Launchway Health Accelerator', 'Accelerator · 11 days left', 'Fits: MVP · Healthtech'],
                  ['Digital Health Innovation Grant', 'Grant · closes 1 Dec', 'Fits: Healthtech'],
                  ['Founders Night — Clinical Tech', 'Event · 8 Oct', 'Near you'],
                ].map(([t, m, why], i) => (
                  <motion.div
                    key={`${t}-${lit('opps')}`}
                    initial={lit('opps') ? { opacity: 0, x: 12 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.12 }}
                    className="border-line flex items-center justify-between border-t py-1.5 first:border-t-0 first:pt-0"
                  >
                    <span>
                      <span className="text-fg block text-[10.5px] font-medium">{t}</span>
                      <span className="text-fg-2 block text-[9.5px]">
                        {m}
                        {lit('opps') && <span className="text-lime"> · {why}</span>}
                      </span>
                    </span>
                    <ArrowUpRight className={cn('h-3 w-3', lit('opps') ? 'text-electric' : 'text-fg-2')} />
                  </motion.div>
                ))}
              </Module>
              <Module id="upcoming" ctx={ctx} title="Upcoming">
                {[
                  ['02', 'Pricing workshop'],
                  ['08', 'Founders Night'],
                  ['09', 'Launchway closes'],
                ].map(([d, t], i) => (
                  <motion.div
                    key={`${t}-${lit('upcoming')}`}
                    initial={lit('upcoming') ? { opacity: 0, y: 6 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease, delay: 0.25 + i * 0.1 }}
                    className="flex items-center gap-2 py-1"
                  >
                    <span className="border-line text-electric grid h-6 w-6 place-items-center rounded-[6px] border font-mono text-[9px]">{d}</span>
                    <span className="text-fg text-[10.5px]">{t}</span>
                  </motion.div>
                ))}
              </Module>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-3">
              <Module id="people" ctx={ctx} title="People" accent="blue">
                <div className="flex -space-x-1.5">
                  {['MS', 'RA', 'YB'].map((i, n) => (
                    <motion.span
                      key={`${i}-${lit('people')}`}
                      initial={lit('people') ? { scale: 0.4, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35, ease, delay: 0.1 + n * 0.1 }}
                      className="border-electric/50 bg-base text-electric grid h-6 w-6 place-items-center rounded-full border font-mono text-[8px]"
                    >
                      {i}
                    </motion.span>
                  ))}
                </div>
                <p className="text-fg-2 mt-2 text-[9.5px]">3 founders to meet</p>
              </Module>
              <Module id="messages" ctx={ctx} title="Messages" accent="blue">
                <p className="text-fg flex items-center gap-1.5 text-[10.5px]">
                  <motion.span
                    key={`unread-${lit('messages')}`}
                    initial={lit('messages') ? { scale: 0 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.3 }}
                    className="bg-electric grid h-4 min-w-4 place-items-center rounded-full px-1 font-mono text-[8.5px] text-white"
                  >
                    2
                  </motion.span>
                  unread
                </p>
                <Bar w="70%" className="mt-2" />
              </Module>
              <Module id="learning" ctx={ctx} title="Learning" accent="blue">
                <p className="text-fg text-[10.5px]">Lesson 3 of 4</p>
                <div className="bg-fg/10 mt-2 h-1 overflow-hidden rounded-full">
                  <motion.div
                    key={`bar-${lit('learning')}`}
                    className="bg-electric h-1 rounded-full"
                    initial={lit('learning') ? { width: '25%' } : false}
                    animate={{ width: '50%' }}
                    transition={{ duration: 0.9, ease, delay: 0.25 }}
                  />
                </div>
              </Module>
              <Module id="saved" ctx={ctx} title="Saved">
                <p className="text-fg text-[10.5px]">
                  <motion.span
                    key={`saved-${lit('saved')}`}
                    className="inline-block"
                    initial={lit('saved') ? { y: -6, opacity: 0 } : false}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35, ease, delay: 0.45 }}
                  >
                    8
                  </motion.span>{' '}
                  items
                </p>
                <p className="text-fg-2 mt-1.5 truncate text-[9px]">Pitch deck · Launchway</p>
              </Module>
            </div>
          </div>
        </div>
      </div>
    </ScaledFrame>
  )
}
