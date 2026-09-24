import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { useStore } from './store'

/** True when the OS asks for less motion OR the preview setting forces it. */
export function useCalm() {
  const system = useReducedMotion()
  const { state } = useStore()
  return Boolean(system) || state.settings.motion === 'reduced'
}

/**
 * Timed, replayable scene stepping. Starts when the section first comes into
 * view, advances only while it stays on screen, plays through once and rests
 * on the last step (unless `loop`). Any manual selection stops the timer for
 * good; `replay` hands control back. Reduced motion never auto-advances and
 * can jump straight to a composed state (`calmIndex`) — every step stays
 * reachable by click.
 */
export function useAutoCycle(count: number, ms: number, opts: { loop?: boolean; calmIndex?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.35 })
  const calm = useCalm()
  const [index, setIndex] = useState(() => (calm && opts.calmIndex !== undefined ? opts.calmIndex : 0))
  const [manual, setManual] = useState(false)
  const [runId, setRunId] = useState(0)
  const playing = inView && !calm && !manual
  const done = !opts.loop && index >= count - 1

  /* Reduced motion: jump straight to the composed end state (still clickable). */
  useEffect(() => {
    if (calm && !manual && opts.calmIndex !== undefined) setIndex(opts.calmIndex)
  }, [calm, manual, opts.calmIndex])

  useEffect(() => {
    if (!playing || done) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), ms)
    return () => window.clearTimeout(id)
  }, [playing, done, index, count, ms, runId])

  const select = useCallback((i: number) => {
    setManual(true)
    setIndex(i)
  }, [])

  const replay = useCallback(() => {
    setManual(false)
    setIndex(0)
    setRunId((r) => r + 1)
  }, [])

  /** True while a step is counting down to the next one (drives progress bars). */
  const advancing = playing && !done
  return { ref, index, select, replay, playing, advancing, manual, calm, inView, done, runId }
}

/**
 * A one-shot timeline: `times` are offsets (ms) at which the phase steps up.
 * Phase 0 is the opening state; phase `times.length` is the resting state.
 * Starts the first time the element is in view and then plays to the end —
 * the sequences are a few seconds long, so they never wait on further scroll.
 * Reduced motion renders the resting state immediately.
 */
export function useSequence(times: number[], opts: { amount?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: opts.amount ?? 0.35, once: true })
  const calm = useCalm()
  const end = times.length
  const [phase, setPhase] = useState(() => (calm ? end : 0))
  const [manual, setManual] = useState(false)
  const [runId, setRunId] = useState(0)
  const key = times.join(',')

  useEffect(() => {
    if (calm && !manual) setPhase(end)
  }, [calm, manual, end])

  useEffect(() => {
    if (!inView || calm || manual) return
    const ids = key.split(',').map((t, i) => window.setTimeout(() => setPhase(i + 1), Number(t)))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [inView, calm, manual, key, runId])

  const select = useCallback((p: number) => {
    setManual(true)
    setPhase(p)
  }, [])

  const replay = useCallback(() => {
    setManual(false)
    setPhase(0)
    setRunId((r) => r + 1)
  }, [])

  return { ref, phase, select, replay, calm, inView, manual, done: phase >= end, runId }
}

/** Live media-query match (SSR-safe default: false). */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}
