import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, CloudUpload, ImagePlus, Plus, Sparkles, Trash2 } from 'lucide-react'
import { CompanyMark, Field, SampleNote, StageTag } from '@/components/ui'
import { useToast } from '@/components/ui/feedback'
import {
  CAN_HELP_WITH_OPTIONS,
  COMPANY_TYPES,
  INDUSTRY_OPTIONS,
  LOOKING_FOR_OPTIONS,
  SAMPLE_COMPANY,
  STAGES,
  TEAM_SIZES,
  VISIBILITY_OPTIONS,
  initialsOf,
  type Company,
  type Founder,
  type Stage,
} from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/* Draft — mirrors the fields the current Spryve company form asks for.         */
/* -------------------------------------------------------------------------- */

interface Draft {
  name: string
  short: string
  about: string
  industry: string
  subIndustry: string
  stage: Stage | ''
  location: string
  teamSize: string
  founded: string
  founders: Founder[]
  companyType: Company['companyType'] | ''
  products: { title: string; description: string }[]
  lookingFor: string[]
  canHelpWith: string[]
  website: string
  linkedin: string
  visibility: Company['visibility']
}

const DRAFT_KEY = 'spryve.p5.companyDraft'
const MAX_PRODUCT_DESC = 300

const STEPS = [
  { id: 'basics', label: 'Basics', blurb: 'What the company is called, what it does and where it stands.' },
  { id: 'founders', label: 'Founders', blurb: 'Who is behind it. Emails stay private.' },
  { id: 'products', label: 'Products & services', blurb: 'What you offer — at least one product or service.' },
  { id: 'needs', label: 'Needs', blurb: 'What you’re looking for, and how you can help others.' },
  { id: 'links', label: 'Links & visibility', blurb: 'Where people can learn more, and who can see the profile.' },
  { id: 'review', label: 'Review', blurb: 'Check everything, then publish.' },
] as const
type StepId = (typeof STEPS)[number]['id']
type Errors = Record<string, string>

function emptyDraft(founderName: string, email: string): Draft {
  const [first = '', ...rest] = founderName.split(' ')
  return {
    name: '',
    short: '',
    about: '',
    industry: '',
    subIndustry: '',
    stage: '',
    location: '',
    teamSize: '',
    founded: '',
    founders: [{ firstName: first, familyName: rest.join(' '), position: 'Founder', email, linkedin: '' }],
    companyType: '',
    products: [{ title: '', description: '' }],
    lookingFor: [],
    canHelpWith: [],
    website: '',
    linkedin: '',
    visibility: 'Visible to members',
  }
}

const fromCompany = (c: Company): Draft => ({
  name: c.name,
  short: c.short,
  about: c.about,
  industry: c.industry,
  subIndustry: c.subIndustry,
  stage: c.stage,
  location: c.location,
  teamSize: c.teamSize,
  founded: c.founded,
  founders: c.founders.map((f) => ({ ...f, email: f.email ?? '', linkedin: f.linkedin ?? '' })),
  companyType: c.companyType,
  products: c.products.map((p) => ({ ...p })),
  lookingFor: [...c.lookingFor],
  canHelpWith: [...c.canHelpWith],
  website: c.website ?? '',
  linkedin: c.linkedin ?? '',
  visibility: c.visibility,
})

const isUrl = (v: string) => /^https?:\/\/\S+\.\S+/.test(v.trim())
const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim())

function validate(step: StepId, d: Draft): Errors {
  const e: Errors = {}
  if (step === 'basics') {
    if (d.name.trim().length < 2) e.name = 'Company name needs at least 2 characters.'
    if (d.short.trim().length < 20) e.short = 'Write at least 20 characters — this is the first line people read.'
    if (d.about.trim().length < 80) e.about = `A little more, please: ${Math.max(0, 80 - d.about.trim().length)} more characters.`
    if (!d.industry) e.industry = 'Choose an industry.'
    if (!d.subIndustry.trim()) e.subIndustry = 'Add a sub-industry.'
    if (!d.stage) e.stage = 'Choose the stage that fits best.'
  }
  if (step === 'founders') {
    if (d.founders.length === 0) e.founders = 'Add at least one founder.'
    d.founders.forEach((f, i) => {
      if (!f.firstName.trim() || !f.familyName.trim() || !f.position.trim()) e[`founder${i}`] = 'First name, family name and position are required.'
      else if (!isEmail(f.email ?? '')) e[`founder${i}`] = 'Add a valid email (kept private).'
    })
  }
  if (step === 'products') {
    if (!d.companyType) e.companyType = 'Choose what kind of company this is.'
    if (d.products.length === 0) e.products = 'Add at least one product or service.'
    d.products.forEach((p, i) => {
      if (!p.title.trim() || !p.description.trim()) e[`product${i}`] = 'Each product needs a title and a description.'
      else if (p.description.length > MAX_PRODUCT_DESC) e[`product${i}`] = `Keep descriptions under ${MAX_PRODUCT_DESC} characters.`
    })
  }
  if (step === 'links') {
    if (d.website.trim() && !isUrl(d.website)) e.website = 'Include the full address, starting with https://'
    if (d.linkedin.trim() && !isUrl(d.linkedin)) e.linkedin = 'Include the full address, starting with https://'
  }
  return e
}

/* -------------------------------------------------------------------------- */

function Checkboxes({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value.includes(o)} onClick={() => onToggle(o)} className="chip">
          {value.includes(o) && <Check className="h-3.5 w-3.5" aria-hidden />}
          {o}
        </button>
      ))}
    </div>
  )
}

function PreviewCard({ d }: { d: Draft }) {
  const name = d.name.trim() || 'Your company'
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <CompanyMark mark={initialsOf(name) || 'YC'} accent="lime" />
        {d.stage && <StageTag stage={d.stage} />}
      </div>
      <p className="font-display mt-4 text-[1.0625rem] font-semibold">{name}</p>
      <p className="text-fg-2 mt-1.5 line-clamp-3 text-[0.8125rem]">{d.short.trim() || 'Your one-line description appears here.'}</p>
      {(d.industry || d.location) && <p className="text-fg-2 mt-3 text-[0.75rem]">{[d.industry, d.location].filter(Boolean).join(' · ')}</p>}
      {d.lookingFor.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.lookingFor.slice(0, 3).map((l) => (
            <span key={l} className="border-electric/35 rounded-full border px-2 py-0.5 text-[0.6875rem]">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CompanyForm({ mode }: { mode: 'create' | 'edit' }) {
  const { state, saveCompany } = useStore()
  const toast = useToast()
  const navigate = useNavigate()

  const initial = useMemo<Draft>(() => {
    if (mode === 'edit' && state.company) return fromCompany(state.company)
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) return JSON.parse(raw) as Draft
    } catch {
      /* ignore */
    }
    return emptyDraft(state.profile.name, state.profile.email)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [d, setD] = useState<Draft>(initial)
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const step = STEPS[stepIndex]

  /* Local autosave for new profiles — a closed tab shouldn't cost ten minutes. */
  useEffect(() => {
    if (mode !== 'create' || !d.name.trim()) return
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
        setSavedAt(new Date())
      } catch {
        /* ignore */
      }
    }, 500)
    return () => window.clearTimeout(id)
  }, [d, mode])

  if (mode === 'edit' && !state.company) {
    return (
      <div className="py-10 text-center">
        <p className="text-fg">There’s no company to edit yet.</p>
        <Link to="/app/hub/my-company/new" className="btn btn-primary btn-sm mt-4">
          Create your company
        </Link>
      </div>
    )
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((x) => ({ ...x, [k]: v }))
    setErrors((e) => (e[k as string] ? { ...e, [k]: '' } : e))
  }
  const toggleIn = (k: 'lookingFor' | 'canHelpWith', v: string) => set(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v])

  const next = () => {
    const e = validate(step.id, d)
    setErrors(e)
    if (Object.values(e).some(Boolean)) return
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const publish = () => {
    for (let i = 0; i < STEPS.length; i++) {
      const e = validate(STEPS[i].id, d)
      if (Object.values(e).some(Boolean)) {
        setErrors(e)
        setStepIndex(i)
        return
      }
    }
    const slug = d.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'my-company'
    saveCompany({
      slug,
      name: d.name.trim(),
      mark: initialsOf(d.name) || 'YC',
      companyType: d.companyType as Company['companyType'],
      industry: d.industry,
      subIndustry: d.subIndustry.trim(),
      stage: d.stage as Stage,
      location: d.location.trim(),
      teamSize: d.teamSize,
      founded: d.founded,
      short: d.short.trim(),
      about: d.about.trim(),
      founders: d.founders,
      products: d.products,
      lookingFor: d.lookingFor,
      canHelpWith: d.canHelpWith,
      website: d.website.trim(),
      linkedin: d.linkedin.trim(),
      visibility: d.visibility,
      accent: 'lime',
    })
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
    toast(mode === 'create' ? 'Company published — preview only, nothing was sent.' : 'Changes saved.')
    navigate('/app/hub/my-company')
  }

  const checklist = STEPS.slice(0, 5).map((s) => ({ ...s, ok: !Object.values(validate(s.id, d)).some(Boolean) && (s.id !== 'needs' || d.lookingFor.length > 0) }))

  return (
    <div className="flex flex-col gap-6">
      <Link to="/app/hub/my-company" className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 self-start text-[0.875rem]">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        My company
      </Link>

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Founders Hub</p>
          <h1 className="t-page">{mode === 'create' ? 'Create your company' : 'Edit company'}</h1>
          <p className="text-fg-2 mt-2">{step.blurb}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {savedAt && mode === 'create' && (
            <span className="text-fg-2 inline-flex items-center gap-1.5 text-[0.75rem]">
              <CloudUpload className="h-3.5 w-3.5" aria-hidden />
              Draft saved in this browser {savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          {mode === 'create' && (
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                setD({ ...fromCompany(SAMPLE_COMPANY), founders: SAMPLE_COMPANY.founders.map((f) => ({ ...f })) })
                setErrors({})
                toast('Filled with sample details.')
              }}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Fill with sample details
            </button>
          )}
        </div>
      </header>

      {/* progress */}
      <div>
        <div className="bg-fg/10 h-1 overflow-hidden rounded-full">
          <motion.div className="bg-lime h-full rounded-full" animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button type="button" disabled={i > stepIndex && mode === 'create'} onClick={() => setStepIndex(i)} aria-current={i === stepIndex ? 'step' : undefined} className={cn('inline-flex items-center gap-1.5 text-[0.8125rem] font-medium disabled:opacity-50', i === stepIndex ? 'text-fg' : 'text-fg-2 hover:text-fg')}>
                {i < stepIndex ? <Check className="text-lime h-3.5 w-3.5" aria-hidden /> : <span className={cn('h-1.5 w-1.5 rounded-full', i === stepIndex ? 'bg-lime' : 'bg-fg/25')} aria-hidden />}
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {Object.values(errors).some(Boolean) && <p className="mb-5 rounded-[12px] border border-[#ff9a8e]/40 bg-[#ff9a8e]/10 px-4 py-3 text-[0.875rem] text-[#ffc4bc]" role="alert">Some details still need attention — they’re marked below.</p>}

          <AnimatePresence mode="wait">
            <motion.div key={step.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.22 }} className="card flex flex-col gap-6 p-5 sm:p-7">
              {step.id === 'basics' && (
                <>
                  <Field label="Company name" required error={errors.name} htmlFor="c-name">
                    <input id="c-name" className="input" value={d.name} onChange={(e) => set('name', e.target.value)} aria-invalid={Boolean(errors.name)} autoComplete="organization" />
                  </Field>
                  <Field label="One-line description" required hint="What you do, in the words you’d use out loud. At least 20 characters." error={errors.short} htmlFor="c-short">
                    <input id="c-short" className="input" value={d.short} onChange={(e) => set('short', e.target.value)} aria-invalid={Boolean(errors.short)} placeholder="Scheduling that clinical teams actually keep." />
                  </Field>
                  <Field label="About the company" required hint="The problem, and what you do about it. At least 80 characters." error={errors.about} htmlFor="c-about">
                    <textarea id="c-about" className="input min-h-[120px]" value={d.about} onChange={(e) => set('about', e.target.value)} aria-invalid={Boolean(errors.about)} />
                    <span className="text-fg-2 self-end font-mono text-[0.6875rem]">{d.about.trim().length} characters</span>
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Industry" required error={errors.industry} htmlFor="c-ind">
                      <select id="c-ind" className="input" value={d.industry} onChange={(e) => set('industry', e.target.value)} aria-invalid={Boolean(errors.industry)}>
                        <option value="">Choose an industry</option>
                        {INDUSTRY_OPTIONS.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Sub-industry" required error={errors.subIndustry} htmlFor="c-sub">
                      <input id="c-sub" className="input" value={d.subIndustry} onChange={(e) => set('subIndustry', e.target.value)} placeholder="e.g. Clinical operations" aria-invalid={Boolean(errors.subIndustry)} />
                    </Field>
                  </div>
                  <Field label="Stage" required error={errors.stage}>
                    <div className="grid gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Stage">
                      {STAGES.map((s) => (
                        <button key={s} type="button" role="radio" aria-checked={d.stage === s} onClick={() => set('stage', s)} className={cn('rounded-[12px] border px-3 py-2.5 text-[0.875rem] transition-colors', d.stage === s ? 'border-electric/60 bg-electric/14 text-fg' : 'border-line text-fg-2 hover:text-fg')}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Location" htmlFor="c-loc">
                      <input id="c-loc" className="input" value={d.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
                    </Field>
                    <Field label="Team size" htmlFor="c-team">
                      <select id="c-team" className="input" value={d.teamSize} onChange={(e) => set('teamSize', e.target.value)}>
                        <option value="">Choose</option>
                        {TEAM_SIZES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Founded" htmlFor="c-year">
                      <input id="c-year" className="input" inputMode="numeric" value={d.founded} onChange={(e) => set('founded', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2025" />
                    </Field>
                  </div>
                </>
              )}

              {step.id === 'founders' && (
                <>
                  {errors.founders && <p className="text-[0.875rem] text-[#ff9a8e]">{errors.founders}</p>}
                  {d.founders.map((f, i) => (
                    <fieldset key={i} className="well flex flex-col gap-4 p-4">
                      <div className="flex items-center justify-between">
                        <legend className="text-fg text-[0.9375rem] font-medium">Founder {i + 1}</legend>
                        {d.founders.length > 1 && (
                          <button type="button" onClick={() => set('founders', d.founders.filter((_, j) => j !== i))} className="text-fg-2 hover:text-fg inline-flex items-center gap-1 text-[0.8125rem]">
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {(
                          [
                            ['firstName', 'First name', true],
                            ['familyName', 'Family name', true],
                            ['position', 'Position', true],
                            ['email', 'Email (private)', true],
                            ['linkedin', 'LinkedIn', false],
                          ] as const
                        ).map(([k, label, req]) => (
                          <Field key={k} label={label} required={req} htmlFor={`f-${i}-${k}`}>
                            <input
                              id={`f-${i}-${k}`}
                              className="input"
                              value={f[k] ?? ''}
                              type={k === 'email' ? 'email' : 'text'}
                              onChange={(e) => set('founders', d.founders.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))}
                            />
                          </Field>
                        ))}
                      </div>
                      {errors[`founder${i}`] && <p className="text-[0.8125rem] text-[#ff9a8e]">{errors[`founder${i}`]}</p>}
                    </fieldset>
                  ))}
                  <button type="button" onClick={() => set('founders', [...d.founders, { firstName: '', familyName: '', position: '', email: '', linkedin: '' }])} className="btn btn-secondary btn-sm self-start">
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add founder
                  </button>
                  <SampleNote>Founder emails are used for team management only and never appear on the public profile.</SampleNote>
                </>
              )}

              {step.id === 'products' && (
                <>
                  <Field label="Company type" required error={errors.companyType}>
                    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Company type">
                      {COMPANY_TYPES.map((t) => (
                        <button key={t} type="button" role="radio" aria-checked={d.companyType === t} onClick={() => set('companyType', t)} className={cn('rounded-[12px] border px-3 py-2.5 text-left text-[0.875rem] transition-colors', d.companyType === t ? 'border-electric/60 bg-electric/14 text-fg' : 'border-line text-fg-2 hover:text-fg')}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                  {d.products.map((p, i) => (
                    <fieldset key={i} className="well flex flex-col gap-4 p-4">
                      <div className="flex items-center justify-between">
                        <legend className="text-fg text-[0.9375rem] font-medium">Product or service {i + 1}</legend>
                        {d.products.length > 1 && (
                          <button type="button" onClick={() => set('products', d.products.filter((_, j) => j !== i))} className="text-fg-2 hover:text-fg inline-flex items-center gap-1 text-[0.8125rem]">
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Remove
                          </button>
                        )}
                      </div>
                      <Field label="Title" required htmlFor={`p-${i}-t`}>
                        <input id={`p-${i}-t`} className="input" value={p.title} onChange={(e) => set('products', d.products.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                      </Field>
                      <Field label="Description" required htmlFor={`p-${i}-d`}>
                        <textarea id={`p-${i}-d`} className="input min-h-[80px]" value={p.description} onChange={(e) => set('products', d.products.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
                        <span className={cn('self-end font-mono text-[0.6875rem]', p.description.length > MAX_PRODUCT_DESC ? 'text-[#ff9a8e]' : 'text-fg-2')}>
                          {p.description.length}/{MAX_PRODUCT_DESC}
                        </span>
                      </Field>
                      {errors[`product${i}`] && <p className="text-[0.8125rem] text-[#ff9a8e]">{errors[`product${i}`]}</p>}
                    </fieldset>
                  ))}
                  {d.products.length < 6 && (
                    <button type="button" onClick={() => set('products', [...d.products, { title: '', description: '' }])} className="btn btn-secondary btn-sm self-start">
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      Add product or service
                    </button>
                  )}
                </>
              )}

              {step.id === 'needs' && (
                <>
                  <Field label="What are you looking for?" hint="The most useful thing on your profile — it’s how others decide to reach out.">
                    <Checkboxes options={LOOKING_FOR_OPTIONS} value={d.lookingFor} onToggle={(v) => toggleIn('lookingFor', v)} />
                  </Field>
                  <Field label="What can you help others with?" hint="A network only works if it goes both ways.">
                    <Checkboxes options={CAN_HELP_WITH_OPTIONS} value={d.canHelpWith} onToggle={(v) => toggleIn('canHelpWith', v)} />
                  </Field>
                </>
              )}

              {step.id === 'links' && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Website" error={errors.website} htmlFor="c-web">
                      <input id="c-web" className="input" inputMode="url" value={d.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" aria-invalid={Boolean(errors.website)} />
                    </Field>
                    <Field label="LinkedIn" error={errors.linkedin} htmlFor="c-li">
                      <input id="c-li" className="input" inputMode="url" value={d.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/company/…" aria-invalid={Boolean(errors.linkedin)} />
                    </Field>
                  </div>
                  <Field label="Logo and photos">
                    <div className="border-line-strong text-fg-2 flex items-center gap-3 rounded-[12px] border border-dashed px-4 py-4 text-[0.875rem]">
                      <ImagePlus className="h-5 w-5 shrink-0" aria-hidden />
                      Uploads arrive with the backend. Until then your initials are used as the mark.
                    </div>
                  </Field>
                  <Field label="Who can see this profile?" required>
                    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Visibility">
                      {VISIBILITY_OPTIONS.map((v) => (
                        <button key={v} type="button" role="radio" aria-checked={d.visibility === v} onClick={() => set('visibility', v)} className={cn('flex items-center gap-3 rounded-[12px] border px-4 py-3 text-left text-[0.875rem] transition-colors', d.visibility === v ? 'border-electric/60 bg-electric/14 text-fg' : 'border-line text-fg-2 hover:text-fg')}>
                          <span className={cn('grid h-4 w-4 place-items-center rounded-full border', d.visibility === v ? 'border-electric' : 'border-line-strong')}>{d.visibility === v && <span className="bg-electric h-2 w-2 rounded-full" />}</span>
                          {v}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step.id === 'review' && (
                <dl className="flex flex-col">
                  {(
                    [
                      ['Company name', d.name, 0],
                      ['One-line description', d.short, 0],
                      ['Industry', [d.industry, d.subIndustry].filter(Boolean).join(' · '), 0],
                      ['Stage', d.stage, 0],
                      ['Location · team', [d.location, d.teamSize && `${d.teamSize} people`].filter(Boolean).join(' · '), 0],
                      ['Founders', d.founders.map((f) => `${f.firstName} ${f.familyName}`.trim()).filter(Boolean).join(', '), 1],
                      ['Company type', d.companyType, 2],
                      ['Products & services', d.products.map((p) => p.title).filter(Boolean).join(', '), 2],
                      ['Looking for', d.lookingFor.join(', '), 3],
                      ['Can help with', d.canHelpWith.join(', '), 3],
                      ['Website', d.website, 4],
                      ['Visibility', d.visibility, 4],
                    ] as const
                  ).map(([k, v, s]) => (
                    <div key={k} className="border-line flex items-baseline gap-4 border-b py-3 first:border-t">
                      <dt className="text-fg-2 w-36 shrink-0 text-[0.8125rem]">{k}</dt>
                      <dd className={cn('min-w-0 flex-1 text-[0.875rem]', v ? 'text-fg' : 'text-fg-2 italic')}>{v || 'Not provided'}</dd>
                      <button type="button" onClick={() => setStepIndex(s)} className="text-electric shrink-0 text-[0.8125rem] hover:underline">
                        Edit<span className="sr-only"> {k}</span>
                      </button>
                    </div>
                  ))}
                </dl>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0} className="btn btn-quiet disabled:opacity-40">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <div className="flex gap-2">
              {mode === 'edit' && stepIndex < STEPS.length - 1 && (
                <button type="button" onClick={publish} className="btn btn-secondary">
                  Save changes
                </button>
              )}
              {stepIndex < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="btn btn-primary">
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={publish} className="btn btn-primary">
                  {mode === 'create' ? 'Publish profile' : 'Save changes'}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block" aria-label="Preview">
          <div className="sticky top-24 flex flex-col gap-4">
            <p className="eyebrow">Card preview</p>
            <PreviewCard d={d} />
            <div className="card p-4">
              <p className="eyebrow mb-3 !text-[0.625rem]">Checklist</p>
              <ul className="flex flex-col gap-2">
                {checklist.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 text-[0.8125rem]">
                    <span className={cn('grid h-4 w-4 place-items-center rounded-full border', c.ok ? 'bg-lime border-lime text-[var(--on-lime)]' : 'border-line-strong')}>{c.ok && <Check className="h-2.5 w-2.5" aria-hidden />}</span>
                    <span className={c.ok ? 'text-fg-2' : 'text-fg'}>{c.label}</span>
                    {c.id === 'needs' && <span className="text-fg-2 ml-auto text-[0.6875rem]">Optional</span>}
                  </li>
                ))}
              </ul>
            </div>
            <SampleNote>Prototype — publishing stores the profile in this browser only.</SampleNote>
          </div>
        </aside>
      </div>
    </div>
  )
}
