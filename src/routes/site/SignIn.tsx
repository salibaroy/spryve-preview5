import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { Field, Logo } from '@/components/ui'
import { useStore } from '@/lib/store'

export default function SignIn() {
  const { loadScenario, state } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  return (
    <div className="bg-base grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-10 flex justify-center" aria-label="Spryve home">
          <Logo />
        </Link>
        <div className="card p-6 sm:p-8">
          <h1 className="t-page text-center">Sign in</h1>
          <p className="text-fg-2 mt-2 text-center text-[0.9375rem]">Welcome back to your startup world.</p>

          <div className="well mt-6 flex gap-3 px-4 py-3 text-[0.8125rem]">
            <FlaskConical className="text-electric mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="text-fg-2">Sign-in isn’t connected in this preview. Continue to explore the workspace with sample data.</p>
          </div>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/app')
            }}
          >
            <Field label="Email" htmlFor="si-email">
              <input id="si-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Not checked in the preview" autoComplete="email" />
            </Field>
            <button type="submit" className="btn btn-primary">
              {state.scenario === 'new' ? `Continue as ${state.profile.name.split(' ')[0]}` : 'Continue to the workspace'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              loadScenario('sample')
              navigate('/app')
            }}
            className="btn btn-secondary mt-3 w-full"
          >
            Use the sample founder instead
          </button>
        </div>
        <p className="text-fg-2 mt-6 text-center text-[0.875rem]">
          New to Spryve?{' '}
          <Link to="/register" className="text-fg underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
