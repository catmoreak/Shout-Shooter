import { rand } from '../utils/math'
import { BOTTOM, H, INK, MARKER, PAPER, PLAYER_X, RED, RULE, TOP, W } from './constants'
import type { Controls } from './controls'
import { ENEMIES } from './enemies'
import type { Game } from './Game'
import type { Bullet, Enemy } from './types'

type Ctx = CanvasRenderingContext2D

const HAND = '"Shantell Sans", "Comic Sans MS", sans-serif'
const MARGIN = 56
const BAR = 320
const LINE = 48

export function draw(ctx: Ctx, game: Game, input: Controls) {
  const { width, height } = ctx.canvas
  const scale = Math.min(width / W, height / H)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = '#dcdfd6'
  ctx.fillRect(0, 0, width, height)
  ctx.setTransform(scale, 0, 0, scale, (width - W * scale) / 2, (height - H * scale) / 2)
  ctx.textBaseline = 'alphabetic'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, W, H)
  ctx.clip()
  if (game.shake) ctx.translate(rand(-1, 1) * game.shake, rand(-1, 1) * game.shake)

  sheet(ctx, game)
  game.enemies.forEach((e) => enemy(ctx, e))
  game.bullets.forEach((b) => (b.hostile ? pellet(ctx, b) : note(ctx, b)))
  plane(ctx, game, input.fire)
  effects(ctx, game)
  ctx.restore()

  hud(ctx, game)
}

function sheet(ctx: Ctx, game: Game) {
  ctx.fillStyle = game.shushed ? '#e7eae2' : PAPER
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = RULE
  for (let x = BAR - (game.scroll % BAR); x < W; x += BAR) ctx.fillRect(x, TOP, 1, BOTTOM - TOP)
  ctx.fillRect(0, TOP, W, 1.5)
  ctx.fillRect(0, BOTTOM, W, 1.5)

  ctx.fillStyle = 'rgba(200, 55, 45, 0.4)'
  ctx.fillRect(MARGIN, 0, 1.5, H)

  ctx.fillStyle = 'rgba(195, 204, 214, 0.5)'
  for (let y = TOP + LINE; y < BOTTOM; y += LINE) ctx.fillRect(MARGIN, y, W, 1)
}

function polygon(ctx: Ctx, x: number, y: number, r: number, sides: number, rot: number) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const a = rot + (i / sides) * Math.PI * 2
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
  }
  ctx.closePath()
}

function enemy(ctx: Ctx, e: Enemy) {
  const { color, hp } = ENEMIES[e.kind]
  const hit = e.flash > 0
  ctx.strokeStyle = color
  ctx.fillStyle = hit ? color : PAPER
  ctx.lineWidth = 2.5

  if (e.kind === 'drifter') {
    for (let k = 0; k < 3; k++) {
      ctx.beginPath()
      ctx.ellipse(e.x, e.y, e.r, e.r * 0.72, e.t * 2 + k * 1.05, 0, Math.PI * 2)
      if (k === 0) ctx.fill()
      ctx.stroke()
    }
  } else if (e.kind === 'waver') {
    polygon(ctx, e.x, e.y, e.r, 3, Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(e.x - e.r * 0.4, e.y)
    ctx.lineTo(e.x + e.r * 0.4, e.y)
    ctx.stroke()
  } else if (e.kind === 'gunner') {
    polygon(ctx, e.x, e.y, e.r, 6, e.t * 0.5)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(e.x, e.y, 5, 0, Math.PI * 2)
    ctx.fill()
  } else {
    stamp(ctx, e, color, hit)
  }

  if (hp > 1) {
    ctx.fillStyle = RULE
    ctx.fillRect(e.x - e.r, e.y - e.r - 12, e.r * 2, 2)
    ctx.fillStyle = color
    ctx.fillRect(e.x - e.r, e.y - e.r - 12, (e.r * 2 * e.hp) / hp, 2)
  }
  ctx.lineWidth = 1
}

function stamp(ctx: Ctx, e: Enemy, color: string, hit: boolean) {
  ctx.setLineDash([6, 8])
  ctx.lineWidth = 1.5
  for (let k = 0; k < 2; k++) {
    const spread = (e.t * 50 + k * 60) % 120
    ctx.globalAlpha = 1 - spread / 120
    ctx.beginPath()
    ctx.arc(e.x, e.y, e.r + 10 + spread, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.rotate(-0.12)
  ctx.fillStyle = hit ? PAPER : color
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(-e.r * 1.25, -e.r * 0.8, e.r * 2.5, e.r * 1.6, 6)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = hit ? color : PAPER
  ctx.font = `700 26px ${HAND}`
  ctx.textAlign = 'center'
  ctx.fillText('shh', 0, 8)
  ctx.restore()
}

function note(ctx: Ctx, b: Bullet) {
  const r = b.r
  ctx.save()
  ctx.translate(b.x, b.y)
  ctx.fillStyle = INK
  ctx.strokeStyle = INK
  ctx.lineWidth = Math.max(1.5, r * 0.3)
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.25, r * 0.9, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(r * 1.1, -r * 0.3)
  ctx.lineTo(r * 1.1, -r * 3.4)
  ctx.quadraticCurveTo(r * 2.6, -r * 2.6, r * 2.2, -r * 1.2)
  ctx.stroke()
  ctx.restore()
}

function pellet(ctx: Ctx, b: Bullet) {
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
  ctx.fill()
}

function planePath(ctx: Ctx, x: number, y: number, s: number) {
  ctx.beginPath()
  ctx.moveTo(x + 26 * s, y)
  ctx.lineTo(x - 20 * s, y - 14 * s)
  ctx.lineTo(x - 8 * s, y + s)
  ctx.lineTo(x - 18 * s, y + 13 * s)
  ctx.closePath()
}

function plane(ctx: Ctx, game: Game, firing: boolean) {
  if (game.over || (game.invuln > 0 && Math.floor(game.time * 12) % 2)) return
  const x = PLAYER_X
  const y = game.y
  const trail = firing ? 32 : 12

  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.beginPath()
  for (const dy of [-7, 0, 7]) {
    const start = x - 28 - rand(0, 4)
    ctx.moveTo(start, y + dy)
    ctx.lineTo(start - trail - rand(0, 8), y + dy)
  }
  ctx.stroke()

  ctx.fillStyle = '#fff'
  planePath(ctx, x, y, 1)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 26, y)
  ctx.lineTo(x - 8, y + 1)
  ctx.stroke()
  ctx.lineWidth = 1
}

function effects(ctx: Ctx, game: Game) {
  for (const ring of game.rings) {
    ctx.strokeStyle = INK
    ctx.globalAlpha = 1 - ring.r / 1500
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(ring.x, ring.y, ring.r * 0.93, 0, Math.PI * 2)
    ctx.stroke()
  }

  for (const p of game.particles) {
    ctx.globalAlpha = Math.min(1, p.life * 2)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.font = `600 18px ${HAND}`
  ctx.textAlign = 'center'
  ctx.fillStyle = RED
  for (const p of game.popups) {
    ctx.globalAlpha = Math.min(1, p.life * 2)
    ctx.fillText(p.text, p.x, p.y)
  }
  ctx.textAlign = 'left'
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
}

function hud(ctx: Ctx, game: Game) {
  ctx.fillStyle = INK
  ctx.font = `800 30px ${HAND}`
  const score = game.score.toLocaleString()
  const scoreWidth = ctx.measureText(score).width
  ctx.fillText(score, MARGIN + 16, 42)
  if (game.combo > 1) {
    ctx.fillStyle = RED
    ctx.font = `700 22px ${HAND}`
    ctx.fillText(`x${game.combo}`, MARGIN + 28 + scoreWidth, 42)
  }

  ctx.strokeStyle = INK
  ctx.fillStyle = '#fff'
  ctx.lineWidth = 1.5
  for (let i = 0; i < game.lives; i++) {
    planePath(ctx, W - 48 - i * 44, 30, 0.6)
    ctx.fill()
    ctx.stroke()
  }

  const full = game.meter >= 1
  const left = W / 2 - 130
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = MARKER
  ctx.fillRect(left, H - 30, 260 * game.meter, 14)
  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = RULE
  ctx.strokeRect(left, H - 30, 260, 14)
  ctx.fillStyle = full ? RED : INK
  ctx.font = `${full ? 700 : 400} 16px ${HAND}`
  ctx.textAlign = 'right'
  ctx.fillText(full ? 'Press X' : 'Shout', left - 12, H - 18)

  if (game.shushed) {
    ctx.textAlign = 'center'
    ctx.fillStyle = ENEMIES.shusher.color
    ctx.font = `600 18px ${HAND}`
    ctx.fillText('Shh! Slow fire and no shout until the librarian goes.', W / 2, 38)
  }
  ctx.textAlign = 'left'
}