import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { BUILD_STAGES } from '@/lib/data'
import { useAutoCycle } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { ReplayButton } from '@/components/landing/parts'

const ease = [0.22, 1, 0.36, 1] as const
export const BUILD_STEP_MS = 3400

function Artifact({ stage }: { stage: string }) {
  if (stage === 'idea')
    return (
      <motion.div initial={{ rotate: -6, scale: 0.9, opacity: 0 }} animate={{ rotate: -3, scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease }} className="bg-lime/90 w-[220px] rounded-[6px] p-5 text-[0.9375rem] leading-snug text-[var(--on-lime)] shadow-2xl">
        Clinics still plan shifts on a whiteboard.
        <br />
        <br />
        What if cover requests took minutes, not phone calls?
      </motion.div>
    )
  if (stage === 'shape')
    return (
      <div className="w-full max-w-[280px]">
        {[
          ['Must', 'Create a weekly rota'],
          ['Must', 'Request and confirm cover'],
          ['Next', 'Staff preferences'],
          ['Later', 'Payroll export'],
        ].map(([p, t], i) => (
          <motion.div key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12, duration: 0.4, ease }} className="border-line bg-raised mb-2 flex items-center gap-3 rounded-[10px] border px-3 py-2">
            <span className={cn('rounded-[5px] px-1.5 py-0.5 font-mono text-[0.625rem]', p === 'Must' ? 'bg-lime/15 text-lime' : p === 'Next' ? 'bg-electric/20 text-fg' : 'bg-fg/8 text-fg-2')}>{p}</span>
            <span className="text-fg text-[0.8125rem]">{t}</span>
          </motion.div>
        ))}
      </div>
    )
  if (stage === 'design')
    return (
      <div className="border-line bg-raised grid w-full max-w-[300px] grid-cols-[56px_1fr] gap-2 rounded-[14px] border p-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-fg/8 row-span-3 rounded-[8px]" />
        {[0, 1, 2].map((i) => (
          <motion.div key={i} initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.1 + i * 0.12, duration: 0.45, ease }} style={{ originX: 0 }} className={cn('h-12 rounded-[8px] border', i === 1 ? 'border-electric/60 bg-electric/10' : 'border-line bg-fg/5')} />
        ))}
      </div>
    )
  if (stage === 'develop')
    return (
      <div className="w-full max-w-[320px]">
        <div className="border-line bg-raised rounded-[14px] border p-3">
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={cn('h-5 rounded-[4px]', [2, 6, 13].includes(i) ? 'bg-lime/70' : [4, 9].includes(i) ? 'bg-electric/60' : 'bg-fg/8')} />
            ))}
          </div>
        </div>
        <div className="border-line bg-base mt-2 rounded-[10px] border px-3 py-2 font-mono text-[0.6875rem] leading-relaxed">
          <p className="text-fg-2">
            <span className="text-electric">const</span> rota = buildWeek(<span className="text-lime">39</span>)
          </p>
          <p className="text-fg-2">
            review(<span className="text-fg">'cover-requests'</span>) <span className="text-lime">✓</span>
          </p>
        </div>
      </div>
    )
  return (
    <div className="flex items-center gap-4">
      <div className="border-line-strong bg-raised h-[180px] w-[96px] rounded-[18px] border p-2">
        <div className="bg-base flex h-full flex-col gap-1.5 rounded-[12px] p-2">
          <span className="bg-lime/80 h-3 w-10 rounded-full" />
          <span className="bg-fg/10 h-8 rounded-[6px]" />
          <span className="bg-fg/10 h-8 rounded-[6px]" />
          <span className="bg-electric/40 h-8 rounded-[6px]" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {['Tested with users', 'Launch checklist', 'Handover'].map((t, i) => (
          <motion.span key={t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }} className="text-fg flex items-center gap-2 text-[0.8125rem]">
            <Check className="text-lime h-3.5 w-3.5" aria-hidden />
            {t}
          </motion.span>
        ))}
        <span className="border-lime/50 text-lime bg-lime/10 mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.625rem] tracking-wider uppercase">
          <span className="bg-lime pulse-soft h-1.5 w-1.5 rounded-full" />
          Live
        </span>
      </div>
    </div>
  )
}

/** Idea → Shape → Design → Develop → Launch, as a timed, clickable sequence. */
export function BuildProcess({ detailed = false }: { detailed?: boolean }) {
  const scene = useAutoCycle(BUILD_STAGES.length, BUILD_STEP_MS)
  const s = BUILD_STAGES[scene.index]
  const pct = (scene.index / (BUILD_STAGES.length - 1)) * 100

  return (
    <div ref={scene.ref}>
      {/* rail */}
      <div className="relative">
        <div className="bg-fg/10 absolute top-[15px] right-[10%] left-[10%] h-[2px] rounded-full" aria-hidden />
        <motion.div className="bg-lime absolute top-[15px] left-[10%] h-[2px] rounded-full" animate={{ width: `${pct * 0.8}%` }} transition={{ duration: 0.6, ease }} aria-hidden />
        <ol className="relative grid grid-cols-5" role="tablist" aria-label="Build stages">
          {BUILD_STAGES.map((st, i) => {
            const on = i === scene.index
            const past = i < scene.index
            return (
              <li key={st.id} className="flex justify-center">
                <button type="button" role="tab" aria-selected={on} onClick={() => scene.select(i)} className="group flex flex-col items-center gap-2">
                  <span className={cn('grid h-8 w-8 place-items-center rounded-full border font-mono text-[0.6875rem] transition-colors duration-300', on ? 'bg-lime border-lime text-[var(--on-lime)]' : past ? 'border-lime/60 bg-base text-lime' : 'border-line-strong bg-base text-fg-2 group-hover:text-fg')}>
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
        <div className="border-line bg-base dot-grid relative flex h-[260px] items-center justify-center overflow-hidden rounded-[20px] border p-6">
          <AnimatePresence mode="wait">
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="flex w-full justify-center">
              <Artifact stage={s.id} />
            </motion.div>
          </AnimatePresence>
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
          <div className="mt-4">
            <ReplayButton onClick={scene.replay} label="Replay the process" />
          </div>
        </div>
      </div>
    </div>
  )
}
