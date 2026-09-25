import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState, Logo } from '@/components/ui'

export default function NotFound({ inApp = false }: { inApp?: boolean }) {
  const body = (
    <EmptyState
      icon={<Compass />}
      title="This page isn’t part of the preview"
      body="The link may be from another concept, or the page hasn’t been designed yet."
      action={
        <>
          <Link to="/app" className="btn btn-primary btn-sm">
            Go to the dashboard
          </Link>
          <Link to="/" className="btn btn-secondary btn-sm">
            Back to the website
          </Link>
        </>
      }
    />
  )
  if (inApp) return <div className="py-10">{body}</div>
  return (
    <div className="bg-base grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        {body}
      </div>
    </div>
  )
}
