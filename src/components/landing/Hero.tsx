import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Bell, ListChecks, MessageCircle } from 'lucide-react'
import { DashboardMock, type MockModule } from './DashboardMock'
import { useSequence } from '@/lib/hooks'
import { cn } from '@/lib/utils'

type Signal = {
  id: string
  text: string
  module: MockModule
  icon: typeof Bell
  tone: 'lime' | 'blue'
  pos: string
}

const NEXT: Signal = {
  id: 'next',
  text: 'Next step: create your company profile',
  module: 'next',
  icon: ListChecks,
  tone: 'lime',
  pos: 'lg:-left-10 lg:-top-6',
}
const DEADLINE: Signal = {
  id: 'deadline',
  text: 'Launchway Health Accelerator closes in 11 days',
  module: 'opps',
  icon: Bell,
  tone: 'lime',
  pos: 'lg:-left-10 lg:-bottom-8',
}
const MESSAGE: Signal = {
  id: 'message',
  text: 'Maya Sleiman sent you a message',
  module: 'messages',
  icon: MessageCircle,
  tone: 'blue',
  pos: 'lg:-right-6 lg:-bottom-8',
}
const SETTLED: Signal = {
  id: 'settled',
  text: 'Up next: review 2 opportunities closing this month',
  module: 'next',
  icon: ListChecks,
  tone: 'lime',
  pos: 'lg:-left-10 lg:-top-6',
}

/*
 * Entrance, in one short pass: the frame lands, next steps light up, the
 * context modules fill in, two signals point at what changed today, and the
 * dashboard settles fully readable with next steps still marked. ~6 s total,
 * readable from ~1.5 s, never loops.
 */
const TIMES = [650, 1100, 1550, 2900, 4400, 5900]

function signalFor(phase: number): Signal | undefined {
  if (phase < 1) return undefined
  if (phase < 4) return NEXT
  if (phase === 4) return DEADLINE
  if (phase === 5) return MESSAGE
  return SETTLED
}

export function Hero() {
  const scene = useSequence(TIMES, { amount: 0.2 })
  const { phase } = scene
  const active = signalFor(phase)
  const settled = phase >= TIMES.length

  return (
    <section className="relative overflow-hidden pt-[68px]">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_60%_at_65%_40%,black,transparent)]" aria-hidden />
      <div
        className="pointer-events-none absolute top-[10%] right-[-10%] h-[520px] w-[720px] rounded-full opacity-40 blur-[120px]"
        style={{
          background: 'radial-gradient(closest-side, color-mix(in oklab, var(--brand-tertiary) 55%, transparent), transparent)',
        }}
        aria-hidden
      />

      <div className="container-site relative grid items-center gap-12 pt-12 pb-20 md:pt-16 lg:min-h-[calc(92svh-68px)] lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:pb-24">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="eyebrow mb-5 flex items-center gap-2">
            <span className="bg-lime pulse-soft h-1.5 w-1.5 rounded-full" aria-hidden />
            The founder platform
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.08,
            }}
            className="t-hero max-w-[14ch]"
          >
            Your startup world, <span className="text-lime">in one place.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} className="lede mt-6">
            A dashboard that shows what matters next. A Founders Hub to meet the people building beside you. And Spryve Build, optional hands-on help when you want to design or develop something.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.32,
            }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/register" className="btn btn-primary">
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/app" className="btn btn-secondary">
              Preview the dashboard
            </Link>
          </motion.div>
          <p className="text-fg-2 mt-6 text-[0.75rem]">Concept preview · all content is illustrative</p>
        </div>

        <motion.div ref={scene.ref} initial={{ opacity: 0, y: 36, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }} className="relative">
          <div className="lg:rotate-[-1.2deg]">
            <DashboardMock reveal={phase} focus={active ? [active.module] : undefined} dim={settled ? 1 : 0.55} />
          </div>

          {/* Signals arriving — each lights the part of the dashboard it belongs to. */}
          <div className="relative mt-5 min-h-[64px] lg:static lg:mt-0 lg:min-h-0" aria-live="polite">
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('card flex items-center gap-3 px-4 py-3 shadow-2xl lg:absolute lg:max-w-[300px]', active.pos, active.tone === 'lime' ? 'border-lime/40' : 'border-electric/50')}
                >
                  <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full', active.tone === 'lime' ? 'bg-lime/12 text-lime' : 'bg-electric/15 text-electric')}>
                    <active.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-fg text-[0.8125rem] leading-snug">{active.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
