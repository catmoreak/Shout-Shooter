export type Controls = {
  move: number
  fire: boolean
  shout: boolean
}

export const IDLE: Controls = { move: 0, fire: false, shout: false }

const CAPTURED = ['ArrowUp', 'ArrowDown', 'Space']

export class Keyboard {
  private keys = new Set<string>()

  attach() {
    const down = (e: KeyboardEvent) => {
      this.keys.add(e.code)
      if (CAPTURED.includes(e.code)) e.preventDefault()
    }
    const up = (e: KeyboardEvent) => this.keys.delete(e.code)
    const blur = () => this.keys.clear()
    addEventListener('keydown', down)
    addEventListener('keyup', up)
    addEventListener('blur', blur)
    return () => {
      removeEventListener('keydown', down)
      removeEventListener('keyup', up)
      removeEventListener('blur', blur)
    }
  }

  read(): Controls {
    const up = this.keys.has('ArrowUp') || this.keys.has('KeyW')
    const down = this.keys.has('ArrowDown') || this.keys.has('KeyS')
    return {
      move: Number(down) - Number(up),
      fire: this.keys.has('Space'),
      shout: this.keys.has('KeyX'),
    }
  }
}
