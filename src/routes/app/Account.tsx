import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Building2, Check, Contrast, Globe2, Lock, Mail, MapPin, Moon, Phone, RotateCcw, Sun, Wind } from 'lucide-react'
import { Avatar, Field, Progress, SampleNote, Switch, Tag } from '@/components/ui'
import { useToast } from '@/components/ui/feedback'
import { INDUSTRY_OPTIONS, INTEREST_OPTIONS, STAGES, initialsOf, type Profile, type Stage } from '@/lib/data'
import { profileChecks, useStore, type Settings } from '@/lib/store'
import { cn } from '@/lib/utils'

function AccountHeader({ active }: { active: 'profile' | 'settings' }) {
  const { state } = useStore()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar initials={initialsOf(state.profile.name) || 'SF'} size="lg" accent="lime" />
        <div className="min-w-0">
          <p className="eyebrow mb-1">Account</p>
          <h1 className="t-page truncate">{state.profile.name}</h1>
          <p className="text-fg-2 truncate text-[0.875rem]">{state.profile.headline || 'Add a headline so people know what you’re working on'}</p>
        </div>
      </div>
      <div role="tablist" aria-label="Account sections" className="border-line bg-raised inline-flex self-start rounded-full border p-1">
        {(
          [
            ['profile', 'Profile', '/app/account'],
            ['settings', 'Settings', '/app/account/settings'],
          ] as const
        ).map(([id, label, to]) => (
          <Link key={id} to={to} role="tab" aria-selected={active === id} className={cn('relative rounded-full px-5 py-2 text-[0.875rem] font-medium transition-colors', active === id ? 'text-fg' : 'text-fg-2 hover:text-fg')}>
            {active === id && <motion.span layoutId="account-tab" className="bg-electric/20 border-electric/50 absolute inset-0 rounded-full border" transition={{ duration: 0.25 }} />}
            <span className="relative">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6" aria-label={title}>
      <h2 className="font-display text-[1.0625rem] font-semibold">{title}</h2>
      {description && <p className="text-fg-2 mt-1 text-[0.875rem]">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

/* ========================================================================== */
/* Profile                                                                     */
/* ========================================================================== */

export function ProfilePage() {
  const { state, setProfile } = useStore()
  const toast = useToast()
  const [form, setForm] = useState<Profile>(state.profile)
  useEffect(() => setForm(state.profile), [state.profile])
  const dirty = JSON.stringify(form) !== JSON.stringify(state.profile)
  const checks = profileChecks(form)
  const pct = Math.round((checks.filter((c) => c.done).length / checks.length) * 100)
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm((f) => ({ ...f, [k]: v }))
  const setPrivacy = <K extends keyof Profile['privacy']>(k: K, v: Profile['privacy'][K]) => setForm((f) => ({ ...f, privacy: { ...f.privacy, [k]: v } }))
  const nameError = form.name.trim().length < 2 ? 'Your name is required.' : ''

  return (
    <div className="flex flex-col gap-6 pb-10">
      <AccountHeader active="profile" />

      {/* completion — names the missing fields, not just a percentage */}
      <section className="card p-5" aria-label="Profile completeness">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">Profile completeness</p>
            <p className="font-display text-[1.5rem] font-semibold">{pct}%</p>
          </div>
          <p className="text-fg-2 max-w-xs text-right text-[0.8125rem]">A fuller profile means better recommendations on your dashboard.</p>
        </div>
        <Progress value={pct} label="Profile completeness" className="mt-3" />
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-1.5 text-[0.8125rem]">
              <span className={cn('grid h-4 w-4 place-items-center rounded-full border', c.done ? 'bg-lime border-lime text-[var(--on-lime)]' : 'border-line-strong')}>{c.done && <Check className="h-2.5 w-2.5" aria-hidden />}</span>
              <span className={c.done ? 'text-fg-2' : 'text-fg font-medium'}>{c.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card title="About you" description="Shown on your personal profile in Founders Hub. Company details are managed separately.">
            <div className="flex flex-col gap-5">
              <Field label="Name" required error={nameError} htmlFor="p-name">
                <input id="p-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={Boolean(nameError)} />
              </Field>
              <Field label="Headline" hint="One line — your role, or what you’re working on." htmlFor="p-head">
                <input id="p-head" className="input" value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Founder building scheduling tools for clinics" />
              </Field>
              <Field label="Location" htmlFor="p-loc">
                <input id="p-loc" className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
              </Field>
              <Field label="Bio" hint="A short paragraph about you — your background, and what you’re happy to help with." htmlFor="p-bio">
                <textarea id="p-bio" className="input min-h-[110px]" maxLength={400} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
                <span className="text-fg-2 self-end font-mono text-[0.6875rem]">{form.bio.length}/400</span>
              </Field>
            </div>
          </Card>

          <Card title="Contact information" description="Private by default. Choose what to show publicly in the Privacy panel.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" htmlFor="p-email">
                <input id="p-email" type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
              </Field>
              <Field label="Phone" htmlFor="p-phone">
                <input id="p-phone" type="tel" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
              </Field>
              <Field label="Website" htmlFor="p-web">
                <input id="p-web" className="input" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" />
              </Field>
              <Field label="LinkedIn" htmlFor="p-li">
                <input id="p-li" className="input" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" />
              </Field>
            </div>
          </Card>

          <Card title="What you’re working on" description="Drives what appears on your dashboard and in recommendations.">
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Stage" htmlFor="p-stage">
                  <select id="p-stage" className="input" value={form.stage} onChange={(e) => set('stage', e.target.value as Stage)}>
                    <option value="">Choose a stage</option>
                    {STAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sector" htmlFor="p-sector">
                  <select id="p-sector" className="input" value={form.sector} onChange={(e) => set('sector', e.target.value)}>
                    <option value="">Choose a sector</option>
                    {INDUSTRY_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Interests">
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((o) => (
                    <button key={o} type="button" aria-pressed={form.interests.includes(o)} onClick={() => set('interests', form.interests.includes(o) ? form.interests.filter((x) => x !== o) : [...form.interests, o])} className="chip">
                      {form.interests.includes(o) && <Check className="h-3.5 w-3.5" aria-hidden />}
                      {o}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Privacy" description="Email and phone are hidden from other members unless you turn them on.">
            <div className="flex flex-col gap-5">
              <Field label="Who can see your profile" required>
                <div className="flex flex-col gap-2" role="radiogroup" aria-label="Profile visibility">
                  {(['Members', 'Connections only', 'Only me'] as const).map((v) => (
                    <button key={v} type="button" role="radio" aria-checked={form.privacy.profileVisibility === v} onClick={() => setPrivacy('profileVisibility', v)} className={cn('flex items-center gap-3 rounded-[12px] border px-3.5 py-2.5 text-left text-[0.875rem] transition-colors', form.privacy.profileVisibility === v ? 'border-electric/60 bg-electric/14 text-fg' : 'border-line text-fg-2 hover:text-fg')}>
                      <span className={cn('grid h-4 w-4 place-items-center rounded-full border', form.privacy.profileVisibility === v ? 'border-electric' : 'border-line-strong')}>{form.privacy.profileVisibility === v && <span className="bg-electric h-2 w-2 rounded-full" />}</span>
                      {v === 'Members' ? 'All Spryve members' : v}
                    </button>
                  ))}
                </div>
              </Field>
              <ul className="divide-y divide-[var(--line)]">
                {(
                  [
                    ['showEmail', 'Show email on profile', 'Off by default'],
                    ['showPhone', 'Show phone on profile', 'Off by default'],
                    ['showLocation', 'Show location on profile', 'City and country'],
                  ] as const
                ).map(([k, label, hint]) => (
                  <li key={k} className="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span className="text-fg block text-[0.875rem]">{label}</span>
                      <span className="text-fg-2 block text-[0.75rem]">{hint}</span>
                    </span>
                    <Switch checked={form.privacy[k]} onChange={(v) => setPrivacy(k, v)} label={label} />
                  </li>
                ))}
              </ul>
              <Field label="Who can message you" htmlFor="p-msg">
                <select id="p-msg" className="input" value={form.privacy.allowMessages} onChange={(e) => setPrivacy('allowMessages', e.target.value as Profile['privacy']['allowMessages'])}>
                  <option>Anyone on Spryve</option>
                  <option>Connections only</option>
                </select>
              </Field>
            </div>
          </Card>

          <section className="card p-5" aria-label="How others see you">
            <p className="eyebrow mb-3">How others see you</p>
            {form.privacy.profileVisibility === 'Only me' ? (
              <p className="text-fg-2 flex items-center gap-2 text-[0.875rem]">
                <Lock className="h-4 w-4" aria-hidden />
                Your profile is hidden from other members.
              </p>
            ) : (
              <div className="well p-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={initialsOf(form.name) || '?'} size="sm" accent="lime" />
                  <span className="min-w-0">
                    <span className="text-fg block truncate text-[0.9375rem] font-medium">{form.name || 'Your name'}</span>
                    <span className="text-fg-2 block truncate text-[0.75rem]">{form.headline || 'Headline'}</span>
                  </span>
                </div>
                <ul className="text-fg-2 mt-3 flex flex-col gap-1.5 text-[0.8125rem]">
                  {form.privacy.showLocation && form.location && (
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {form.location}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    {form.privacy.showEmail && form.email ? form.email : <span className="italic">Email hidden</span>}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {form.privacy.showPhone && form.phone ? form.phone : <span className="italic">Phone hidden</span>}
                  </li>
                </ul>
                <p className="text-fg-2 mt-3 text-[0.75rem]">Visible to: {form.privacy.profileVisibility === 'Members' ? 'all Spryve members' : 'your connections'}</p>
              </div>
            )}
          </section>

          <Link to="/app/hub/my-company" className="card card-interactive flex items-center gap-3 p-5">
            <Building2 className="text-fg-2 h-5 w-5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="text-fg block text-[0.9375rem] font-medium">{state.company ? state.company.name : 'Company profile'}</span>
              <span className="text-fg-2 block text-[0.8125rem]">Company information is kept separate — manage it in My company.</span>
            </span>
          </Link>
        </div>
      </div>

      {dirty && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4 z-20">
          <div className="card border-line-strong flex flex-col gap-3 p-3 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-fg-2 pl-1 text-[0.875rem]">You have unsaved changes.</p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setForm(state.profile)}>
                Discard
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={Boolean(nameError)}
                onClick={() => {
                  setProfile(form)
                  toast('Profile saved in this browser.')
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ========================================================================== */
/* Settings — adapted from P1 Preferences                                       */
/* ========================================================================== */

export function SettingsPage() {
  const { state, setSettings, loadScenario } = useStore()
  const toast = useToast()
  const s = state.settings

  const appearance: { id: Settings['appearance'] | 'light'; label: string; body: string; icon: typeof Moon; disabled?: boolean }[] = [
    { id: 'dark', label: 'Dark', body: 'The default Spryve look.', icon: Moon },
    { id: 'contrast', label: 'Higher contrast', body: 'Brighter secondary text and stronger outlines.', icon: Contrast },
    { id: 'light', label: 'Light', body: 'Not designed yet — planned for a later phase.', icon: Sun, disabled: true },
  ]

  const languages = [
    { name: 'English', status: 'Complete', active: true },
    { name: 'العربية · Arabic', status: 'In translation', active: false },
    { name: 'Français · French', status: 'In translation', active: false },
  ]

  return (
    <div className="flex flex-col gap-6">
      <AccountHeader active="settings" />
      <p className="text-fg-2 -mt-2 text-[0.875rem]">Changes take effect immediately.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Appearance" description="Dark and higher contrast are available now.">
          <div className="grid gap-2" role="radiogroup" aria-label="Appearance">
            {appearance.map((a) => {
              const on = s.appearance === a.id
              return (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={a.disabled}
                  onClick={() => a.id !== 'light' && setSettings({ appearance: a.id })}
                  className={cn('flex items-center gap-3 rounded-[12px] border px-4 py-3 text-left transition-colors disabled:opacity-50', on ? 'border-electric/60 bg-electric/14' : 'border-line hover:border-line-strong')}
                >
                  <a.icon className={cn('h-4 w-4 shrink-0', on ? 'text-electric' : 'text-fg-2')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="text-fg block text-[0.9375rem] font-medium">{a.label}</span>
                    <span className="text-fg-2 block text-[0.8125rem]">{a.body}</span>
                  </span>
                  {on && <Check className="text-electric h-4 w-4" aria-hidden />}
                </button>
              )
            })}
          </div>
          <div className="border-line mt-5 flex items-center justify-between gap-4 border-t pt-4">
            <span className="flex items-start gap-3">
              <Wind className="text-fg-2 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="text-fg block text-[0.9375rem]">Reduce motion</span>
                <span className="text-fg-2 block text-[0.8125rem]">Stops timed scenes and softens transitions. Off follows your device setting.</span>
              </span>
            </span>
            <Switch checked={s.motion === 'reduced'} onChange={(v) => setSettings({ motion: v ? 'reduced' : 'system' })} label="Reduce motion" />
          </div>
        </Card>

        <Card title="Notifications" description="What Spryve should tell you about.">
          <ul className="divide-y divide-[var(--line)]">
            {(
              [
                ['deadlines', 'Deadline reminders', 'When something you saved is about to close.'],
                ['messages', 'Messages', 'When another founder writes to you.'],
                ['connections', 'Connection requests', 'When someone wants to connect.'],
                ['events', 'Events near you', 'New events that match your interests.'],
                ['product', 'Product updates', 'Occasional notes on what’s new in Spryve.'],
              ] as const
            ).map(([k, label, body]) => (
              <li key={k} className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="text-fg block text-[0.9375rem]">{label}</span>
                  <span className="text-fg-2 block text-[0.8125rem]">{body}</span>
                </span>
                <Switch checked={s.notifications[k]} onChange={(v) => setSettings({ notifications: { ...s.notifications, [k]: v } })} label={label} />
              </li>
            ))}
          </ul>
          <SampleNote className="mt-4">Delivery isn’t connected in the preview — these switches only store your choice locally.</SampleNote>
        </Card>

        <Card title="Language" description="Arabic and French are still being translated. They’ll become selectable once complete — no partial translations are shown.">
          <ul className="flex flex-col gap-2">
            {languages.map((l) => (
              <li key={l.name} className={cn('flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3', l.active ? 'border-electric/60 bg-electric/14' : 'border-line')}>
                <span className="flex items-center gap-3">
                  <Globe2 className={cn('h-4 w-4', l.active ? 'text-electric' : 'text-fg-2')} aria-hidden />
                  <span className={cn('text-[0.9375rem]', l.active ? 'text-fg' : 'text-fg-2')}>{l.name}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Tag tone={l.active ? 'blue' : undefined}>{l.status}</Tag>
                  {l.active && <Check className="text-electric h-4 w-4" aria-label="Current language" />}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Account">
          <dl className="divide-y divide-[var(--line)]">
            {[
              ['Email', state.profile.email || 'Not added'],
              ['Sign-in', 'Not connected in this preview'],
              ['Plan', 'Not defined in this preview'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-fg-2 text-[0.8125rem]">{k}</dt>
                <dd className="text-fg text-right text-[0.875rem]">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <section className="border-line-strong rounded-[20px] border border-dashed p-5 sm:p-6" aria-label="Prototype data">
        <h2 className="font-display text-[1.0625rem] font-semibold">Prototype data</h2>
        <p className="text-fg-2 mt-1 max-w-[70ch] text-[0.875rem]">
          Saved items, drafts, messages, course progress and settings are stored in this browser under <code className="font-mono">spryve.p5.</code>. Resetting only clears this preview.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              try {
                Object.keys(localStorage).filter((k) => k.startsWith('spryve.p5.')).forEach((k) => localStorage.removeItem(k))
                Object.keys(sessionStorage).filter((k) => k.startsWith('spryve.p5.')).forEach((k) => sessionStorage.removeItem(k))
              } catch {
                /* ignore */
              }
              loadScenario('sample')
              toast('Preview reset to the sample founder.')
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset preview data
          </button>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => {
              loadScenario('new', { name: state.profile.name, email: state.profile.email })
              toast('Showing a brand-new account.')
            }}
          >
            Show a brand-new account
          </button>
        </div>
      </section>
    </div>
  )
}
