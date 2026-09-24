import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, FlaskConical, LayoutGrid, Target, Users } from 'lucide-react'
import { Field, Logo } from '@/components/ui'
import { INDUSTRY_OPTIONS, INTEREST_OPTIONS, STAGES, type Stage } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const STEPS = ['Account', 'About you', 'Ready']
const ROLES = ['Founder with a company', 'Founder with an idea', 'Exploring starting something', 'Supporting founders']

export default function Register() {
  const { loadScenario } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [role, setRole] = useState('')
  const [stage, setStage] = useState<Stage | ''>('')
  const [sector, setSector] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const next = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (name.trim().length < 2) e.name = 'Enter your full name.'
      if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address.'
      if (password.length < 8) e.password = 'Use at least 8 characters.'
      if (!agree) e.agree = 'Please confirm to continue.'
    }
    if (step === 1 && !role) e.role = 'Choose the option closest to you.'
    setErrors(e)
    if (Object.keys(e).length) return
    if (step === 1) {
      setPassword('') // never kept — this is a prototype
      loadScenario('new', { name: name.trim(), email: email.trim(), stage, sector, interests })
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="bg-base min-h-dvh">
      <div className="grid min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
        {/* form side */}
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="Spryve home">
              <Logo />
            </Link>
            <Link to="/sign-in" className="text-fg-2 hover:text-fg text-[0.875rem]">
              Already have an account? <span className="text-fg underline underline-offset-4">Sign in</span>
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center py-12">
            <ol className="mb-8 flex items-center gap-3" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className={cn('grid h-7 w-7 place-items-center rounded-full border font-mono text-[0.6875rem]', i < step ? 'bg-lime border-lime text-[var(--on-lime)]' : i === step ? 'border-lime text-lime' : 'border-line-strong text-fg-2')} aria-current={i === step ? 'step' : undefined}>
                    {i < step ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                  </span>
                  <span className={cn('text-[0.8125rem]', i === step ? 'text-fg' : 'text-fg-2', 'max-sm:hidden')}>{s}</span>
                  {i < STEPS.length - 1 && <span className="bg-fg/15 h-px w-6 sm:w-10" aria-hidden />}
                </li>
              ))}
            </ol>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                {step === 0 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      next()
                    }}
                    noValidate
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h1 className="t-page">Create your Spryve account</h1>
                      <p className="text-fg-2 mt-2">Free to join. Your dashboard is shaped by the next step.</p>
                    </div>
                    <Field label="Full name" required error={errors.name} htmlFor="r-name">
                      <input id="r-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
                    </Field>
                    <Field label="Email" required error={errors.email} htmlFor="r-email">
                      <input id="r-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} />
                    </Field>
                    <Field label="Password" required hint="Preview only — please don’t use a real password. It is discarded and never stored." error={errors.password} htmlFor="r-pass">
                      <input id="r-pass" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
                    </Field>
                    <label className="flex items-start gap-3 text-[0.875rem]">
                      <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-[var(--brand-tertiary)] mt-1 h-4 w-4" />
                      <span className="text-fg-2">I agree to the Terms and Privacy Policy <span className="text-fg-2/80">(placeholders in this preview)</span>.</span>
                    </label>
                    {errors.agree && <p className="-mt-3 text-[0.8125rem] text-[#ff9a8e]">{errors.agree}</p>}
                    <button type="submit" className="btn btn-primary mt-1">
                      Continue
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  </form>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h1 className="t-page">Tell us where you are</h1>
                      <p className="text-fg-2 mt-2">This decides what your dashboard shows first. You can change it any time in your profile.</p>
                    </div>
                    <Field label="Which describes you best?" required error={errors.role}>
                      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Role">
                        {ROLES.map((r) => (
                          <button key={r} type="button" role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={cn('rounded-[12px] border px-3.5 py-3 text-left text-[0.875rem] transition-colors', role === r ? 'border-electric/60 bg-electric/14 text-fg' : 'border-line text-fg-2 hover:text-fg')}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Stage" htmlFor="r-stage">
                        <select id="r-stage" className="input" value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
                          <option value="">Choose a stage</option>
                          {STAGES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Sector" htmlFor="r-sector">
                        <select id="r-sector" className="input" value={sector} onChange={(e) => setSector(e.target.value)}>
                          <option value="">Choose a sector</option>
                          {INDUSTRY_OPTIONS.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="What are you interested in?">
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_OPTIONS.map((o) => (
                          <button key={o} type="button" aria-pressed={interests.includes(o)} onClick={() => setInterests((x) => (x.includes(o) ? x.filter((y) => y !== o) : [...x, o]))} className="chip">
                            {interests.includes(o) && <Check className="h-3.5 w-3.5" aria-hidden />}
                            {o}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => setStep(0)} className="btn btn-quiet">
                        <ArrowLeft className="h-4 w-4" aria-hidden />
                        Back
                      </button>
                      <button type="button" onClick={next} className="btn btn-primary">
                        Create account
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col items-start gap-5">
                    <span className="bg-lime/12 text-lime grid h-12 w-12 place-items-center rounded-full">
                      <Check className="h-6 w-6" aria-hidden />
                    </span>
                    <h1 className="t-page">Welcome, {name.split(' ')[0]}.</h1>
                    <p className="text-fg-2">
                      Your preview workspace is ready. It starts empty — no saved items, no company yet — so you can see exactly what a new founder sees.
                    </p>
                    <div className="well w-full px-4 py-3 text-[0.8125rem]">
                      <p className="text-fg flex items-center gap-2 font-medium">
                        <FlaskConical className="text-electric h-4 w-4" aria-hidden />
                        No real account was created
                      </p>
                      <p className="text-fg-2 mt-1">Your name and choices are kept only in this browser to demonstrate the flow. Nothing was sent to a server.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/app')} className="btn btn-primary">
                      Go to your dashboard
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-fg-2 text-center text-[0.75rem]">Prototype registration · separate from real authentication</p>
        </div>

        {/* explainer side */}
        <aside className="bg-raised border-line relative hidden overflow-hidden border-l lg:flex lg:flex-col lg:justify-center lg:px-14">
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full opacity-30 blur-[100px]" style={{ background: 'var(--brand-tertiary)' }} aria-hidden />
          <p className="eyebrow mb-6">What you get</p>
          <ul className="relative flex flex-col gap-7">
            {[
              { icon: LayoutGrid, title: 'A dashboard with next steps', body: 'What to do this week, and the opportunities, people and learning around it.' },
              { icon: Users, title: 'Founders Hub', body: 'Present your company, find other founders, connect and message.' },
              { icon: Target, title: 'Directories that point to the source', body: 'Accelerators, incubators, funding opportunities, events and services — with links to each provider.' },
            ].map((x) => (
              <li key={x.title} className="flex gap-4">
                <span className="border-line bg-base text-lime grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border">
                  <x.icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span>
                  <span className="font-display text-fg block font-semibold">{x.title}</span>
                  <span className="text-fg-2 mt-1 block text-[0.9375rem]">{x.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
