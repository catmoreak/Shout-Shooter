import { useState } from 'react'
import Menu from './game/Menu'

function App() {
  const [best, setBest] = useState(0)

  const handlePlay = () => {
    
  }

  return (
    <>
      <Menu best={best} onPlay={handlePlay} />
    </>
  )
}

export default App
