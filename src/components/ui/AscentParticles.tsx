'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
  driftPhase: number
  alpha: number
}

export function AscentParticles({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let animationId: number
    const DENSITY = 0.00009

    function resize() {
      const canvasEl = canvasRef.current
      if (!canvasEl) return
      width = canvasEl.clientWidth
      height = canvasEl.clientHeight
      canvasEl.width = width * window.devicePixelRatio
      canvasEl.height = height * window.devicePixelRatio
      ctx!.setTransform(1, 0, 0, 1, 0, 0)
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
      const count = Math.round(width * height * DENSITY)
      particles = Array.from({ length: count }, () => makeParticle(true))
    }

    function makeParticle(randomY: boolean): Particle {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 10,
        radius: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.35 + 0.08,
        drift: Math.random() * 0.6 + 0.2,
        driftPhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.15,
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.fillStyle = `rgba(212, 175, 55, ${p.alpha})`
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx!.fill()
        p.y -= p.speed
        p.x += Math.sin(p.y * 0.01 + p.driftPhase) * 0.15 * p.drift
        if (p.y < -10) Object.assign(p, makeParticle(false))
      }
      animationId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()
    if (reduceMotion) cancelAnimationFrame(animationId)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
