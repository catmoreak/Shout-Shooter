import { clamp, rand } from '../utils/math'
import { BOTTOM, H, INK, PLAYER_X, RED, TOP, W } from './constants'
import type { Controls } from './controls'
import { ENEMIES, createEnemy, pickKind } from './enemies'
import type { Sfx } from './sfx'
import type { Bullet, Enemy, Particle, Popup, Ring } from './types'

const SPEED = 420
const FIRE_DELAY = 0.14

export class Game {
  score = 0
  lives = 3
  streak = 0
  meter = 0
  time = 0
  over = false
  shushed = false
  y = H / 2
  invuln = 0
  shake = 0
  enemies: Enemy[] = []
  bullets: Bullet[] = []
  particles: Particle[] = []
  rings: Ring[] = []
  popups: Popup[] = []
  scroll = 0

  private sfx: Sfx
  private cooldown = 0
  private spawnIn = 1

  constructor(sfx: Sfx) {
    this.sfx = sfx
  }

  get combo() {
    return Math.min(8, 1 + Math.floor(this.streak / 6))
  }

  update(dt: number, input: Controls) {
    this.time += dt
    this.shake = Math.max(0, this.shake - dt * 40)
    this.drift(dt)
    if (this.over) return

    this.invuln -= dt
    this.shushed = this.enemies.some((e) => e.kind === 'shusher' && e.x < W)
    this.y = clamp(this.y + input.move * SPEED * dt, TOP + 16, BOTTOM - 16)

    this.fire(dt, input.fire)
    if (input.shout && this.meter >= 1 && !this.shushed) this.blast()
    this.spawn(dt)
    this.moveEnemies(dt)
    this.moveBullets(dt)
    this.moveRings(dt)
    this.collide()
    this.sweep()
  }

  private fire(dt: number, held: boolean) {
    this.cooldown -= dt
    if (!held || this.cooldown > 0) return
    this.bullets.push({ x: PLAYER_X + 26, y: this.y, vx: 950, vy: 0, r: 5, hostile: false, dead: false })
    this.cooldown = this.shushed ? FIRE_DELAY * 2.5 : FIRE_DELAY
    this.sfx.shoot()
  }

  private blast() {
    this.meter = 0
    this.shake = 18
    this.rings.push({ x: PLAYER_X, y: this.y, r: 0, hit: new Set() })
    for (const b of this.bullets) {
      if (!b.hostile) continue
      b.dead = true
      this.burst(b.x, b.y, RED, 4)
    }
    this.sfx.blast()
  }

  private spawn(dt: number) {
    this.spawnIn -= dt
    if (this.spawnIn > 0) return
    const kind = pickKind(this.time, this.enemies.some((e) => e.kind === 'shusher'))
    this.enemies.push(createEnemy(kind, this.time))
    this.spawnIn = Math.max(0.32, 1.25 - this.time * 0.01) * rand(0.7, 1.3)
  }

  private moveEnemies(dt: number) {
    for (const e of this.enemies) {
      e.t += dt
      e.flash -= dt
      if (e.kind === 'drifter') {
        e.x += e.vx * dt
      } else if (e.kind === 'waver') {
        e.x += e.vx * dt
        e.y = e.baseY + Math.sin(e.t * 3.2) * 70
      } else {
        const gunner = e.kind === 'gunner'
        const stay = gunner ? 9 : 14
        e.x = e.t < stay ? e.x + (e.holdX - e.x) * Math.min(1, dt * 2) : e.x - 380 * dt
        e.y = gunner ? e.baseY + Math.sin(e.t * 1.4) * 90 : e.baseY + Math.sin(e.t * 0.8) * 50
        if (gunner && e.t < stay) this.aim(e, dt)
      }
      e.y = clamp(e.y, TOP + e.r, BOTTOM - e.r)
      if (e.x < -60) e.dead = true
    }
  }

  private aim(e: Enemy, dt: number) {
    e.cooldown -= dt
    if (e.cooldown > 0 || e.x > W - 20) return
    const angle = Math.atan2(this.y - e.y, PLAYER_X - e.x)
    this.bullets.push({
      x: e.x - e.r,
      y: e.y,
      vx: Math.cos(angle) * 330,
      vy: Math.sin(angle) * 330,
      r: 6,
      hostile: true,
      dead: false,
    })
    e.cooldown = 1.8 - Math.min(0.8, this.time * 0.006)
  }

  private moveBullets(dt: number) {
    for (const b of this.bullets) {
      b.x += b.vx * dt
      b.y += b.vy * dt
      if (b.x < -20 || b.x > W + 20 || b.y < 0 || b.y > H) b.dead = true
    }
  }

  private moveRings(dt: number) {
    for (const ring of this.rings) {
      ring.r += 1500 * dt
      for (const e of this.enemies) {
        if (e.dead || ring.hit.has(e) || Math.hypot(e.x - ring.x, e.y - ring.y) > ring.r + e.r) continue
        ring.hit.add(e)
        this.damage(e, 8)
      }
    }
  }

  private collide() {
    for (const b of this.bullets) {
      if (b.dead) continue
      if (b.hostile) {
        if (this.invuln <= 0 && Math.hypot(b.x - PLAYER_X, b.y - this.y) < b.r + 12) {
          b.dead = true
          this.hurt()
        }
        continue
      }
      const target = this.enemies.find((e) => !e.dead && Math.hypot(b.x - e.x, b.y - e.y) < b.r + e.r)
      if (!target) continue
      b.dead = true
      this.damage(target, 1)
    }

    for (const e of this.enemies) {
      if (e.dead || this.invuln > 0 || Math.hypot(e.x - PLAYER_X, e.y - this.y) > e.r + 14) continue
      if (e.kind !== 'shusher') e.dead = true
      this.hurt()
    }
  }

  private damage(e: Enemy, amount: number) {
    e.hp -= amount
    e.flash = 0.08
    if (e.hp > 0) return
    e.dead = true
    this.streak++
    const points = ENEMIES[e.kind].points * this.combo
    this.score += points
    this.meter = Math.min(1, this.meter + (e.kind === 'shusher' ? 0.5 : 0.08))
    this.popups.push({ x: e.x, y: e.y, text: `+${points}`, life: 0.8 })
    this.burst(e.x, e.y, ENEMIES[e.kind].color, e.r > 25 ? 40 : 18)
    this.sfx.explode(e.r > 25)
  }

  private hurt() {
    this.lives--
    this.invuln = 1.8
    this.streak = 0
    this.shake = 14
    this.burst(PLAYER_X, this.y, INK, 24)
    this.sfx.hit()
    if (this.lives > 0) return
    this.over = true
    this.burst(PLAYER_X, this.y, INK, 80)
  }

  private burst(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2)
      const speed = rand(60, 360)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.4, 0.9),
        size: rand(1.5, 3.5),
        color,
      })
    }
  }

  private drift(dt: number) {
    this.scroll += 140 * dt
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 1 - dt * 2
      p.vy *= 1 - dt * 2
      p.life -= dt
    }
    for (const p of this.popups) {
      p.y -= 40 * dt
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)
    this.popups = this.popups.filter((p) => p.life > 0)
  }

  private sweep() {
    this.enemies = this.enemies.filter((e) => !e.dead)
    this.bullets = this.bullets.filter((b) => !b.dead)
    this.rings = this.rings.filter((r) => r.r < 1500)
  }
}
