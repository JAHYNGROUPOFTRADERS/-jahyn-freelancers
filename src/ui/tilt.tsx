import React, { useRef, useState } from 'react'
import { clamp } from '../utils'

/**
 * Mouse-tracked 3D tilt wrapper.
 * Children get a perspective tilt + moving glare, like the Web3 hero cards.
 * Disable with `flat` (used for reduced-motion and small screens fallback).
 */
export function Tilt3D({
  children,
  className = '',
  max = 8,
  scale = 1.0,
  glare = true,
  flat = false,
  style,
}: {
  children: React.ReactNode
  className?: string
  /** max rotation in degrees */
  max?: number
  scale?: number
  glare?: boolean
  flat?: boolean
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, on: false })

  function onMove(e: React.MouseEvent) {
    if (flat || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setT({
      rx: (0.5 - py) * max * 2,
      ry: (px - 0.5) * max * 2,
      gx: px * 100,
      gy: py * 100,
      on: true,
    })
  }

  function onLeave() {
    setT((s) => ({ ...s, rx: 0, ry: 0, on: false }))
  }

  const transform = flat
    ? undefined
    : `perspective(900px) rotateX(${t.rx.toFixed(2)}deg) rotateY(${t.ry.toFixed(2)}deg) scale(${t.on ? scale : 1})`

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      style={{ ...style, transform, transition: t.on ? 'transform 0.06s linear' : 'transform 0.5s cubic-bezier(.2,.7,.3,1)' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
      {glare && !flat && (
        <div
          className="tilt-glare"
          style={{ background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,0.14), transparent 55%)`, opacity: t.on ? 1 : 0 }}
        />
      )}
    </div>
  )
}

/** Detect touch devices / reduced motion — tilt is a pointer effect anyway. */
export function useTiltDisabled(): boolean {
  const [disabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return coarse || reduced
  })
  return disabled
}

/**
 * 3D glowing orb centerpiece — layered radial gradients + slow float,
 * inspired by the colorful low-poly head in the reference shot.
 */
export function HeroOrb({ size = 260 }: { size?: number }) {
  return (
    <div className="orb-scene" style={{ width: size, height: size }} aria-hidden>
      <div className="orb-float">
        <div className="orb">
          <span className="orb-band b1" />
          <span className="orb-band b2" />
          <span className="orb-band b3" />
          <span className="orb-ring r1" />
          <span className="orb-ring r2" />
          <span className="orb-dot d1" />
          <span className="orb-dot d2" />
          <span className="orb-dot d3" />
          <span className="orb-dot d4" />
        </div>
        <div className="orb-shadow" />
      </div>
    </div>
  )
}
