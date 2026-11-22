import doodle from '../assets/doodle.svg'

type Props = {
  best: number
  onPlay: () => void
}

export default function Menu({ best, onPlay }: Props) {
  return (
    <section className="sheet">
      <h1 className="title">Shout Shooter</h1>
      <p className="lede">A paper plane against a page full of scribbles.</p>

      <div className="actions">
        <button className="primary" onClick={onPlay} autoFocus>
          Play
        </button>
      </div>

      <ul className="notes">
        <li>Arrow keys or W and S to move.</li>
        <li>Hold space to fire.</li>
        <li>Fill the meter, then press X to shout and wipe the screen.</li>
        <li>Shoot the librarian fast. While it's around you fire slower and can't shout.</li>
      </ul>

      <p className="small">P pauses and M mutes.</p>

      {best > 0 && <p className="best">Best: {best.toLocaleString()}</p>}
      <img className="doodle" src={doodle} alt="" />
    </section>
  )
}
