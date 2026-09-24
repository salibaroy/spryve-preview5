import { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { BUILD_STAGES } from '@/lib/data'
import { useAutoCycle } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { SceneStatus } from '@/components/landing/parts'

const ease = [0.22, 1, 0.36, 1] as const
export const BUILD_STEP_MS = 3200

/** A short in-stage beat (wireframe → designed, open → confirmed), replayed on entry. */
function useBeat(active: boolean, ms: number, calm: boolean) {
  const [on, setOn] = useState(calm)
  useEffect(() => {
    if (!active) return
    if (calm) {
      setOn(true)
      return
    }
    setOn(false)
    const id = window.setTimeout(() => setOn(true), ms)
    return () => window.clearTimeout(id)
  }, [active, ms, calm])
  return on || calm
}

/* The one example that evolves: a clinic-rota idea called Cadence. */
const ITEMS = [
  { id: 'rota', note: '– a weekly rota', brief: 'Create the weekly rota', tag: 'Must', label: 'Rota', value: '24 shifts' },
  { id: 'cover', note: '– cover by phone?!', brief: 'Request & confirm cover', tag: 'Must', label: 'Cover', value: '2 open' },
  { id: 'prefs', note: '– staff preferences', brief: 'Staff preferences', tag: 'Next', label: 'Prefs', value: '9 set' },
] as const

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }

/**
 * The same object throughout — frame, title, statement and three items stay
 * mounted and change form, so the visitor watches one idea become a product:
 * note → brief → wireframe → designed interface → working product → live.
 */
function BuildCanvas({ k, calm }: { k: number; calm: boolean }) {
  const designed = useBeat(k === 2, 1100, calm) || k > 2
  const confirmed = useBeat(k === 3, 1300, calm) || k > 3
  const note = k === 0
  const brief = k === 1
  const wire = k === 2 && !designed
  const ui = k >= 2 && !wire
  const layout = { layout: { duration: 0.6, ease } }

  return (
    <LayoutGroup id="p5-build">
      <div className="flex w-full flex-col items-center gap-3">
        <motion.div
          layout
          initial={false}
          animate={{ rotate: note ? -3 : 0 }}
          transition={{ duration: 0.6, ease, ...layout }}
          style={{ borderRadius: note ? 6 : 14 }}
          className={cn(
            'relative w-full overflow-hidden border transition-colors duration-500',
            note && 'bg-lime/90 max-w-[230px] border-transparent p-4 text-[var(--on-lime)] shadow-2xl',
            brief && 'bg-raised border-line-strong max-w-[300px] p-4',
            k >= 2 && 'max-w-[340px] p-3',
            wire && 'bg-base border-line-strong border-dashed',
            ui && 'bg-raised border-line',
            k === 4 && 'border-lime/40 glow-lime',
          )}
        >
          {/* browser / app chrome arrives with the interface */}
          <AnimatePresence initial={false}>
            {k >= 2 && (
              <motion.div layout="position" key="chrome" {...fade} className="border-line mb-2.5 flex items-center gap-1.5 border-b pb-2">
                <span className={cn('h-2 w-2 rounded-full', ui ? 'bg-fg/20' : 'bg-fg/10')} />
                <span className={cn('h-2 w-2 rounded-full', ui ? 'bg-fg/20' : 'bg-fg/10')} />
                <span className={cn('ml-2 flex h-4 flex-1 items-center rounded-full px-2 font-mono text-[0.5625rem]', k === 4 ? 'border-lime/40 text-fg border' : 'bg-fg/8 text-transparent')}>
                  {k === 4 ? 'cadence.example' : '·'}
                </span>
                {k === 4 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lime inline-flex items-center gap-1 font-mono text-[0.5625rem] tracking-wider uppercase"
                  >
                    <span className="bg-lime h-1.5 w-1.5 rounded-full" />
                    Live
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* title */}
          <motion.div layout="position" className="flex items-center gap-2">
            {ui && <motion.span layout initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-lime h-3.5 w-3.5 rounded-[4px]" aria-hidden />}
            {wire ? (
              <motion.span layout {...fade} className="bg-fg/15 block h-3 w-20 rounded-full" />
            ) : (
              <motion.span key={note ? 'n' : brief ? 'b' : 'u'} {...fade} className={cn('font-display font-semibold', note ? 'text-[1.0625rem]' : 'text-fg text-[0.9375rem]')}>
                {note ? 'Cadence?' : brief ? 'Brief — Cadence' : 'Cadence'}
              </motion.span>
            )}
            {brief && <span className="text-fg-2 ml-auto font-mono text-[0.5625rem] tracking-widest uppercase">v1 scope</span>}
            {ui && <span className="text-fg-2 ml-auto text-[0.625rem]">Week 39</span>}
          </motion.div>

          {/* statement */}
          <motion.div layout="position" className="mt-1.5">
            {wire ? (
              <span className="flex flex-col gap-1">
                <span className="bg-fg/10 block h-2 w-[80%] rounded-full" />
                <span className="bg-fg/10 block h-2 w-[55%] rounded-full" />
              </span>
            ) : (
              <motion.p key={note ? 'n' : brief ? 'b' : k >= 3 ? 'w' : 'd'} {...fade} className={cn('leading-snug', note ? 'text-[0.8125rem]' : 'text-fg-2 text-[0.75rem]')}>
                {note
                  ? 'Clinics still plan shifts on a whiteboard. What if cover took minutes?'
                  : brief
                    ? 'For clinic managers: plan the week and cover gaps in minutes.'
                    : k >= 3
                      ? confirmed
                        ? '1 gap left to cover this week'
                        : '2 gaps to cover this week'
                      : 'Plan the week. Cover gaps fast.'}
              </motion.p>
            )}
          </motion.div>

          {/* the three items: note lines → brief rows → wire blocks → modules → live data */}
          <div className={cn('mt-3', k >= 2 ? 'grid grid-cols-3 gap-1.5' : 'flex flex-col gap-1.5')}>
            {ITEMS.map((it, i) => (
              <motion.div
                layout
                key={it.id}
                transition={{ ...layout.layout, delay: i * 0.05 }}
                className={cn(
                  'rounded-[8px] transition-colors duration-500',
                  note && 'text-[0.75rem]',
                  brief && 'border-line bg-base flex items-center gap-2 border px-2.5 py-1.5',
                  wire && 'bg-fg/6 border-line-strong h-14 border border-dashed p-2',
                  ui && 'border-line bg-base flex h-14 flex-col justify-between border p-2',
                  ui && i === 1 && 'border-electric/50',
                )}
              >
                {note && (
                  <motion.span layout="position" {...fade} className="block">
                    {it.note}
                  </motion.span>
                )}
                {brief && (
                  <>
                    <motion.span layout="position" {...fade} className={cn('rounded-[5px] px-1.5 py-0.5 font-mono text-[0.5625rem]', it.tag === 'Must' ? 'bg-lime/15 text-lime' : 'bg-electric/20 text-fg')}>
                      {it.tag}
                    </motion.span>
                    <motion.span layout="position" {...fade} className="text-fg text-[0.75rem]">
                      {it.brief}
                    </motion.span>
                  </>
                )}
                {wire && <span className="bg-fg/15 block h-1.5 w-8 rounded-full" />}
                {ui && (
                  <>
                    <motion.span layout="position" initial={{ width: 0 }} animate={{ width: 20 }} className={cn('block h-1 rounded-full', i === 1 ? 'bg-electric' : 'bg-lime/70')} />
                    <span className="block">
                      <span className="text-fg-2 block text-[0.5625rem]">{it.label}</span>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={k >= 3 ? (i === 1 && confirmed ? 'c' : 'v') : 'd'} {...fade} className="text-fg flex items-center gap-1 text-[0.6875rem] font-medium">
                          {k < 3 ? (
                            <span className="bg-fg/15 block h-1.5 w-10 rounded-full" />
                          ) : i === 1 && confirmed ? (
                            <>
                              <Check className="text-lime h-3 w-3" aria-hidden />1 confirmed
                            </>
                          ) : (
                            it.value
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* develop: the product is running and checked */}
          <AnimatePresence initial={false}>
            {k === 3 && (
              <motion.p layout="position" key="tests" {...fade} className="border-line bg-base text-fg-2 mt-2 rounded-[8px] border px-2 py-1 font-mono text-[0.5625rem]">
                <span className="text-electric">test</span> cover-requests <span className={confirmed ? 'text-lime' : 'text-fg-2'}>{confirmed ? '✓ passing' : '… running'}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* launch: what "done" means */}
        <div className="flex min-h-[26px] flex-wrap justify-center gap-1.5">
          <AnimatePresence>
            {k === 4 &&
              ['Tested with users', 'Launch checklist', 'Handover'].map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.35 + i * 0.12, duration: 0.3 }}
                  className="border-line text-fg inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem]"
                >
                  <Check className="text-lime h-3 w-3" aria-hidden />
                  {t}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  )
}

/** Idea → Shape → Design → Develop → Launch, as a timed, clickable sequence. */
export function BuildProcess({ detailed = false }: { detailed?: boolean }) {
  const scene = useAutoCycle(BUILD_STAGES.length, BUILD_STEP_MS, { calmIndex: BUILD_STAGES.length - 1 })
  const s = BUILD_STAGES[scene.index]
  const span = 80 / (BUILD_STAGES.length - 1)

  return (
    <div ref={scene.ref}>
      {/* rail: filled up to the current stage, with the next leg counting down while it plays */}
      <div className="relative">
        <div className="bg-fg/10 absolute top-[15px] right-[10%] left-[10%] h-[2px] rounded-full" aria-hidden />
        <motion.div className="bg-lime absolute top-[15px] left-[10%] h-[2px] rounded-full" animate={{ width: `${scene.index * span}%` }} transition={{ duration: 0.6, ease }} aria-hidden />
        {scene.advancing && (
          <motion.div
            key={`leg-${scene.index}-${scene.runId}`}
            className="bg-lime/35 absolute top-[15px] h-[2px] rounded-full"
            style={{ left: `${10 + scene.index * span}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${span}%` }}
            transition={{ duration: BUILD_STEP_MS / 1000, ease: 'linear' }}
            aria-hidden
          />
        )}
        <ol className="relative grid grid-cols-5" role="tablist" aria-label="Build stages">
          {BUILD_STAGES.map((st, i) => {
            const on = i === scene.index
            const past = i < scene.index
            return (
              <li key={st.id} className="flex justify-center">
                <button type="button" role="tab" aria-selected={on} onClick={() => scene.select(i)} className="group flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full border font-mono text-[0.6875rem] transition-colors duration-300',
                      on ? 'bg-lime border-lime text-[var(--on-lime)]' : past ? 'border-lime/60 bg-base text-lime' : 'border-line-strong bg-base text-fg-2 group-hover:text-fg',
                    )}
                  >
                    {past ? <Check className="h-3.5 w-3.5" aria-hidden /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={cn('text-[0.75rem] font-medium sm:text-[0.8125rem]', on ? 'text-fg' : 'text-fg-2')}>{st.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {/* stage */}
      <div className="mt-8 grid items-center gap-6 md:grid-cols-[1fr_1fr]">
        <div
          className="border-line bg-base dot-grid relative flex h-[300px] items-center justify-center overflow-hidden rounded-[20px] border p-4 sm:p-6"
          role="img"
          aria-label={`Example project at the ${s.label} stage`}
        >
          <BuildCanvas k={scene.index} calm={scene.calm} />
        </div>
        <div className="min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              <p className="eyebrow">
                Stage {scene.index + 1} of {BUILD_STAGES.length}
              </p>
              <h3 className="font-display mt-2 text-[1.3rem] font-semibold">{s.title}</h3>
              <p className="text-fg-2 mt-2 text-[0.9375rem]">{s.body}</p>
              {detailed && (
                <p className="text-fg mt-4 inline-flex items-center gap-2 text-[0.875rem]">
                  <span className="text-fg-2">You leave with:</span> {s.output}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
          <SceneStatus advancing={scene.advancing} manual={scene.manual} calm={scene.calm} onReplay={scene.replay} replayLabel="Replay the process" className="mt-4" />
        </div>
      </div>
    </div>
  )
}
