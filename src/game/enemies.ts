import { rand } from '../utils/math'
import { BOTTOM, TOP, W } from './constants'
import type { Enemy, Kind } from './types'

export const ENEMIES: Record<Kind, { hp: number; r: number; points: number; color: string }> = {
  drifter: { hp: 1, r: 16, points: 100, color: '#c8372d' },
  waver: { hp: 1, r: 15, points: 150, color: '#d7802a' },
  gunner: { hp: 3, r: 22, points: 300, color: '#8a2b22' },
  shusher: { hp: 10, r: 34, points: 800, color: '#2f6b4f' },
}

export function pickKind(time: number, shusherAlive: boolean): Kind {
  const table: [Kind, number][] = [
    ['drifter', 1],
    ['waver', time > 12 ? 0.9 : 0],
    ['gunner', time > 30 ? 0.45 + time * 0.002 : 0],
    ['shusher', time > 55 && !shusherAlive ? 0.12 : 0],
  ]
  let roll = Math.random() * table.reduce((sum, [, w]) => sum + w, 0)
  for (const [kind, w] of table) {
    roll -= w
    if (roll < 0) return kind
  }
  return 'drifter'
}

export function createEnemy(kind: Kind, time: number): Enemy {
  const { hp, r } = ENEMIES[kind]
  const speed = Math.min(2.2, 1 + time * 0.008)
  const y = rand(TOP + 40, BOTTOM - 40)
  return {
    kind,
    hp,
    r,
    x: W + r + 10,
    y,
    baseY: y,
    vx: -rand(150, 220) * speed,
    holdX: rand(980, 1120),
    t: 0,
    cooldown: rand(0.8, 1.6),
    flash: 0,
    dead: false,
  }
}

