import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionIntro({ index, eyebrow, title, body, className, align = 'left' }: { index?: string; eyebrow: string; title: ReactNode; body?: ReactNode; className?: string; align?: 'left' | 'center' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(align === 'center' && 'mx-auto text-center', className)}
    >
      <p className="eyebrow mb-4 flex items-center gap-2.5" style={align === 'center' ? { justifyContent: 'center' } : undefined}>
        {index && <span className="text-lime">{index}</span>}
        {index && <span className="bg-fg/20 h-px w-6" aria-hidden />}
        {eyebrow}
      </p>
      <h2 className={cn('t-section text-balance', align === 'center' ? 'mx-auto max-w-[22ch]' : 'max-w-[20ch]')}>{title}</h2>
      {body && <div className={cn('lede mt-4', align === 'center' && 'mx-auto')}>{body}</div>}
    </motion.div>
  )
}

/**
 * Step buttons for a timed scene. The active step shows a thin progress bar
 * while it counts down to the next one, and completed steps keep a quiet
 * filled bar — so visitors can see the scene is moving on its own, how far
 * along it is, and take over with a click at any point.
 */
export function SceneSteps({
  steps,
  index,
  onSelect,
  advancing,
  duration,
  className,
  tone = 'lime',
  label = 'Scene steps',
}: {
  steps: { id: string; label: string }[]
  index: number
  onSelect: (i: number) => void
  advancing: boolean
  duration: number
  className?: string
  tone?: 'lime' | 'blue'
  label?: string
}) {
  const bar = tone === 'lime' ? 'bg-lime' : 'bg-electric'
  return (
    <div role="tablist" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {steps.map((s, i) => {
        const on = i === index
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(i)}
            className={cn('relative overflow-hidden rounded-full border px-3.5 py-2 text-[0.8125rem] font-medium transition-colors', on ? 'border-line-strong bg-raised text-fg' : 'border-line text-fg-2 hover:text-fg')}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className={cn('font-mono text-[0.6875rem]', on ? (tone === 'lime' ? 'text-lime' : 'text-electric') : 'text-fg-2')}>{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </span>
            {i < index && <span className={cn('absolute bottom-0 left-0 h-[2px] w-full opacity-35', bar)} aria-hidden />}
            {on && advancing && (
              <motion.span
                key={`bar-${index}`}
                className={cn('absolute bottom-0 left-0 h-[2px]', bar)}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                aria-hidden
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

/** "Playing / Paused / Finished" plus Replay — the scene's state, stated plainly. */
export function SceneStatus({
  advancing,
  manual,
  calm,
  onReplay,
  step,
  total,
  replayLabel = 'Replay',
  className,
}: {
  advancing: boolean
  manual: boolean
  calm?: boolean
  onReplay: () => void
  step?: number
  total?: number
  replayLabel?: string
  className?: string
}) {
  const text = advancing ? 'Playing' : manual ? 'Paused · you’re in control' : calm ? 'Reduced motion · choose a step' : 'Finished'
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      <span className="text-fg-2 inline-flex items-center gap-2 text-[0.75rem]" aria-live="polite">
        <span className={cn('h-1.5 w-1.5 rounded-full', advancing ? 'bg-lime' : 'bg-fg/30')} aria-hidden />
        {step !== undefined && total !== undefined && (
          <span className="font-mono">
            {step} / {total}
          </span>
        )}
        {text}
      </span>
      <ReplayButton onClick={onReplay} label={replayLabel} />
    </div>
  )
}

export function ReplayButton({ onClick, label = 'Replay' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.8125rem]">
      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  )
}

export function Band({ id, tone = 'base', children, className }: { id?: string; tone?: 'base' | 'raised'; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('band relative scroll-mt-16 overflow-hidden', tone === 'raised' && 'bg-raised border-line border-y', className)}>
      {children}
    </section>
  )
}
