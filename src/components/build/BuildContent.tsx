import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, CircleCheck, Hand, Scale, Sparkles } from 'lucide-react'
import { BuildProcess } from './BuildProcess'
import { Field, SampleNote } from '@/components/ui'
import { useToast } from '@/components/ui/feedback'
import { BUILD_HELP_OPTIONS, BUILD_SERVICES, BUILD_STAGE_OPTIONS } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function ServicesIndex() {
  const [active, setActive] = useState(0)
  const s = BUILD_SERVICES[active]
  return (
    <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
      <ul className="flex flex-col gap-1" role="tablist" aria-label="Services" aria-orientation="vertical">
        {BUILD_SERVICES.map((x, i) => (
          <li key={x.id}>
            <button
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn('flex w-full items-center justify-between rounded-[12px] px-4 py-3 text-left text-[0.9375rem] transition-colors', i === active ? 'bg-raised text-fg border-lime/40 border' : 'text-fg-2 hover:text-fg border border-transparent')}
            >
              {x.label}
              <ArrowRight className={cn('h-4 w-4 transition-opacity', i === active ? 'text-lime opacity-100' : 'opacity-0')} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <div className="card min-h-[240px] p-6" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <h3 className="font-display text-[1.25rem] font-semibold">{s.label}</h3>
            <p className="text-fg-2 mt-2">{s.body}</p>
            <p className="eyebrow mt-6 mb-3">Typically includes</p>
            <ul className="flex flex-col gap-2">
              {s.includes.map((inc) => (
                <li key={inc} className="flex items-center gap-2.5 text-[0.9375rem]">
                  <Check className="text-lime h-4 w-4 shrink-0" aria-hidden />
                  {inc}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function RequestForm({ inApp }: { inApp: boolean }) {
  const { state, addBuildRequest } = useStore()
  const toast = useToast()
  const [help, setHelp] = useState<string[]>([])
  const [stage, setStage] = useState('')
  const [summary, setSummary] = useState('')
  const [name, setName] = useState(inApp ? state.profile.name : '')
  const [email, setEmail] = useState(inApp ? state.profile.email : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (help.length === 0) errs.help = 'Pick at least one thing you’d like help with.'
    if (!stage) errs.stage = 'Choose where you are right now.'
    if (summary.trim().length < 15) errs.summary = 'A sentence or two is enough, but we need a little context.'
    if (!inApp && !name.trim()) errs.name = 'Your name is required.'
    if (!inApp && !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email address.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    addBuildRequest({ help, stage, summary })
    setSent(true)
    toast('Build request saved in this preview.')
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center px-6 py-12 text-center">
        <CircleCheck className="text-lime h-10 w-10" aria-hidden />
        <h3 className="font-display mt-4 text-[1.25rem] font-semibold">Request received (preview)</h3>
        <p className="text-fg-2 mt-2 max-w-[48ch]">
          In the live product, the Spryve Build team would reply to arrange a first conversation. In this preview nothing was sent — the request is
          stored only in your browser.
        </p>
        <button type="button" className="btn btn-secondary mt-6" onClick={() => { setSent(false); setHelp([]); setStage(''); setSummary('') }}>
          Start another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="card flex flex-col gap-6 p-6 sm:p-8">
      <Field label="What would you like help with?" required error={errors.help}>
        <div className="flex flex-wrap gap-2">
          {BUILD_HELP_OPTIONS.map((o) => (
            <button key={o} type="button" aria-pressed={help.includes(o)} onClick={() => setHelp((h) => (h.includes(o) ? h.filter((x) => x !== o) : [...h, o]))} className="chip">
              {help.includes(o) && <Check className="h-3.5 w-3.5" aria-hidden />}
              {o}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Where are you right now?" required error={errors.stage}>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Current stage">
          {BUILD_STAGE_OPTIONS.map((o) => (
            <button key={o} type="button" role="radio" aria-checked={stage === o} onClick={() => setStage(o)} className={cn('rounded-[12px] border px-3 py-2.5 text-left text-[0.875rem] transition-colors', stage === o ? 'border-electric/60 bg-electric/14 text-fg' : 'border-line text-fg-2 hover:text-fg')}>
              {o}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Tell us briefly what you have in mind" required error={errors.summary} htmlFor="build-summary">
        <textarea id="build-summary" className="input min-h-[110px]" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What you’re building, who it’s for, and what you’d like to have at the end." aria-invalid={Boolean(errors.summary)} />
      </Field>
      {!inApp && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" required error={errors.name} htmlFor="build-name">
            <input id="build-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
          </Field>
          <Field label="Email" required error={errors.email} htmlFor="build-email">
            <input id="build-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} />
          </Field>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SampleNote>Prototype form — nothing is sent. Pricing is scoped with you after a first conversation; none is shown here.</SampleNote>
        <button type="submit" className="btn btn-primary shrink-0">
          Send request
        </button>
      </div>
    </form>
  )
}

export function BuildContent({ inApp = false }: { inApp?: boolean }) {
  const { state } = useStore()
  const expect = [
    { icon: Hand, title: 'Optional', body: 'Build is a separate service you can ask for. Spryve’s dashboard, Hub and directories work without it.' },
    { icon: Sparkles, title: 'Scoped with you', body: 'We agree what to build first before any design or development starts. Nothing is built automatically.' },
    { icon: Scale, title: 'Pricing after a conversation', body: 'Every project is different, so there are no fixed packages or published prices in this preview.' },
  ]
  return (
    <div className="flex flex-col gap-20">
      <section>
        <p className="eyebrow mb-4 flex items-center gap-2">
          <span className="bg-lime h-1.5 w-1.5 rounded-full" aria-hidden />
          Spryve Build · optional service
        </p>
        <h1 className={cn(inApp ? 't-page !text-[clamp(1.75rem,3vw,2.4rem)]' : 't-hero', 'max-w-[18ch]')}>
          From idea to a working <span className="text-lime">digital experience.</span>
        </h1>
        <p className="lede mt-5">
          Hands-on help from the Spryve team to refine an idea, then design or develop a website, prototype or product — in clear steps, with you
          deciding what happens next.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#build-request" className="btn btn-primary">
            Start a Build request
          </a>
          <a href="#build-process" className="btn btn-secondary">
            See how it works
          </a>
        </div>
      </section>

      <section aria-labelledby="build-help">
        <h2 id="build-help" className="t-section !text-[clamp(1.5rem,2.4vw,2rem)]">
          What we can help with
        </h2>
        <p className="text-fg-2 mt-2 mb-8 max-w-[60ch]">Pick one to see what it usually involves.</p>
        <ServicesIndex />
      </section>

      <section id="build-process" className="scroll-mt-24" aria-labelledby="build-how">
        <h2 id="build-how" className="t-section !text-[clamp(1.5rem,2.4vw,2rem)]">
          How a project moves
        </h2>
        <p className="text-fg-2 mt-2 mb-8 max-w-[60ch]">Idea, shape, design, develop, launch. Each stage ends with something you can see and approve.</p>
        <div className="border-line bg-raised rounded-[24px] border p-5 sm:p-8">
          <BuildProcess detailed />
        </div>
      </section>

      <section aria-labelledby="build-expect">
        <h2 id="build-expect" className="sr-only">
          What to expect
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {expect.map((e) => (
            <div key={e.title} className="card p-6">
              <e.icon className="text-electric h-5 w-5" aria-hidden />
              <h3 className="font-display mt-4 text-[1.0625rem] font-semibold">{e.title}</h3>
              <p className="text-fg-2 mt-2 text-[0.9375rem]">{e.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="build-request" className="scroll-mt-24" aria-labelledby="build-form">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="build-form" className="t-section !text-[clamp(1.5rem,2.4vw,2rem)]">
              Start a Build request
            </h2>
            <p className="text-fg-2 mt-3">Tell us where you are. The team replies to set up a first conversation — no commitment.</p>
            {inApp && state.buildRequests.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow mb-3">Your requests</p>
                <ul className="flex flex-col gap-2">
                  {state.buildRequests.map((r) => (
                    <li key={r.id} className="well px-4 py-3">
                      <p className="text-fg text-[0.875rem] font-medium">{r.help.join(', ')}</p>
                      <p className="text-fg-2 text-[0.8125rem]">
                        {r.stage} · Awaiting reply (preview)
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <RequestForm inApp={inApp} />
        </div>
      </section>
    </div>
  )
}
