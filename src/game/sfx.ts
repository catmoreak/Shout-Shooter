const VOLUME = 0.2

const AAH = [
  { freq: 850, gain: 1, q: 6 },
  { freq: 1250, gain: 0.55, q: 8 },
  { freq: 2650, gain: 0.3, q: 10 },
]

export class Sfx {
  private muted = false
  private ctx: AudioContext
  private master: GainNode
  private noiseBuf: AudioBuffer

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = VOLUME
    this.master.connect(ctx.destination)
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = this.noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }

  toggleMute() {
    this.muted = !this.muted
    this.master.gain.value = this.muted ? 0 : VOLUME
  }

  shoot() {
    this.tone(2200, 700, 0.045, 'square', 0.035)
  }

  explode(big: boolean) {
    const dur = big ? 0.6 : 0.25
    this.noise(dur, big ? 0.9 : 0.45, big ? 2400 : 3200)
    if (big) this.tone(160, 40, dur, 'sine', 0.6)
  }

  hit() {
    this.tone(420, 50, 0.4, 'sawtooth', 0.35)
    this.noise(0.35, 0.6, 1800)
  }

  blast() {
    this.shout()
    this.tone(90, 25, 1, 'sine', 0.5)
    this.noise(1, 0.4, 5000)
  }

  private shout() {
    if (this.muted) return
    const t = this.ctx.currentTime
    const end = t + 0.8

    const voice = this.ctx.createOscillator()
    voice.type = 'sawtooth'
    voice.frequency.setValueAtTime(170, t)
    voice.frequency.linearRampToValueAtTime(250, t + 0.12)
    voice.frequency.exponentialRampToValueAtTime(140, end)

    const wobble = this.ctx.createOscillator()
    const depth = this.ctx.createGain()
    wobble.frequency.value = 7
    depth.gain.value = 6
    wobble.connect(depth).connect(voice.frequency)

    const level = this.ctx.createGain()
    level.gain.setValueAtTime(0.0001, t)
    level.gain.exponentialRampToValueAtTime(4, t + 0.06)
    level.gain.setValueAtTime(4, t + 0.45)
    level.gain.exponentialRampToValueAtTime(0.0001, end)
    level.connect(this.master)

    for (const { freq, gain, q } of AAH) {
      const band = this.ctx.createBiquadFilter()
      const amount = this.ctx.createGain()
      band.type = 'bandpass'
      band.frequency.value = freq
      band.Q.value = q
      amount.gain.value = gain
      voice.connect(band).connect(amount).connect(level)
    }

    const breath = this.ctx.createBufferSource()
    const hiss = this.ctx.createBiquadFilter()
    const air = this.ctx.createGain()
    breath.buffer = this.noiseBuf
    hiss.type = 'bandpass'
    hiss.frequency.value = 1800
    air.gain.setValueAtTime(0.6, t)
    air.gain.exponentialRampToValueAtTime(0.08, t + 0.1)
    breath.connect(hiss).connect(air).connect(level)

    for (const node of [voice, wobble, breath]) {
      node.start(t)
      node.stop(end)
    }
  }

  private envelope(vol: number, dur: number) {
    const t = this.ctx.currentTime
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    gain.connect(this.master)
    return gain
  }

  private tone(from: number, to: number, dur: number, type: OscillatorType, vol: number) {
    if (this.muted) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(to, t + dur)
    osc.connect(this.envelope(vol, dur))
    osc.start(t)
    osc.stop(t + dur)
  }

  private noise(dur: number, vol: number, cutoff: number) {
    if (this.muted) return
    const t = this.ctx.currentTime
    const src = this.ctx.createBufferSource()
    const filter = this.ctx.createBiquadFilter()
    src.buffer = this.noiseBuf
    filter.frequency.setValueAtTime(cutoff, t)
    filter.frequency.exponentialRampToValueAtTime(80, t + dur)
    src.connect(filter).connect(this.envelope(vol, dur))
    src.start(t)
    src.stop(t + dur)
  }
}
