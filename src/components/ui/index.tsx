import { useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bookmark, BookmarkCheck, Info, LayoutGrid, List, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, type SavedKey, type ViewMode } from '@/lib/store'
import type { Accent, Stage } from '@/lib/data'
import { useToast } from './feedback'

/* -------------------------------------------------------------------------- */
/* Logo — PLACEHOLDER. This is the mark from P4 `main`, not a final logo.       */
/* The logo concepts on the separate branch were deliberately not used.       */
/* -------------------------------------------------------------------------- */

export function SpryveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('h-5 w-5', className)} aria-hidden>
      <path d="M3 17.5 9.2 10l4 4.4L21 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="5.5" r="2" fill="currentColor" />
    </svg>
  )
}

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} title="Placeholder logo — final mark to be decided">
      <span className="border-line bg-raised grid h-8 w-8 place-items-center rounded-[9px] border">
        <SpryveMark className="text-lime h-[18px] w-[18px]" />
      </span>
      {!compact && <span className="font-display text-fg text-[1.0625rem] font-semibold tracking-[-0.02em]">spryve</span>}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Identity marks                                                              */
/* -------------------------------------------------------------------------- */

const tone: Record<Accent, string> = {
  lime: 'text-lime border-lime/30 bg-lime/10',
  blue: 'text-electric border-electric/40 bg-electric/12',
  white: 'text-fg border-line-strong bg-fg/6',
}

export function Avatar({ initials, accent = 'blue', size = 'md', className }: { initials: string; accent?: Accent; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { xs: 'h-6 w-6 text-[0.5625rem]', sm: 'h-8 w-8 text-[0.625rem]', md: 'h-10 w-10 text-[0.75rem]', lg: 'h-14 w-14 text-sm', xl: 'h-20 w-20 text-lg' }
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full border font-mono font-medium', sizes[size], tone[accent], className)} aria-hidden>
      {initials}
    </span>
  )
}

export function CompanyMark({ mark, accent = 'lime', size = 'md', className }: { mark: string; accent?: Accent; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-9 w-9 rounded-[9px] text-[0.625rem]', md: 'h-11 w-11 rounded-[11px] text-[0.75rem]', lg: 'h-16 w-16 rounded-[15px] text-base' }
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center border font-mono font-medium tracking-wider', sizes[size], tone[accent], className)} aria-hidden>
      {mark}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                        */
/* -------------------------------------------------------------------------- */

export function Tag({ children, className, tone: t }: { children: ReactNode; className?: string; tone?: 'lime' | 'blue' }) {
  return (
    <span
      className={cn(
        'tag',
        t === 'lime' && '!text-lime !bg-lime/10',
        t === 'blue' && '!text-fg !bg-electric/20',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StageTag({ stage }: { stage: Stage | '' }) {
  if (!stage) return null
  return <Tag tone="blue">{stage}</Tag>
}

export function DeadlineTag({ days, label }: { days: number | null; label?: string }) {
  if (days === null) return <Tag>{label ?? 'Rolling'}</Tag>
  if (days < 0) return <Tag>Closed</Tag>
  return <Tag tone={days <= 14 ? 'lime' : undefined}>{days === 0 ? 'Closes today' : `${days} days left`}</Tag>
}

/* -------------------------------------------------------------------------- */
/* Save (bookmark) — every surface uses the same mock saved state              */
/* -------------------------------------------------------------------------- */

export function SaveButton({ itemKey, label, className, withText = false }: { itemKey: SavedKey; label: string; className?: string; withText?: boolean }) {
  const { isSaved, toggleSave } = useStore()
  const toast = useToast()
  const saved = isSaved(itemKey)
  const Icon = saved ? BookmarkCheck : Bookmark
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved` : `Save ${label}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const now = toggleSave(itemKey)
        toast(now ? 'Saved — find it on your Dashboard and in Saved.' : 'Removed from saved.')
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border transition-colors duration-200',
        withText ? 'min-h-[34px] px-3 text-[0.8125rem] font-medium' : 'h-9 w-9',
        saved ? 'border-lime/40 bg-lime/10 text-lime' : 'border-line text-fg-2 hover:text-fg hover:border-line-strong',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {withText && (saved ? 'Saved' : 'Save')}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Notes, empty states, progress                                               */
/* -------------------------------------------------------------------------- */

export function SampleNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-fg-2 flex items-start gap-2 text-[0.8125rem] leading-relaxed', className)}>
      <Info className="text-electric mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  )
}

export function EmptyState({ icon, title, body, action, className }: { icon: ReactNode; title: string; body: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('border-line-strong flex flex-col items-center rounded-[20px] border border-dashed px-6 py-12 text-center', className)}>
      <span className="bg-raised border-line text-fg-2 mb-4 grid h-12 w-12 place-items-center rounded-full border [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <h3 className="t-card">{title}</h3>
      <p className="text-fg-2 mt-2 max-w-[42ch] text-[0.875rem]">{body}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

export function Progress({ value, label, tone: t = 'lime', className }: { value: number; label: string; tone?: 'lime' | 'blue'; className?: string }) {
  return (
    <div
      className={cn('bg-fg/8 h-1.5 w-full overflow-hidden rounded-full', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-700', t === 'lime' ? 'bg-lime' : 'bg-electric')} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Segmented controls                                                          */
/* -------------------------------------------------------------------------- */

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div role="radiogroup" aria-label="Layout" className="border-line bg-base inline-flex rounded-full border p-0.5">
      {(
        [
          ['grid', 'Grid', LayoutGrid],
          ['list', 'List', List],
        ] as const
      ).map(([v, label, Icon]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] transition-colors',
            value === v ? 'bg-electric/20 text-fg' : 'text-fg-2 hover:text-fg',
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span className="max-sm:sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}

export function Tabs<T extends string>({ items, value, onChange, className, label }: { items: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string; label: string }) {
  const id = useId()
  return (
    <div role="tablist" aria-label={label} className={cn('border-line flex gap-1 overflow-x-auto border-b no-scrollbar', className)}>
      {items.map((it) => {
        const on = it.id === value
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.id)}
            className={cn('relative shrink-0 px-3 pt-2 pb-3 text-[0.875rem] font-medium transition-colors', on ? 'text-fg' : 'text-fg-2 hover:text-fg')}
          >
            {it.label}
            {it.count !== undefined && <span className="text-fg-2 ml-1.5 font-mono text-[0.75rem]">{it.count}</span>}
            {on && <motion.span layoutId={`tab-${id}`} className="bg-electric absolute inset-x-2 -bottom-px h-[2px] rounded-full" />}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Page header for workspace screens                                           */
/* -------------------------------------------------------------------------- */

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="t-page">{title}</h1>
        {description && <div className="text-fg-2 mt-2 max-w-[62ch] text-[0.9375rem]">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                       */
/* -------------------------------------------------------------------------- */

export function Modal({ open, onClose, title, children, width = 'max-w-md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('button, a, input, textarea, select')?.focus())
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="bg-base/80 absolute inset-0 backdrop-blur-sm" onClick={onClose} tabIndex={-1} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn('card relative w-full p-6 shadow-2xl', width)}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="t-card text-[1.0625rem]">{title}</h2>
              <button type="button" onClick={onClose} className="text-fg-2 hover:text-fg -m-1 rounded-full p-1" aria-label="Close dialog">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* -------------------------------------------------------------------------- */
/* Form primitives                                                             */
/* -------------------------------------------------------------------------- */

export function Field({ label, hint, error, required, children, htmlFor }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-fg text-[0.875rem] font-medium">
        {label}
        {required && <span className="text-lime ml-1" aria-hidden>*</span>}
        {!required && <span className="text-fg-2 ml-1.5 text-[0.75rem] font-normal">Optional</span>}
      </label>
      {hint && <p className="text-fg-2 -mt-0.5 text-[0.8125rem]">{hint}</p>}
      {children}
      {error && (
        <p className="text-[0.8125rem] text-[#ff9a8e]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200', checked ? 'bg-electric border-electric' : 'bg-base border-line-strong')}
    >
      <span className={cn('bg-fg absolute top-[3px] left-0 h-4 w-4 rounded-full transition-transform duration-200', checked ? 'translate-x-[22px]' : 'translate-x-[3px]')} />
    </button>
  )
}

export function ChipToggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="chip">
      {children}
    </button>
  )
}
