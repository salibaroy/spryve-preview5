import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'
import { AreaTabs } from '@/components/app/Listing'
import { Avatar, EmptyState, SampleNote } from '@/components/ui'
import { hubTabs } from './HubOverview'
import { companyBySlug, initialsOf } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function Messages() {
  const { state, unread, sendMessage, markRead } = useStore()
  const [params, setParams] = useSearchParams()
  const activeId = params.get('thread')
  const active = state.threads.find((t) => t.id === activeId)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (active?.unread) markRead(active.id)
  }, [active, markRead])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [active?.messages.length, activeId])

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!active || !draft.trim()) return
    sendMessage(active.id, draft.trim())
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2">Founders Hub</p>
        <h1 className="t-page">Messages</h1>
      </div>
      <AreaTabs items={hubTabs(unread)} active="messages" />

      {state.threads.length === 0 ? (
        <EmptyState icon={<MessageCircle />} title="No conversations yet" body="Open a company in Founders Hub and choose Message to start one. Conversations stay next to the company they’re about." action={<Link to="/app/hub" className="btn btn-primary btn-sm">Browse Founders Hub</Link>} />
      ) : (
        <div className="card grid min-h-[560px] overflow-hidden md:grid-cols-[300px_1fr]">
          {/* thread list */}
          <ul className={cn('border-line flex flex-col md:border-r', active && 'max-md:hidden')} aria-label="Conversations">
            {state.threads.map((t) => {
              const c = companyBySlug(t.companySlug)
              const last = t.messages[t.messages.length - 1]
              const on = t.id === activeId
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => setParams({ thread: t.id })} className={cn('border-line flex w-full items-center gap-3 border-b px-4 py-3.5 text-left transition-colors', on ? 'bg-electric/12' : 'hover:bg-lift')} aria-current={on ? 'true' : undefined}>
                    <Avatar initials={initialsOf(t.person)} size="md" accent={c?.accent ?? 'blue'} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn('truncate text-[0.9375rem]', t.unread ? 'text-fg font-semibold' : 'text-fg')}>{t.person}</span>
                        <span className="text-fg-2 shrink-0 text-[0.6875rem]">{last?.at}</span>
                      </span>
                      <span className="text-fg-2 block truncate text-[0.8125rem]">{c?.name}</span>
                      <span className={cn('block truncate text-[0.8125rem]', t.unread ? 'text-fg' : 'text-fg-2')}>{last ? `${last.from === 'me' ? 'You: ' : ''}${last.body}` : 'New conversation'}</span>
                    </span>
                    {t.unread && <span className="bg-electric h-2 w-2 shrink-0 rounded-full" aria-label="Unread" />}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* conversation */}
          <div className={cn('flex min-h-[520px] flex-col', !active && 'max-md:hidden')}>
            {!active ? (
              <div className="text-fg-2 grid flex-1 place-items-center p-8 text-center text-[0.9375rem]">Choose a conversation to read it.</div>
            ) : (
              <>
                <div className="border-line flex items-center gap-3 border-b px-4 py-3">
                  <button type="button" onClick={() => setParams({})} className="text-fg-2 hover:text-fg -ml-1 rounded-full p-1.5 md:hidden" aria-label="Back to conversations">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <Avatar initials={initialsOf(active.person)} size="sm" accent={companyBySlug(active.companySlug)?.accent ?? 'blue'} />
                  <span className="min-w-0 flex-1">
                    <span className="text-fg block text-[0.9375rem] font-medium">{active.person}</span>
                    <Link to={`/app/hub/company/${active.companySlug}`} className="text-fg-2 hover:text-fg block text-[0.75rem] hover:underline">
                      {companyBySlug(active.companySlug)?.name} · view company
                    </Link>
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4" aria-live="polite">
                  {active.messages.length === 0 && <p className="text-fg-2 m-auto text-center text-[0.875rem]">Say hello — a short note on why you’re reaching out works best.</p>}
                  <AnimatePresence initial={false}>
                    {active.messages.map((m) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={cn('max-w-[78%] rounded-[16px] border px-4 py-2.5 text-[0.9375rem]', m.from === 'me' ? 'bg-electric/18 border-electric/40 self-end rounded-br-[4px]' : 'bg-base border-line self-start rounded-bl-[4px]')}>
                        {m.body}
                        <span className="text-fg-2 mt-1 block text-[0.6875rem]">{m.at}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={endRef} />
                </div>
                <form onSubmit={send} className="border-line flex items-center gap-2 border-t p-3">
                  <label htmlFor="msg" className="sr-only">
                    Message {active.person}
                  </label>
                  <input id="msg" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${active.person.split(' ')[0]}…`} className="input !rounded-full" autoComplete="off" />
                  <button type="submit" disabled={!draft.trim()} className="bg-lime grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--on-lime)] disabled:opacity-40" aria-label="Send">
                    <Send className="h-4 w-4" aria-hidden />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      <SampleNote>Sample conversations. Messages you send stay in this browser — nobody receives them.</SampleNote>
    </div>
  )
}
