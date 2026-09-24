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
 * Timed, replayable scene stepping. Advances only while the section is on
 * screen, stops for good once the visitor takes control, and never runs when
 * reduced motion is requested — every state stays reachable by click.
 */
export function useAutoCycle(count: number, ms: number, opts: { loop?: boolean; calmIndex?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.35 })
  const calm = useCalm()
  const [index, setIndex] = useState(0)
  const [manual, setManual] = useState(false)
  const [runId, setRunId] = useState(0)
  const playing = inView && !calm && !manual

  /* Reduced motion: jump straight to the composed end state (still clickable). */
  useEffect(() => {
    if (calm && !manual && opts.calmIndex !== undefined) setIndex(opts.calmIndex)
  }, [calm, manual, opts.calmIndex])

  useEffect(() => {
    if (!playing) return
    if (!opts.loop && index >= count - 1) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), ms)
    return () => window.clearTimeout(id)
  }, [playing, index, count, ms, opts.loop, runId])

  const select = useCallback((i: number) => {
    setManual(true)
    setIndex(i)
  }, [])

  const replay = useCallback(() => {
    setManual(false)
    setIndex(0)
    setRunId((r) => r + 1)
  }, [])

  return { ref, index, select, replay, playing, calm, inView, done: !opts.loop && index >= count - 1 }
}
