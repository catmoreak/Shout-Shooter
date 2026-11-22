import { useCallback, useEffect, useState } from 'react'
import { Sfx } from './game/sfx'
import GameOver from './screens/GameOver'
import Menu from './screens/Menu'
import Play from './screens/Play'
import { load, save } from './utils/storage'

type Screen = 'menu' | 'play' | 'over'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [sfx, setSfx] = useState<Sfx | null>(null)
  const [best, setBest] = useState(() => load('best', 0))
  const [score, setScore] = useState(0)
  const [run, setRun] = useState(0)

  useEffect(() => save('best', best), [best])

  function play() {
    if (!sfx) setSfx(new Sfx(new AudioContext()))
    setRun((r) => r + 1)
    setScreen('play')
  }

  const finish = useCallback((final: number) => {
    setScore(final)
    setBest((b) => Math.max(b, final))
    setScreen('over')
  }, [])

  const toMenu = useCallback(() => setScreen('menu'), [])

  return (
    <main className="app">
      {screen === 'menu' && <Menu best={best} onPlay={play} />}
      {screen === 'play' && sfx && <Play key={run} sfx={sfx} onOver={finish} onQuit={toMenu} />}
      {screen === 'over' && <GameOver score={score} best={best} onAgain={play} onMenu={toMenu} />}
    </main>
  )
}
