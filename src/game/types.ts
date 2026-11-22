export type Kind = 'drifter' | 'waver' | 'gunner' | 'shusher'

export type Enemy = {
  kind: Kind
  x: number
  y: number
  baseY: number
  vx: number
  holdX: number
  t: number
  hp: number
  r: number
  cooldown: number
  flash: number
  dead: boolean
}

export type Bullet = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hostile: boolean
  dead: boolean
}

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

export type Ring = {
  x: number
  y: number
  r: number
  hit: Set<Enemy>
}

export type Popup = {
  x: number
  y: number
  text: string
  life: number
}
