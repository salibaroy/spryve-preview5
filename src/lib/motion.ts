import type { Transition, Variants } from 'motion/react'

/** House easing: decelerates like it has mass. Mirrors --ease-out in CSS. */
export const EASE = [0.22, 1, 0.36, 1] as const

export const t = {
  quick: { duration: 0.2, ease: EASE } as Transition,
  base: { duration: 0.5, ease: EASE } as Transition,
  scene: { duration: 0.8, ease: EASE } as Transition,
}

export const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: t.base },
}

export const stagger = (delayChildren = 0, staggerChildren = 0.06): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
})

export const viewportOnce = { once: true, margin: '-15% 0px -15% 0px' } as const
