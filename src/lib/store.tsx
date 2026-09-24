/**
 * PREVIEW STORE — local mock state only.
 * ---------------------------------------------------------------------------
 * One source of truth for saved items, the company profile, the personal
 * profile, messages, course progress and settings. Persisted to this
 * browser's localStorage under `spryve.p5.` — nothing is sent anywhere.
 * This is deliberately NOT authentication: there are no passwords, sessions
 * or servers. The data phase will replace this module with real services.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  SAMPLE_COMPANY,
  SAMPLE_PROFILE,
  SAMPLE_THREADS,
  type Company,
  type Profile,
  type Thread,
} from './data'

export type SavedKey = `opp:${string}` | `lib:${string}` | `company:${string}`
export interface SavedEntry {
  key: SavedKey
  savedAt: number
}

export type Scenario = 'sample' | 'published' | 'new'

export interface BuildRequest {
  id: string
  help: string[]
  stage: string
  summary: string
  at: number
}

export interface Settings {
  appearance: 'dark' | 'contrast'
  motion: 'system' | 'reduced'
  notifications: Record<'deadlines' | 'messages' | 'connections' | 'events' | 'product', boolean>
}

export interface PreviewState {
  version: 3
  scenario: Scenario
  profile: Profile
  company: Company | null
  saved: SavedEntry[]
  lessonsDone: Record<string, string[]>
  threads: Thread[]
  connections: Record<string, 'pending' | 'connected'>
  stepsDone: string[]
  settings: Settings
  buildRequests: BuildRequest[]
}

const KEY = 'spryve.p5.state'
const HOUR = 3_600_000

const DEFAULT_SETTINGS: Settings = {
  appearance: 'dark',
  motion: 'system',
  notifications: { deadlines: true, messages: true, connections: true, events: false, product: false },
}

function scenarioState(scenario: Scenario, profile?: Partial<Profile>): PreviewState {
  const now = Date.now()
  if (scenario === 'new') {
    return {
      version: 3,
      scenario,
      profile: {
        ...SAMPLE_PROFILE,
        name: profile?.name ?? 'New founder',
        email: profile?.email ?? '',
        headline: '',
        location: '',
        bio: '',
        phone: '',
        website: '',
        linkedin: '',
        stage: profile?.stage ?? '',
        sector: profile?.sector ?? '',
        interests: profile?.interests ?? [],
        privacy: { ...SAMPLE_PROFILE.privacy },
      },
      company: null,
      saved: [],
      lessonsDone: {},
      threads: [],
      connections: {},
      stepsDone: [],
      settings: DEFAULT_SETTINGS,
      buildRequests: [],
    }
  }
  return {
    version: 3,
    scenario,
    profile: { ...SAMPLE_PROFILE, privacy: { ...SAMPLE_PROFILE.privacy } },
    company: scenario === 'published' ? { ...SAMPLE_COMPANY } : null,
    saved: [
      { key: 'opp:launchway-health', savedAt: now - 2 * HOUR },
      { key: 'lib:pricing-script', savedAt: now - 5 * HOUR },
      { key: 'opp:digital-health-grant', savedAt: now - 26 * HOUR },
      { key: 'company:ostraka', savedAt: now - 30 * HOUR },
      { key: 'opp:founders-night-clinical', savedAt: now - 50 * HOUR },
      { key: 'lib:pricing-guide', savedAt: now - 72 * HOUR },
      { key: 'opp:atlas-legal', savedAt: now - 96 * HOUR },
      { key: 'lib:fundraising-course', savedAt: now - 120 * HOUR },
    ],
    lessonsDone: { 'pricing-course': ['p1', 'p2'], 'validate-course': ['v1', 'v2', 'v3', 'v4', 'v5'] },
    threads: SAMPLE_THREADS.map((t) => ({ ...t, messages: [...t.messages] })),
    connections: { trellis: 'connected', vessel: 'connected', ostraka: 'connected' },
    stepsDone: [],
    settings: DEFAULT_SETTINGS,
    buildRequests: [],
  }
}

function load(): PreviewState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PreviewState
      if (parsed?.version === 3) return parsed
    }
  } catch {
    /* private mode or corrupted value — fall back to the sample */
  }
  return scenarioState('sample')
}

/* -------------------------------------------------------------------------- */

interface StoreApi {
  state: PreviewState
  isSaved: (key: SavedKey) => boolean
  toggleSave: (key: SavedKey) => boolean
  removeSaved: (key: SavedKey) => void
  setProfile: (p: Profile) => void
  saveCompany: (c: Company) => void
  removeCompany: () => void
  toggleLesson: (courseId: string, lessonId: string) => void
  sendMessage: (threadId: string, body: string) => void
  openThread: (companySlug: string, person: string) => string
  markRead: (threadId: string) => void
  connect: (slug: string) => void
  toggleStep: (id: string) => void
  setSettings: (s: Partial<Settings>) => void
  addBuildRequest: (r: Omit<BuildRequest, 'id' | 'at'>) => void
  loadScenario: (s: Scenario, profile?: Partial<Profile>) => void
  unread: number
}

const StoreContext = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState>(load)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* the session still works without persistence */
    }
  }, [state])

  /* Appearance + motion settings apply to the whole document. */
  useEffect(() => {
    document.documentElement.dataset.appearance = state.settings.appearance
    document.documentElement.dataset.motion = state.settings.motion
  }, [state.settings.appearance, state.settings.motion])

  const update = useCallback((fn: (s: PreviewState) => PreviewState) => setState((s) => fn(s)), [])

  const api = useMemo<StoreApi>(() => {
    const isSaved = (key: SavedKey) => state.saved.some((e) => e.key === key)
    return {
      state,
      isSaved,
      toggleSave: (key) => {
        const was = isSaved(key)
        update((s) => ({
          ...s,
          saved: was ? s.saved.filter((e) => e.key !== key) : [{ key, savedAt: Date.now() }, ...s.saved],
        }))
        return !was
      },
      removeSaved: (key) => update((s) => ({ ...s, saved: s.saved.filter((e) => e.key !== key) })),
      setProfile: (profile) => update((s) => ({ ...s, profile })),
      saveCompany: (company) => update((s) => ({ ...s, company })),
      removeCompany: () => update((s) => ({ ...s, company: null })),
      toggleLesson: (courseId, lessonId) =>
        update((s) => {
          const done = s.lessonsDone[courseId] ?? []
          const next = done.includes(lessonId) ? done.filter((l) => l !== lessonId) : [...done, lessonId]
          return { ...s, lessonsDone: { ...s.lessonsDone, [courseId]: next } }
        }),
      sendMessage: (threadId, body) =>
        update((s) => ({
          ...s,
          threads: s.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, { id: `m${Date.now()}`, from: 'me', body, at: 'Just now' }] }
              : t,
          ),
        })),
      openThread: (companySlug, person) => {
        const existing = state.threads.find((t) => t.companySlug === companySlug)
        if (existing) return existing.id
        const id = `t-${companySlug}`
        update((s) => ({ ...s, threads: [{ id, companySlug, person, unread: false, messages: [] }, ...s.threads] }))
        return id
      },
      markRead: (threadId) =>
        update((s) => ({ ...s, threads: s.threads.map((t) => (t.id === threadId ? { ...t, unread: false } : t)) })),
      connect: (slug) => update((s) => ({ ...s, connections: { ...s.connections, [slug]: 'pending' } })),
      toggleStep: (id) =>
        update((s) => ({
          ...s,
          stepsDone: s.stepsDone.includes(id) ? s.stepsDone.filter((x) => x !== id) : [...s.stepsDone, id],
        })),
      setSettings: (patch) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      addBuildRequest: (r) =>
        update((s) => ({ ...s, buildRequests: [{ ...r, id: `br${Date.now()}`, at: Date.now() }, ...s.buildRequests] })),
      loadScenario: (scenario, profile) => setState(scenarioState(scenario, profile)),
      unread: state.threads.filter((t) => t.unread).length,
    }
  }, [state, update])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/* -------------------------------------------------------------------------- */
/* Session-scoped view preference (Grid / List), remembered per area.          */
/* -------------------------------------------------------------------------- */

export type ViewMode = 'grid' | 'list'

export function useViewMode(area: string, fallback: ViewMode = 'grid') {
  const key = `spryve.p5.view.${area}`
  const [mode, setMode] = useState<ViewMode>(() => {
    try {
      const v = sessionStorage.getItem(key)
      if (v === 'grid' || v === 'list') return v
    } catch {
      /* ignore */
    }
    return fallback
  })
  const set = useCallback(
    (m: ViewMode) => {
      setMode(m)
      try {
        sessionStorage.setItem(key, m)
      } catch {
        /* ignore */
      }
    },
    [key],
  )
  return [mode, set] as const
}

/* -------------------------------------------------------------------------- */
/* Profile completion — computed from the fields, so meter and list agree.     */
/* -------------------------------------------------------------------------- */

export function profileChecks(p: Profile) {
  return [
    { label: 'Name', done: Boolean(p.name.trim()) },
    { label: 'Headline', done: Boolean(p.headline.trim()) },
    { label: 'Location', done: Boolean(p.location.trim()) },
    { label: 'Short bio', done: p.bio.trim().length > 20 },
    { label: 'Stage', done: Boolean(p.stage) },
    { label: 'Interests', done: p.interests.length > 0 },
  ]
}
