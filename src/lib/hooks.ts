import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, type AnimationPlaybackControls, type MotionValue } from 'motion/react'
import { useStore } from './store'

/** True when the OS asks for less motion OR the preview setting forces it. */
export function useCalm() {
  const system = useReducedMotion()
  const { state } = useStore()
  return Boolean(system) || state.settings.motion === 'reduced'
}

type ScrollOffsetT = NonNullable<NonNullable<Parameters<typeof useScroll>[0]>['offset']>

/** [element edge, viewport edge] as fractions: [0, 0.85] = "element top meets 85% down the viewport". */
export type Edge = [number, number]

/**
 * A scene driven by scroll position. `driver` (0..1) follows the element's
 * scroll progress between `start` and `end`, so scrolling forward or back
 * moves the scene with you — no timers, nothing plays while you read.
 * `goTo` and `replay` let buttons take over briefly without moving the page;
 * the next scroll hands control back (with a short catch-up, not a jump).
 * Reduced motion: the driver rests at `calmValue` and only buttons move it.
 */
export function useScrollScene({ start, end, calmValue = 1 }: { start: Edge; end: Edge; calmValue?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const calm = useCalm()
  const { scrollYProgress } = useScroll({ target: ref, offset: [`${start[0]} ${start[1]}`, `${end[0]} ${end[1]}`] as ScrollOffsetT })
  const driver = useMotionValue(calm ? calmValue : 0)
  const s = useRef<{ override: boolean; anim: AnimationPlaybackControls | null; until: number; y: number }>({ override: false, anim: null, until: 0, y: 0 })

  useEffect(() => {
    s.current.anim?.stop()
    s.current.override = false
    driver.set(calm ? calmValue : scrollYProgress.get())
  }, [calm, calmValue, driver, scrollYProgress])
  useEffect(() => () => s.current.anim?.stop(), [])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (calm) return
    const st = s.current
    if (st.override) {
      /* Progress can also change because content resized (a caption growing a
         line); only a real scroll hands control back. */
      if (Math.abs(window.scrollY - st.y) < 2) return
      st.override = false
      st.anim?.stop()
      st.anim = animate(driver, v, { duration: 0.35, ease: [0.22, 1, 0.36, 1] })
      st.until = performance.now() + 350
      return
    }
    if (performance.now() < st.until) {
      st.anim?.stop()
      st.anim = animate(driver, v, { duration: 0.15 })
      return
    }
    st.anim?.stop()
    driver.set(v)
  })

  /** Show a point in the scene (animated unless `duration` is 0) without scrolling. */
  const goTo = useCallback(
    (v: number, duration = 0.9) => {
      const st = s.current
      st.anim?.stop()
      st.y = window.scrollY
      if (calm || duration === 0) {
        if (!calm) st.override = true
        driver.set(v)
        return
      }
      st.override = true
      st.anim = animate(driver, v, { duration, ease: [0.45, 0, 0.25, 1] })
    },
    [calm, driver],
  )

  /** Play the scene from the start once, at a steady pace. */
  const replay = useCallback(
    (duration = 3) => {
      const st = s.current
      st.anim?.stop()
      if (calm) return driver.set(calmValue)
      st.y = window.scrollY
      st.override = true
      driver.set(0)
      st.anim = animate(driver, 1, { duration, ease: 'linear' })
    },
    [calm, calmValue, driver],
  )

  return { ref, driver, goTo, replay, calm }
}

/** A small derived value (a step index, a flag) that re-renders only when it changes. */
export function useDriven<T>(mv: MotionValue<number>, fn: (v: number) => T): T {
  const [val, setVal] = useState(() => fn(mv.get()))
  useMotionValueEvent(mv, 'change', (v) => setVal(fn(v)))
  return val
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
