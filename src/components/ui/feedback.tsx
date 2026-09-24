import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from './index'

/* -------------------------------------------------------------------------- */
/* Toasts                                                                      */
/* -------------------------------------------------------------------------- */

const ToastCtx = createContext<(msg: string) => void>(() => {})

export function useToast() {
  return useContext(ToastCtx)
}

/* -------------------------------------------------------------------------- */
/* Outbound links — every directory listing leads to the provider's own site.  */
/* Sample providers are fictional, so the preview explains instead of leaving. */
/* -------------------------------------------------------------------------- */

interface External {
  provider: string
  site: string
  action: string
}

const ExternalCtx = createContext<(e: External) => void>(() => {})

export function useExternal() {
  return useContext(ExternalCtx)
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])
  const [ext, setExt] = useState<External | null>(null)

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, msg }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      <ExternalCtx.Provider value={setExt}>
        {children}

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4" aria-live="polite">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="card pointer-events-auto flex items-center gap-2.5 !rounded-full px-4 py-2.5 text-[0.875rem] shadow-xl"
              >
                <Check className="text-lime h-4 w-4 shrink-0" aria-hidden />
                {t.msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Modal open={ext !== null} onClose={() => setExt(null)} title="This opens the provider’s own website">
          {ext && (
            <div className="flex flex-col gap-4 text-[0.9375rem]">
              <p className="text-fg-2">
                In the live product, <span className="text-fg">“{ext.action}”</span> opens{' '}
                <span className="text-fg">{ext.provider}</span>’s website in a new tab, where you apply, register or get in touch
                with them directly.
              </p>
              <div className="well flex items-center gap-3 px-4 py-3">
                <ExternalLink className="text-electric h-4 w-4 shrink-0" aria-hidden />
                <span className="font-mono text-[0.8125rem]">{ext.site}</span>
              </div>
              <p className="text-fg-2 text-[0.8125rem]">
                This listing is illustrative sample content, so no external site is attached in the preview. Spryve does not run
                this opportunity, provide funding, or deliver third-party services.
              </p>
              <button type="button" className="btn btn-secondary self-end" onClick={() => setExt(null)}>
                Got it
              </button>
            </div>
          )}
        </Modal>
      </ExternalCtx.Provider>
    </ToastCtx.Provider>
  )
}

export function ExternalAction({
  label = 'Visit provider',
  provider,
  site,
  variant = 'secondary',
  className,
}: {
  label?: string
  provider: string
  site: string
  variant?: 'primary' | 'secondary' | 'link'
  className?: string
}) {
  const open = useExternal()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        open({ provider, site, action: label })
      }}
      className={cn(
        variant === 'link'
          ? 'text-fg hover:text-electric inline-flex items-center gap-1 text-[0.8125rem] font-medium underline-offset-4 hover:underline'
          : cn('btn btn-sm', variant === 'primary' ? 'btn-primary' : 'btn-secondary'),
        className,
      )}
    >
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">(external website)</span>
    </button>
  )
}
