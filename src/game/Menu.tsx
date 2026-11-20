import doodle from '../assets/doodle.svg'

type Props = {
  best: number
  onPlay: () => void
}

export default function Menu({ best, onPlay }: Props) {
  return (
    <section className="sheet">
      <h1 className="title">Shout Shooter</h1>

      <div className="actions">
        <button className="primary" onClick={onPlay} autoFocus>
          Play
        </button>
      </div>

      {best > 0 && <p className="best">Best: {best.toLocaleString()}</p>}
      <img className="doodle" src={doodle} alt="" />
    </section>
  )
}