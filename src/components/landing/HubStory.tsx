import { Link } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion, useTransform, type MotionValue } from 'motion/react'
import { ArrowRight, Check, UserPlus } from 'lucide-react'
import { Band, SceneControls, SceneSteps, SectionIntro } from './parts'
import { Avatar } from '@/components/ui'
import { useDriven, useScrollScene } from '@/lib/hooks'
import { companies, founderName, initialsOf, SAMPLE_COMPANY } from '@/lib/data'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'present', label: 'Present', title: 'Present your company', body: 'A guided profile turns what you are building, your stage and what you need into a card other founders can find.' },
  { id: 'discover', label: 'Discover', title: 'Discover founders and companies', body: 'Browse by industry, stage, location and what people are looking for — co-founders, clients, partners or mentors.' },
  { id: 'connect', label: 'Connect', title: 'Connect with intent', body: 'Send a short connection request. They see who you are and why you are reaching out before they accept.' },
  { id: 'message', label: 'Message', title: 'Keep the conversation going', body: 'Messages live next to the company profile, so context never gets lost in another app.' },
]

/*
 * Scroll map (0..1 as the illustration moves up the screen), in eight beats:
 * 0 form · 1 public card · 2 founders who fit · 3 connection draws (with the
 * scroll) · 4 request sent · 5 connected · 6–7 the two preview messages.
 */
const BEATS = [0.12, 0.26, 0.42, 0.58, 0.66, 0.76, 0.88]
const beatFor = (v: number) => BEATS.filter((b) => v >= b).length
const STEP_OF_BEAT = [0, 0, 1, 2, 2, 2, 3, 3]
/* Where each tab lands: the end state of its step. */
const STEP_AT = [0.19, 0.34, 0.71, 0.95]
const ease = [0.22, 1, 0.36, 1] as const

/* Founders who fit Cadence (Healthtech · MVP · Beirut) — the first one is who we connect with. */
const FOUNDERS = [
  { c: companies.find((x) => x.slug === 'ostraka')!, why: 'Healthtech · Beirut' },
  { c: companies.find((x) => x.slug === 'vessel')!, why: 'MVP · Beirut' },
  { c: companies.find((x) => x.slug === 'fold')!, why: 'MVP · also early' },
]
const MATCH = FOUNDERS[0].c
const MATCH_PERSON = founderName(MATCH)

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

function FounderCard({ f, index, sub, connected }: { f: (typeof FOUNDERS)[number]; index: number; sub: number; connected: 'none' | 'sent' | 'yes' }) {
  const match = index === 0
  const person = founderName(f.c)
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: sub >= 3 && !match ? 0.4 : 1, x: 0 }}
      transition={{ duration: 0.4, ease, delay: sub === 2 ? index * 0.08 : 0 }}
      className={cn('bg-raised rounded-[14px] border p-3', match && sub >= 2 ? 'border-electric/55 glow-blue' : 'border-line', index === 2 && 'max-sm:hidden')}
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

/** The link between the two cards (horizontal beside, vertical when stacked) — it draws with the scroll. */
function Link2({ line }: { line: MotionValue<number> }) {
  return (
    <div className="flex h-8 items-center justify-center sm:h-auto sm:pt-7" aria-hidden>
      <svg viewBox="0 0 56 8" className="hidden w-full sm:block" preserveAspectRatio="none">
        <line x1="2" y1="4" x2="54" y2="4" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="3 4" />
        <motion.line x1="2" y1="4" x2="54" y2="4" stroke="var(--brand-tertiary)" strokeWidth="2" strokeLinecap="round" style={{ pathLength: line, opacity: line }} />
      </svg>
      <svg viewBox="0 0 8 32" className="h-full sm:hidden">
        <line x1="4" y1="2" x2="4" y2="30" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="3 4" />
        <motion.line x1="4" y1="2" x2="4" y2="30" stroke="var(--brand-tertiary)" strokeWidth="2" strokeLinecap="round" style={{ pathLength: line, opacity: line }} />
      </svg>
    </div>
  )
}

function MessagePreview({ count }: { count: number }) {
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
        {msgs.slice(0, count).map((m, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className={cn('max-w-[80%] rounded-[14px] px-3 py-1.5 text-[0.75rem]', m.me ? 'bg-electric/20 border-electric/40 self-end rounded-br-[4px] border' : 'bg-base border-line self-start rounded-bl-[4px] border')}
          >
            {m.text}
          </motion.p>
        ))}
      </div>
    </motion.div>
  )
}

function HubScene({ sub, line }: { sub: number; line: MotionValue<number> }) {
  const connected: 'none' | 'sent' | 'yes' = sub < 4 ? 'none' : sub === 4 ? 'sent' : 'yes'
  return (
    <LayoutGroup id="p5-hub">
      <div className="grid gap-0 sm:grid-cols-[1fr_56px_1fr] sm:items-start">
        <div>
          <p className="eyebrow mb-2 !text-[0.5625rem]">You</p>
          {sub === 0 ? <CompanyForm /> : <YouCard />}
        </div>
        <Link2 line={line} />
        <div>
          <p className="eyebrow mb-2 !text-[0.5625rem]">{sub >= 2 ? 'Founders who fit' : 'Founders Hub'}</p>
          <div className="flex flex-col gap-2">
            {sub >= 2
              ? FOUNDERS.map((f, i) => <FounderCard key={f.c.slug} f={f} index={i} sub={sub} connected={connected} />)
              : [0, 1, 2].map((i) => <div key={i} className={cn('border-line-strong h-[58px] rounded-[14px] border border-dashed opacity-50', i === 2 && 'max-sm:hidden')} aria-hidden />)}
          </div>
        </div>
      </div>
      <div className="mt-4 h-[116px]">
        {sub >= 6 ? (
          <MessagePreview count={sub - 5} />
        ) : (
          <div className="border-line-strong text-fg-2 grid h-full place-items-center rounded-[16px] border border-dashed text-[0.75rem] opacity-60">Conversations start once you connect</div>
        )}
      </div>
    </LayoutGroup>
  )
}

export function HubStory() {
  /* From the illustration's top at 80% of the screen to its bottom at 35%: an ordinary scroll, no pinning. */
  const scene = useScrollScene({ start: [0, 0.8], end: [1, 0.35], calmValue: STEP_AT[3] })
  const sub = useDriven(scene.driver, beatFor)
  const line = useTransform(scene.driver, [BEATS[2], BEATS[3]], [0, 1])
  const fill = useTransform(scene.driver, [0, 1], [0, 1])
  const index = STEP_OF_BEAT[sub]
  const s = STEPS[index]
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

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div ref={scene.ref} className="border-line bg-base relative overflow-hidden rounded-[24px] border p-4 sm:p-6" role="img" aria-label={`Founders Hub illustration: ${s.title}`}>
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-25 blur-[80px]" style={{ background: 'var(--brand-tertiary)' }} aria-hidden />
            <div className="relative">
              <HubScene sub={sub} line={line} />
            </div>
          </div>

          <div>
            <SceneSteps steps={STEPS} index={index} onSelect={(i) => scene.goTo(STEP_AT[i], 0)} fill={fill} tone="blue" label="Founders Hub story" />
            <SceneControls calm={scene.calm} onReplay={() => scene.replay(4.5)} className="mt-4" />
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
