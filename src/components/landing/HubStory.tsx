import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ArrowRight, Check, UserPlus } from 'lucide-react'
import { Band, SceneStatus, SceneSteps, SectionIntro } from './parts'
import { Avatar } from '@/components/ui'
import { useAutoCycle, useCalm } from '@/lib/hooks'
import { companies, founderName, initialsOf, SAMPLE_COMPANY } from '@/lib/data'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'present', label: 'Present', title: 'Present your company', body: 'A guided profile turns what you are building, your stage and what you need into a card other founders can find.' },
  { id: 'discover', label: 'Discover', title: 'Discover founders and companies', body: 'Browse by industry, stage, location and what people are looking for — co-founders, clients, partners or mentors.' },
  { id: 'connect', label: 'Connect', title: 'Connect with intent', body: 'Send a short connection request. They see who you are and why you are reaching out before they accept.' },
  { id: 'message', label: 'Message', title: 'Keep the conversation going', body: 'Messages live next to the company profile, so context never gets lost in another app.' },
]

const STEP_MS = 2250
const ease = [0.22, 1, 0.36, 1] as const

/* Founders who fit Cadence (Healthtech · MVP · Beirut) — the first one is who we connect with. */
const FOUNDERS = [
  { c: companies.find((x) => x.slug === 'ostraka')!, why: 'Healthtech · Beirut' },
  { c: companies.find((x) => x.slug === 'vessel')!, why: 'MVP · Beirut' },
  { c: companies.find((x) => x.slug === 'fold')!, why: 'MVP · also early' },
]
const MATCH = FOUNDERS[0].c
const MATCH_PERSON = founderName(MATCH)

/** Runs a short in-step beat (e.g. form → card) each time a step is entered. */
function useBeat(active: boolean, ms: number, calm: boolean) {
  const [on, setOn] = useState(calm)
  useEffect(() => {
    if (!active) return
    if (calm) return setOn(true)
    setOn(false)
    const id = window.setTimeout(() => setOn(true), ms)
    return () => window.clearTimeout(id)
  }, [active, ms, calm])
  return on || calm
}

function YouCard() {
  return (
    <motion.div layoutId="p5-hub-you" transition={{ layout: { duration: 0.6, ease } }} className="border-lime/45 bg-raised glow-lime rounded-[16px] border p-4">
      <motion.div layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.25 }}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2.5">
            <span className="border-lime/40 text-lime bg-lime/10 grid h-9 w-9 place-items-center rounded-[9px] border font-mono text-[0.6875rem]">CD</span>
            <span>
              <span className="text-fg font-display block text-[1rem] font-semibold">{SAMPLE_COMPANY.name}</span>
              <span className="text-fg-2 block text-[0.6875rem]">
                {SAMPLE_COMPANY.stage} · {SAMPLE_COMPANY.industry}
              </span>
            </span>
          </span>
          <span className="text-lime font-mono text-[0.5625rem] tracking-widest uppercase">Public card</span>
        </div>
        <p className="text-fg-2 mt-2.5 line-clamp-2 text-[0.8125rem]">{SAMPLE_COMPANY.short}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLE_COMPANY.lookingFor.map((l) => (
            <span key={l} className="border-electric/40 text-fg rounded-full border px-2 py-0.5 text-[0.6875rem]">
              {l}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function CompanyForm() {
  const rows = [
    ['Company name', SAMPLE_COMPANY.name],
    ['One-line description', SAMPLE_COMPANY.short],
    ['Stage · Industry', `${SAMPLE_COMPANY.stage} · ${SAMPLE_COMPANY.industry}`],
    ['Looking for', SAMPLE_COMPANY.lookingFor.join(', ')],
  ]
  return (
    <motion.div layoutId="p5-hub-you" className="border-line bg-raised flex flex-col gap-2 rounded-[16px] border p-4">
      {rows.map(([k, v], i) => (
        <motion.div key={k} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.2, duration: 0.35, ease }}>
          <p className="text-fg-2 text-[0.625rem]">{k}</p>
          <p className="border-line-strong bg-base text-fg mt-0.5 truncate rounded-[8px] border px-2.5 py-1.5 text-[0.75rem]">{v}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

function FounderCard({ f, index, step, connected }: { f: (typeof FOUNDERS)[number]; index: number; step: number; connected: 'none' | 'sent' | 'yes' }) {
  const match = index === 0
  const person = founderName(f.c)
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: step >= 2 && !match ? 0.4 : 1, x: 0 }}
      transition={{ duration: 0.45, ease, delay: step === 1 ? 0.15 + index * 0.14 : 0 }}
      className={cn('bg-raised rounded-[14px] border p-3', match && step >= 1 ? 'border-electric/55 glow-blue' : 'border-line', index === 2 && 'max-sm:hidden')}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar initials={initialsOf(person)} size="sm" accent={f.c.accent} />
        <span className="min-w-0">
          <span className="text-fg block truncate text-[0.8125rem] font-semibold">{person}</span>
          <span className="text-fg-2 block truncate text-[0.6875rem]">
            {f.c.name} · {f.why}
          </span>
        </span>
      </div>
      {match && (
        <div className="border-line mt-2.5 flex items-center justify-between gap-2 border-t pt-2.5">
          <span className="text-electric font-mono text-[0.5625rem] tracking-widest uppercase">Fits Cadence</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={connected}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn('btn btn-sm shrink-0 !px-2.5', connected === 'none' ? 'btn-primary' : 'btn-connect')}
            >
              {connected === 'none' ? <UserPlus className="h-3.5 w-3.5" aria-hidden /> : <Check className="h-3.5 w-3.5" aria-hidden />}
              {connected === 'none' ? 'Connect' : connected === 'sent' ? 'Request sent' : 'Connected'}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

/** The link between the two cards: horizontal beside, vertical when stacked. */
function Link2({ on, calm }: { on: boolean; calm: boolean }) {
  return (
    <div className="flex h-8 items-center justify-center sm:h-auto sm:pt-7" aria-hidden>
      <svg viewBox="0 0 56 8" className="hidden w-full sm:block" preserveAspectRatio="none">
        <line x1="2" y1="4" x2="54" y2="4" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="3 4" />
        <motion.line
          x1="2"
          y1="4"
          x2="54"
          y2="4"
          stroke="var(--brand-tertiary)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={{ duration: calm ? 0 : 0.7, ease }}
        />
      </svg>
      <svg viewBox="0 0 8 32" className="h-full sm:hidden">
        <line x1="4" y1="2" x2="4" y2="30" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="3 4" />
        <motion.line
          x1="4"
          y1="2"
          x2="4"
          y2="30"
          stroke="var(--brand-tertiary)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={{ duration: calm ? 0 : 0.7, ease }}
        />
      </svg>
    </div>
  )
}

function MessagePreview() {
  const msgs = [
    { me: true, text: 'Both running hospital pilots — could we compare notes?' },
    { me: false, text: 'Happy to. Thursday afternoon works.' },
  ]
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="border-line bg-raised flex h-full flex-col rounded-[16px] border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-fg-2 text-[0.6875rem]">Message preview · {MATCH_PERSON}</span>
        <span className="border-line-strong text-fg-2 rounded-full border px-2 py-0.5 font-mono text-[0.5625rem] tracking-widest uppercase">Illustration</span>
      </div>
      <div className="mt-2 flex flex-1 flex-col justify-end gap-1.5">
        {msgs.map((m, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.7, duration: 0.35, ease }}
            className={cn('max-w-[80%] rounded-[14px] px-3 py-1.5 text-[0.75rem]', m.me ? 'bg-electric/20 border-electric/40 self-end rounded-br-[4px] border' : 'bg-base border-line self-start rounded-bl-[4px] border')}
          >
            {m.text}
          </motion.p>
        ))}
      </div>
    </motion.div>
  )
}

function HubScene({ step, calm }: { step: number; calm: boolean }) {
  const formed = useBeat(step === 0, 1300, calm)
  const accepted = useBeat(step === 2, 1300, calm)
  const connected: 'none' | 'sent' | 'yes' = step < 2 ? 'none' : step === 2 && !accepted ? 'sent' : 'yes'
  return (
    <LayoutGroup id="p5-hub">
      <div className="grid gap-0 sm:grid-cols-[1fr_56px_1fr] sm:items-start">
        <div>
          <p className="eyebrow mb-2 !text-[0.5625rem]">You</p>
          {step === 0 && !formed ? <CompanyForm /> : <YouCard />}
        </div>
        <Link2 on={step >= 2} calm={calm} />
        <div>
          <p className="eyebrow mb-2 !text-[0.5625rem]">{step >= 1 ? 'Founders who fit' : 'Founders Hub'}</p>
          <div className="flex flex-col gap-2">
            {step >= 1
              ? FOUNDERS.map((f, i) => <FounderCard key={f.c.slug} f={f} index={i} step={step} connected={connected} />)
              : [0, 1, 2].map((i) => <div key={i} className={cn('border-line-strong h-[58px] rounded-[14px] border border-dashed opacity-50', i === 2 && 'max-sm:hidden')} aria-hidden />)}
          </div>
        </div>
      </div>
      <div className="mt-4 h-[116px]">
        {step >= 3 ? (
          <MessagePreview />
        ) : (
          <div className="border-line-strong text-fg-2 grid h-full place-items-center rounded-[16px] border border-dashed text-[0.75rem] opacity-60">Conversations start once you connect</div>
        )}
      </div>
    </LayoutGroup>
  )
}

export function HubStory() {
  const scene = useAutoCycle(STEPS.length, STEP_MS, { calmIndex: STEPS.length - 1 })
  const calm = useCalm()
  const s = STEPS[scene.index]
  return (
    <Band id="founders-hub">
      <div className="container-site">
        <SectionIntro
          index="04"
          eyebrow="Founders Hub"
          title={
            <>
              Meet the people <span className="text-electric">building beside you.</span>
            </>
          }
          body="Building a company isn’t only about tools. Founders Hub is where you present your company, find others, connect and talk."
        />

        <div ref={scene.ref} className="mt-12 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div className="border-line bg-base relative overflow-hidden rounded-[24px] border p-4 sm:p-6" role="img" aria-label={`Founders Hub illustration: ${s.title}`}>
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-25 blur-[80px]" style={{ background: 'var(--brand-tertiary)' }} aria-hidden />
            <div className="relative">
              <HubScene step={scene.index} calm={calm} />
            </div>
          </div>

          <div>
            <SceneSteps steps={STEPS} index={scene.index} onSelect={scene.select} advancing={scene.advancing} duration={STEP_MS} tone="blue" label="Founders Hub story" />
            <SceneStatus advancing={scene.advancing} manual={scene.manual} calm={scene.calm} onReplay={scene.replay} step={scene.index + 1} total={STEPS.length} className="mt-4" />
            <div className="mt-4 min-h-[120px]">
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
