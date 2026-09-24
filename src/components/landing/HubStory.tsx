import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, MapPin, Send, UserPlus } from 'lucide-react'
import { Band, SceneSteps, SectionIntro } from './parts'
import { useAutoCycle, useCalm } from '@/lib/hooks'
import { companies, SAMPLE_COMPANY } from '@/lib/data'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'present', label: 'Present', title: 'Present your company', body: 'A guided profile turns what you are building, your stage and what you need into a card other founders can find.' },
  { id: 'discover', label: 'Discover', title: 'Discover founders and companies', body: 'Browse by industry, stage, location and what people are looking for — co-founders, clients, partners or mentors.' },
  { id: 'connect', label: 'Connect', title: 'Connect with intent', body: 'Send a short connection request. They see who you are and why you are reaching out before they accept.' },
  { id: 'message', label: 'Message', title: 'Keep the conversation going', body: 'Messages live next to the company profile, so context never gets lost in another app.' },
]

const STEP_MS = 4600
const ease = [0.22, 1, 0.36, 1] as const

function MiniCompany({ c, className }: { c: (typeof companies)[number]; className?: string }) {
  return (
    <div className={cn('border-line bg-raised rounded-[14px] border p-3.5', className)}>
      <div className="flex items-center gap-2.5">
        <span className={cn('grid h-8 w-8 place-items-center rounded-[8px] border font-mono text-[0.625rem]', c.accent === 'lime' ? 'border-lime/40 text-lime bg-lime/10' : c.accent === 'blue' ? 'border-electric/50 text-electric bg-electric/12' : 'border-line-strong text-fg')}>{c.mark}</span>
        <span className="min-w-0">
          <span className="text-fg block text-[0.875rem] font-semibold">{c.name}</span>
          <span className="text-fg-2 block truncate text-[0.6875rem]">
            {c.industry} · {c.stage}
          </span>
        </span>
      </div>
      <p className="text-fg-2 mt-2 line-clamp-2 text-[0.75rem]">{c.short}</p>
    </div>
  )
}

function PresentScene() {
  const rows = [
    ['Company name', SAMPLE_COMPANY.name],
    ['One-line description', SAMPLE_COMPANY.short],
    ['Stage · Industry', `${SAMPLE_COMPANY.stage} · ${SAMPLE_COMPANY.industry}`],
    ['Looking for', SAMPLE_COMPANY.lookingFor.join(', ')],
  ]
  return (
    <div className="grid h-full gap-4 sm:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col gap-2.5">
        {rows.map(([k, v], i) => (
          <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.35, duration: 0.4, ease }}>
            <p className="text-fg-2 text-[0.6875rem]">{k}</p>
            <p className="border-line-strong bg-base text-fg mt-1 truncate rounded-[10px] border px-3 py-2 text-[0.8125rem]">{v}</p>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6, duration: 0.5, ease }} className="border-lime/40 bg-raised glow-lime self-center rounded-[16px] border p-4 max-sm:hidden">
        <p className="eyebrow !text-[0.625rem]">Preview</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="border-lime/40 text-lime bg-lime/10 grid h-9 w-9 place-items-center rounded-[9px] border font-mono text-[0.6875rem]">CD</span>
          <span className="text-fg font-display text-[1rem] font-semibold">Cadence</span>
        </div>
        <p className="text-fg-2 mt-2 text-[0.8125rem]">{SAMPLE_COMPANY.short}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLE_COMPANY.lookingFor.map((l) => (
            <span key={l} className="border-electric/40 text-fg rounded-full border px-2 py-0.5 text-[0.6875rem]">
              {l}
            </span>
          ))}
        </div>
        <span className="btn btn-primary btn-sm mt-4 w-full">Publish profile</span>
      </motion.div>
    </div>
  )
}

function DiscoverScene() {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['Healthtech', 'MVP', 'Beirut', 'Looking for: Mentorship'].map((c, i) => (
          <motion.span key={c} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="chip" data-active={i < 2}>
            {c}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {companies.slice(0, 4).map((c, i) => (
          <motion.div key={c.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.1, duration: 0.45, ease }} className={cn(i > 1 && 'max-sm:hidden')}>
            <MiniCompany c={c} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ConnectScene({ calm }: { calm: boolean }) {
  const [sent, setSent] = useState(calm)
  useEffect(() => {
    if (calm) return
    const id = window.setTimeout(() => setSent(true), 1500)
    return () => window.clearTimeout(id)
  }, [calm])
  const c = companies[1]
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3 sm:gap-5">
        <span className="border-lime/50 text-lime bg-lime/10 grid h-14 w-14 place-items-center rounded-full border font-mono text-[0.8125rem]">LH</span>
        <svg width="120" height="8" viewBox="0 0 120 8" className="max-sm:w-16" aria-hidden>
          <motion.line x1="2" y1="4" x2="118" y2="4" stroke="var(--brand-tertiary)" strokeWidth="2" strokeDasharray="4 5" initial={{ pathLength: 0 }} animate={{ pathLength: sent ? 1 : 0.15 }} transition={{ duration: 0.9, ease }} />
        </svg>
        <span className="border-electric/50 text-electric bg-electric/12 grid h-14 w-14 place-items-center rounded-full border font-mono text-[0.8125rem]">MS</span>
      </div>
      <div className="border-line bg-raised w-full max-w-sm rounded-[16px] border p-4">
        <div className="flex items-center justify-between gap-3">
          <span>
            <span className="text-fg block text-[0.9375rem] font-semibold">Maya Sleiman</span>
            <span className="text-fg-2 flex items-center gap-1 text-[0.75rem]">
              <MapPin className="h-3 w-3" aria-hidden />
              {c.name} · {c.location}
            </span>
          </span>
          <motion.span layout className={cn('btn btn-sm', sent ? 'btn-connect' : 'btn-primary')}>
            {sent ? <Check className="h-3.5 w-3.5" aria-hidden /> : <UserPlus className="h-3.5 w-3.5" aria-hidden />}
            {sent ? 'Request sent' : 'Connect'}
          </motion.span>
        </div>
        <p className="border-line text-fg-2 mt-3 border-t pt-3 text-[0.8125rem]">“Both running hospital pilots — would love to compare notes.”</p>
      </div>
    </div>
  )
}

function MessageScene() {
  const msgs = [
    { me: false, text: 'Hi Lina — happy to compare notes on procurement.' },
    { me: true, text: 'Great. Could you share what got your pilot signed?' },
    { me: false, text: 'Of course. Free Thursday afternoon?' },
  ]
  return (
    <div className="flex h-full flex-col justify-end gap-2.5">
      {msgs.map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.7, duration: 0.4, ease }} className={cn('max-w-[80%] rounded-[16px] px-4 py-2.5 text-[0.875rem]', m.me ? 'bg-electric/20 border-electric/40 self-end rounded-br-[4px] border' : 'bg-raised border-line self-start rounded-bl-[4px] border')}>
          {m.text}
        </motion.div>
      ))}
      <div className="border-line-strong bg-raised mt-2 flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-4">
        <span className="text-fg-2 flex-1 text-[0.8125rem]">Write a message…</span>
        <span className="bg-lime text-[var(--on-lime)] grid h-8 w-8 place-items-center rounded-full">
          <Send className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </div>
  )
}

export function HubStory() {
  const scene = useAutoCycle(STEPS.length, STEP_MS, { loop: true })
  const calm = useCalm()
  const s = STEPS[scene.index]
  return (
    <Band id="founders-hub">
      <div className="container-site">
        <SectionIntro index="04" eyebrow="Founders Hub" title={<>Meet the people <span className="text-electric">building beside you.</span></>} body="Building a company isn’t only about tools. Founders Hub is where you present your company, find others, connect and talk." />

        <div ref={scene.ref} className="mt-12 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div className="border-line bg-base relative h-[380px] overflow-hidden rounded-[24px] border p-5 sm:h-[360px] sm:p-7">
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-25 blur-[80px]" style={{ background: 'var(--brand-tertiary)' }} aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className="relative h-full">
                {s.id === 'present' && <PresentScene />}
                {s.id === 'discover' && <DiscoverScene />}
                {s.id === 'connect' && <ConnectScene calm={calm} />}
                {s.id === 'message' && <MessageScene />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <SceneSteps steps={STEPS} index={scene.index} onSelect={scene.select} playing={scene.playing} duration={STEP_MS} tone="blue" />
            <div className="mt-6 min-h-[120px]">
              <AnimatePresence mode="wait">
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                  <h3 className="font-display text-[1.25rem] font-semibold">{s.title}</h3>
                  <p className="text-fg-2 mt-2 text-[0.9375rem]">{s.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link to="/app/hub" className="btn btn-connect">
                Browse Founders Hub
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/app/hub/my-company" className="btn btn-quiet">
                Create your company
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Band>
  )
}
