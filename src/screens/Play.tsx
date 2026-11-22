import { useEffect, useRef, useState } from 'react'
import { IDLE, Keyboard } from '../game/controls'
import { draw } from '../game/draw'
import { Game } from '../game/Game'
import type { Sfx } from '../game/sfx'

type Props = {
  sfx: Sfx
  onOver: (score: number) => void
  onQuit: () => void
}

function fit(canvas: HTMLCanvasElement) {
  const dpr = devicePixelRatio || 1
  const w = Math.round(canvas.clientWidth * dpr)
  const h = Math.round(canvas.clientHeight * dpr)
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
}

export default function Play({ sfx, onOver, onQuit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const game = new Game(sfx)
    const keyboard = new Keyboard()
    const detach = keyboard.attach()
    let last = performance.now()
    let raf = 0
    let timer = 0

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      fit(canvas)
      const controls = pausedRef.current ? IDLE : keyboard.read()
      if (!pausedRef.current) game.update(dt, controls)
      draw(ctx, game, controls)
      if (game.over && !timer) timer = window.setTimeout(() => onOver(game.score), 1200)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') setPaused((p) => !p)
      if (e.code === 'KeyM') sfx.toggleMute()
    }
    const onHide = () => {
      if (document.hidden) setPaused(true)
    }
    addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onHide)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      detach()
      removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [sfx, onOver])

  return (
    <>
      <canvas ref={canvasRef} className="stage" />
      {paused && (
        <div className="overlay">
          <div className="card">
            <h2>Paused</h2>
            <div className="actions">
              <button className="primary" onClick={() => setPaused(false)}>
                Resume
              </button>
              <button className="link" onClick={onQuit}>
                Quit to menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}