import { motion } from 'motion/react'
import { SCATTER } from '@/lib/data'
import { useAutoCycle } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { Band, ReplayButton, SectionIntro } from './parts'

/* Deliberately uneven scatter — a tidy ring would read as decoration. */
const SPOTS = [
  { left: 2, top: 6, rot: -5 },
  { left: 56, top: 0, rot: 4 },
  { left: 30, top: 24, rot: -2 },
  { left: 66, top: 30, rot: 6 },
  { left: 0, top: 50, rot: 3 },
  { left: 40, top: 58, rot: -4 },
  { left: 62, top: 72, rot: -6 },
  { left: 12, top: 80, rot: 5 },
]

/* Where each fragment lands once it becomes part of the dashboard. */
const UNIFIED = [
  '3 open to your stage',
  '2 worth a look this month',
  'Pricing script, saved',
  '2 this month near you',
  'Founders to meet',
  'Independent providers',
  'Picked for your next step',
  'Create your company profile',
]

export function Problem() {
  const scene = useAutoCycle(2, 1600, { calmIndex: 1 })
  const together = scene.index === 1

  return (
    <Band id="problem" tone="raised">
      <div className="container-site grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionIntro
            index="01"
            eyebrow="The problem"
            title={together ? <>Now it lives in <span className="text-lime">one useful dashboard.</span></> : 'Building a company means searching everywhere.'}
            body={
              together
                ? 'Spryve brings those scattered sources into one view, ordered around what you are working on this week.'
                : 'Programmes on one site, funding in a spreadsheet, templates in someone’s drive, events in three group chats.'
            }
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-label="Show state" className="border-line bg-base inline-flex rounded-full border p-1">
              {['Scattered', 'In one place'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={scene.index === i}
                  onClick={() => scene.select(i)}
                  className={cn('rounded-full px-4 py-1.5 text-[0.8125rem] font-medium transition-colors', scene.index === i ? (i === 1 ? 'bg-lime text-[var(--on-lime)]' : 'bg-raised text-fg') : 'text-fg-2 hover:text-fg')}
                >
                  {label}
                </button>
              ))}
            </div>
            <ReplayButton onClick={scene.replay} />
          </div>
        </div>

        <div ref={scene.ref} className="relative aspect-[4/3.4] w-full sm:aspect-[4/3]">
          {/* The dashboard that forms around the fragments */}
          <motion.div
            className="border-lime/35 bg-base absolute inset-[4%] rounded-[22px] border"
            initial={false}
            animate={{ opacity: together ? 1 : 0, scale: together ? 1 : 0.92 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            <div className="border-line flex items-center justify-between border-b px-4 py-3">
              <span className="font-display text-fg text-[0.875rem] font-semibold">Your dashboard</span>
              <span className="text-fg-2 font-mono text-[0.625rem] tracking-widest uppercase">Today</span>
            </div>
          </motion.div>

          {SCATTER.map((f, i) => {
            const spot = SPOTS[i]
            const col = i % 2
            const row = Math.floor(i / 2)
            return (
              <motion.div
                key={f.label}
                className={cn('absolute', i >= 6 && !together && 'max-sm:hidden')}
                initial={false}
                animate={
                  together
                    ? { left: `${8 + col * 43}%`, top: `${21 + row * 19}%`, width: '41%', rotate: 0 }
                    : { left: `${spot.left}%`, top: `${spot.top}%`, width: '36%', rotate: spot.rot }
                }
                transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: together ? i * 0.05 : (7 - i) * 0.03 }}
              >
                <div
                  className={cn(
                    'rounded-[12px] border px-3 py-2.5 transition-colors duration-700 sm:px-3.5',
                    together ? 'border-line bg-raised' : 'border-line-strong bg-raised shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]',
                  )}
                >
                  <p className="text-fg flex items-center gap-2 text-[0.75rem] font-semibold sm:text-[0.8125rem]">
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-700', together ? (i === 7 ? 'bg-lime' : 'bg-electric') : 'bg-fg/25')} aria-hidden />
                    {f.label}
                  </p>
                  <p className="text-fg-2 mt-0.5 truncate text-[0.6875rem] sm:text-[0.75rem]">{together ? UNIFIED[i] : f.where}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Band>
  )
}
