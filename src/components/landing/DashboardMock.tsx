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

function Module({ id, focus, title, children, className, accent }: { id: MockModule; focus?: MockModule[]; title: string; children: ReactNode; className?: string; accent?: 'lime' | 'blue' }) {
  const on = !focus || focus.length === 0 || focus.includes(id)
  const lit = focus && focus.includes(id)
  return (
    <motion.div
      animate={{ opacity: on ? 1 : 0.32, scale: lit ? 1.015 : 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-[14px] border p-3.5 transition-[border-color,box-shadow] duration-500',
        lit ? (accent === 'blue' ? 'border-electric/70 glow-blue' : 'border-lime/60 glow-lime') : 'border-line',
        'bg-raised',
        className,
      )}
    >
      <p className="mb-2.5 font-mono text-[9.5px] tracking-[0.14em] text-[var(--text-2)] uppercase">{title}</p>
      {children}
    </motion.div>
  )
}

const Bar = ({ w, className }: { w: string; className?: string }) => <span className={cn('bg-fg/10 block h-[6px] rounded-full', className)} style={{ width: w }} />

export function DashboardMock({ focus, className }: { focus?: MockModule[]; className?: string }) {
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
              <Module id="next" focus={focus} title="Your next steps" accent="lime">
                <p className="font-display text-fg text-[13px] font-semibold">Create your company profile</p>
                <p className="text-fg-2 mt-0.5 text-[10px]">So founders and programmes can find Cadence.</p>
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {[
                    ['Complete your profile', true],
                    ['Review 2 opportunities closing this month', false],
                    ['Continue Pricing fundamentals — lesson 3', false],
                  ].map(([t, done]) => (
                    <span key={t as string} className="flex items-center gap-2 text-[10.5px]">
                      <span className={cn('grid h-3.5 w-3.5 place-items-center rounded-full border', done ? 'bg-lime border-lime text-[var(--on-lime)]' : 'border-line-strong')}>
                        {done && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span className={done ? 'text-fg-2 line-through' : 'text-fg'}>{t as string}</span>
                    </span>
                  ))}
                </div>
              </Module>
              <Module id="company" focus={focus} title="Company status">
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
              <Module id="opps" focus={focus} title="Relevant opportunities" accent="lime">
                {[
                  ['Launchway Health Accelerator', 'Accelerator · 11 days left'],
                  ['Digital Health Innovation Grant', 'Grant · closes 1 Dec'],
                  ['Founders Night — Clinical Tech', 'Event · 8 Oct'],
                ].map(([t, m]) => (
                  <div key={t} className="border-line flex items-center justify-between border-t py-1.5 first:border-t-0 first:pt-0">
                    <span>
                      <span className="text-fg block text-[10.5px] font-medium">{t}</span>
                      <span className="text-fg-2 block text-[9.5px]">{m}</span>
                    </span>
                    <ArrowUpRight className="text-fg-2 h-3 w-3" />
                  </div>
                ))}
              </Module>
              <Module id="upcoming" focus={focus} title="Upcoming">
                {[
                  ['02', 'Pricing workshop'],
                  ['08', 'Founders Night'],
                  ['09', 'Launchway closes'],
                ].map(([d, t]) => (
                  <div key={t} className="flex items-center gap-2 py-1">
                    <span className="border-line text-electric grid h-6 w-6 place-items-center rounded-[6px] border font-mono text-[9px]">{d}</span>
                    <span className="text-fg text-[10.5px]">{t}</span>
                  </div>
                ))}
              </Module>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-3">
              <Module id="people" focus={focus} title="People" accent="blue">
                <div className="flex -space-x-1.5">
                  {['MS', 'RA', 'YB'].map((i) => (
                    <span key={i} className="border-electric/50 bg-base text-electric grid h-6 w-6 place-items-center rounded-full border font-mono text-[8px]">
                      {i}
                    </span>
                  ))}
                </div>
                <Bar w="80%" className="mt-2" />
              </Module>
              <Module id="messages" focus={focus} title="Messages" accent="blue">
                <p className="text-fg text-[10.5px]">2 unread</p>
                <Bar w="70%" className="mt-2" />
              </Module>
              <Module id="learning" focus={focus} title="Learning" accent="blue">
                <p className="text-fg text-[10.5px]">Lesson 3 of 4</p>
                <div className="bg-fg/10 mt-2 h-1 rounded-full">
                  <div className="bg-electric h-1 w-1/2 rounded-full" />
                </div>
              </Module>
              <Module id="saved" focus={focus} title="Saved">
                <p className="text-fg text-[10.5px]">8 items</p>
                <Bar w="60%" className="mt-2" />
              </Module>
            </div>
          </div>
        </div>
      </div>
    </ScaledFrame>
  )
}
