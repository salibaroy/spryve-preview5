import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Eye, MapPin, MessageCircle, UserPlus, Users } from 'lucide-react'
import { Avatar, CompanyMark, SaveButton, StageTag } from '@/components/ui'
import { ExternalAction, useToast } from '@/components/ui/feedback'
import { CompanyCard } from '@/components/ui/cards'
import NotFound from '@/routes/site/NotFound'
import { companies, companyBySlug, founderName, initialsOf } from '@/lib/data'
import { useStore } from '@/lib/store'

export default function CompanyProfile() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const { state, connect, openThread } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const own = state.company && state.company.slug === slug ? state.company : undefined
  const c = own ?? (slug ? companyBySlug(slug) : undefined)
  if (!c) return <NotFound inApp />
  const status = state.connections[c.slug]
  const person = founderName(c)
  const similar = companies.filter((x) => x.slug !== c.slug && (x.industry === c.industry || x.stage === c.stage)).slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <Link to={own ? '/app/hub/my-company' : '/app/hub'} className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 self-start text-[0.875rem]">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {own ? 'My company' : 'Founders Hub'}
      </Link>

      {own && (
        <div className="border-electric/40 bg-electric/10 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border px-4 py-3">
          <p className="flex items-center gap-2 text-[0.875rem]">
            <Eye className="text-electric h-4 w-4" aria-hidden />
            {params.get('preview') ? 'Public preview — this is how other members see your company.' : 'This is your company.'}
          </p>
          <Link to="/app/hub/my-company/edit" className="btn btn-secondary btn-sm">
            Edit company
          </Link>
        </div>
      )}

      <header className="card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20 blur-[80px]" style={{ background: c.accent === 'lime' ? 'var(--brand-secondary)' : 'var(--brand-tertiary)' }} aria-hidden />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start">
          <CompanyMark mark={c.mark} accent={c.accent} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="t-page">{c.name}</h1>
              <StageTag stage={c.stage} />
            </div>
            <p className="text-fg mt-2 text-[1.0625rem]">{c.short}</p>
            <p className="text-fg-2 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {c.location || 'Location not added'}
              </span>
              <span>
                {c.industry} · {c.subIndustry}
              </span>
              {c.teamSize && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {c.teamSize} people
                </span>
              )}
            </p>
          </div>
          {!own && (
            <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
              {status === 'connected' ? (
                <span className="btn btn-connect btn-sm cursor-default">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Connected
                </span>
              ) : status === 'pending' ? (
                <span className="btn btn-connect btn-sm cursor-default">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Request sent
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    connect(c.slug)
                    toast(`Connection request sent to ${person}.`)
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden />
                  Connect
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const id = openThread(c.slug, person)
                  navigate(`/app/hub/messages?thread=${id}`)
                }}
                className="btn btn-secondary btn-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Message
              </button>
              <SaveButton itemKey={`company:${c.slug}`} label={c.name} withText />
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="eyebrow mb-3">About</h2>
            <p className="text-fg-2 leading-relaxed">{c.about}</p>
          </section>
          <section className="card p-6">
            <h2 className="eyebrow mb-4">Products & services</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {c.products.map((p) => (
                <li key={p.title} className="well p-4">
                  <p className="text-fg font-medium">{p.title}</p>
                  <p className="text-fg-2 mt-1 text-[0.875rem]">{p.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="eyebrow mb-3">Looking for</h2>
            <div className="flex flex-wrap gap-2">
              {c.lookingFor.map((l) => (
                <span key={l} className="border-electric/45 rounded-full border px-3 py-1 text-[0.8125rem]">
                  {l}
                </span>
              ))}
            </div>
            {c.canHelpWith.length > 0 && (
              <>
                <h2 className="eyebrow mt-5 mb-3">Can help with</h2>
                <div className="flex flex-wrap gap-2">
                  {c.canHelpWith.map((l) => (
                    <span key={l} className="tag">
                      {l}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>
          <section className="card p-6">
            <h2 className="eyebrow mb-3">Founders</h2>
            <ul className="flex flex-col gap-3">
              {c.founders.map((f) => (
                <li key={f.firstName + f.familyName} className="flex items-center gap-3">
                  <Avatar initials={initialsOf(`${f.firstName} ${f.familyName}`)} size="sm" accent={c.accent} />
                  <span>
                    <span className="text-fg block text-[0.875rem] font-medium">
                      {f.firstName} {f.familyName}
                    </span>
                    <span className="text-fg-2 block text-[0.75rem]">{f.position}</span>
                  </span>
                </li>
              ))}
            </ul>
            {c.website && (
              <div className="border-line mt-5 border-t pt-4">
                <ExternalAction label="Visit website" provider={c.name} site={c.website.replace(/^https?:\/\//, '')} variant="link" />
              </div>
            )}
          </section>
        </aside>
      </div>

      {!own && similar.length > 0 && (
        <section>
          <h2 className="font-display mb-4 text-[1.125rem] font-semibold">Similar companies</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {similar.map((s) => (
              <CompanyCard key={s.slug} c={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
