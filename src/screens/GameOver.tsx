type Props = {
  score: number
  best: number
  onAgain: () => void
  onMenu: () => void
}

export default function GameOver({ score, best, onAgain, onMenu }: Props) {
  const record = score > 0 && score >= best

  return (
    <div className="overlay">
      <div className="card">
        <p>Game over</p>
        <p className="final">{score.toLocaleString()}</p>
        <p className="best">{record ? 'New best score' : `Best: ${best.toLocaleString()}`}</p>
        <div className="actions">
          <button className="primary" onClick={onAgain}>
            Play again
          </button>
          <button className="link" onClick={onMenu}>
            Back to menu
          </button>
        </div>
      </div>
    </div>
  )
}