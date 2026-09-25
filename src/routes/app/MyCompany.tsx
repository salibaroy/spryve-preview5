import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Building2, Check, ExternalLink, Eye, FileEdit, Lock, Pencil } from 'lucide-react'
import { AreaTabs } from '@/components/app/Listing'
import { Avatar, CompanyMark, Modal, SampleNote, StageTag } from '@/components/ui'
import { useToast } from '@/components/ui/feedback'
import { hubTabs } from './HubOverview'
import { initialsOf, STAGES } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('card p-5 sm:p-6', className)} aria-label={title}>
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="border-line flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0">
      <dt className="text-fg-2 text-[0.8125rem]">{k}</dt>
      <dd className={cn('text-right text-[0.875rem]', v ? 'text-fg' : 'text-fg-2 italic')}>{v || 'Not added'}</dd>
    </div>
  )
}

function NoCompany() {
  const hasDraft = (() => {
    try {
      return Boolean(localStorage.getItem('spryve.p5.companyDraft'))
    } catch {
      return false
    }
  })()
  const steps = ['Basics', 'Founders', 'Products & services', 'Needs', 'Links & visibility', 'Review']
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="card flex flex-col items-start p-6 sm:p-8">
        <span className="border-line-strong text-fg-2 grid h-12 w-12 place-items-center rounded-[12px] border border-dashed">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="font-display mt-5 text-[1.375rem] font-semibold">You haven’t created a company yet</h2>
        <p className="text-fg-2 mt-2 max-w-[52ch]">
          Your company profile is how other founders find you in Founders Hub — what you’re building, your stage, and what you’re looking for. It
          takes about five minutes, and your draft is saved as you go.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/app/hub/my-company/new" className="btn btn-primary">
            {hasDraft ? 'Continue your draft' : 'Create your company'}
          </Link>
          <Link to="/app/hub" className="btn btn-secondary">
            Browse other companies first
          </Link>
        </div>
      </div>
      <div className="card p-6">
        <p className="eyebrow mb-4">What you’ll be asked</p>
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3 text-[0.9375rem]">
              <span className="border-line-strong text-fg-2 grid h-7 w-7 place-items-center rounded-full border font-mono text-[0.6875rem]">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <p className="text-fg-2 mt-5 text-[0.8125rem]">Personal details like your bio and phone live in your own profile, separate from the company.</p>
      </div>
    </div>
  )
}

export default function MyCompany() {
  const { state, unread, saveCompany, removeCompany } = useStore()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  const c = state.company

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2">Founders Hub</p>
        <h1 className="sr-only">My company</h1>
      </div>
      <AreaTabs items={hubTabs(unread)} active="company" />

      {!c ? (
        <NoCompany />
      ) : (
        <>
          <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 md:flex-row md:items-start">
            <CompanyMark mark={c.mark} accent="lime" size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="t-page" aria-hidden>
                  {c.name}
                </p>
                <StageTag stage={c.stage} />
              </div>
              <p className="text-fg-2 mt-2 max-w-[58ch]">{c.short}</p>
              <p className="text-fg-2 mt-2 flex items-center gap-1.5 text-[0.8125rem]">
                {c.visibility === 'Hidden from directory' ? <Lock className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
                {c.visibility}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/app/hub/my-company/edit" className="btn btn-primary btn-sm">
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Edit company
              </Link>
              <Link to={`/app/hub/company/${c.slug}?preview=1`} className="btn btn-secondary btn-sm">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                View public profile
              </Link>
            </div>
          </motion.header>

          {/* Stage rail — inspired by P3 */}
          <section className="card p-5 sm:p-6" aria-label="Stage">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="eyebrow">Stage</h2>
              <span className="text-fg-2 text-[0.75rem]">Changing stage re-orders recommendations on your dashboard.</span>
            </div>
            <div className="relative mt-5">
              <div className="bg-fg/10 absolute top-[13px] right-[12.5%] left-[12.5%] h-[2px]" aria-hidden />
              <div className="bg-lime absolute top-[13px] left-[12.5%] h-[2px] transition-all duration-500" style={{ width: `${(STAGES.indexOf(c.stage) / (STAGES.length - 1)) * 75}%` }} aria-hidden />
              <ol className="relative grid grid-cols-4">
                {STAGES.map((s, i) => {
                  const idx = STAGES.indexOf(c.stage)
                  return (
                    <li key={s} className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          saveCompany({ ...c, stage: s })
                          toast(`Stage set to ${s}.`)
                        }}
                        aria-pressed={s === c.stage}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className={cn('grid h-7 w-7 place-items-center rounded-full border', i < idx ? 'border-lime/60 bg-base text-lime' : i === idx ? 'bg-lime border-lime text-[var(--on-lime)]' : 'border-line-strong bg-base text-fg-2')}>
                          {i < idx ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span className="font-mono text-[0.625rem]">{i + 1}</span>}
                        </span>
                        <span className={cn('text-[0.8125rem]', s === c.stage ? 'text-fg' : 'text-fg-2')}>{s}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Profile">
              <dl>
                <Row k="Company name" v={c.name} />
                <Row k="Company type" v={c.companyType} />
                <Row k="Industry" v={c.industry} />
                <Row k="Sub-industry" v={c.subIndustry} />
                <Row k="Location" v={c.location} />
                <Row k="Team size" v={c.teamSize && `${c.teamSize} people`} />
                <Row k="Founded" v={c.founded} />
                <Row k="Website" v={c.website} />
              </dl>
            </Panel>
            <Panel title="About">
              <p className="text-fg-2 text-[0.9375rem] leading-relaxed">{c.about}</p>
              <p className="eyebrow mt-6 mb-3 !text-[0.625rem]">Products & services</p>
              <ul className="flex flex-col gap-2">
                {c.products.map((p) => (
                  <li key={p.title} className="well px-3.5 py-2.5">
                    <p className="text-fg text-[0.875rem] font-medium">{p.title}</p>
                    <p className="text-fg-2 text-[0.8125rem]">{p.description}</p>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Looking for & can help with">
              <div className="flex flex-wrap gap-2">
                {c.lookingFor.length ? c.lookingFor.map((l) => <span key={l} className="border-electric/45 rounded-full border px-3 py-1 text-[0.8125rem]">{l}</span>) : <span className="text-fg-2 text-[0.875rem]">Nothing added yet.</span>}
              </div>
              <div className="border-line mt-5 flex flex-wrap gap-2 border-t pt-5">
                {c.canHelpWith.map((l) => (
                  <span key={l} className="tag">
                    {l}
                  </span>
                ))}
              </div>
            </Panel>
            <Panel title="Founders & team">
              <ul className="flex flex-col gap-3">
                {c.founders.map((f) => (
                  <li key={`${f.firstName}${f.familyName}`} className="flex items-center gap-3">
                    <Avatar initials={initialsOf(`${f.firstName} ${f.familyName}`)} size="sm" accent="lime" />
                    <span className="min-w-0 flex-1">
                      <span className="text-fg block text-[0.875rem] font-medium">
                        {f.firstName} {f.familyName}
                      </span>
                      <span className="text-fg-2 block text-[0.75rem]">{f.position}</span>
                    </span>
                    <span className="text-fg-2 flex items-center gap-1 text-[0.6875rem]">
                      <Lock className="h-3 w-3" aria-hidden />
                      Email private
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SampleNote>Stored in this browser only. In the live product, edits would publish after moderation.</SampleNote>
            <button type="button" onClick={() => setConfirm(true)} className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 self-start text-[0.8125rem]">
              <FileEdit className="h-3.5 w-3.5" aria-hidden />
              Reset to “no company” (preview)
            </button>
          </div>

          <Modal open={confirm} onClose={() => setConfirm(false)} title="Remove this company profile?">
            <p className="text-fg-2 text-[0.9375rem]">This returns the preview to the “no company yet” state so you can try the creation flow again.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn btn-quiet" onClick={() => setConfirm(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  removeCompany()
                  setConfirm(false)
                  toast('Company removed from the preview.')
                }}
              >
                Remove
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  )
}
