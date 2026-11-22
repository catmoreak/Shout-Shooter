# Shout Shooter

A side-scrolling shooter that runs to fly a paper plane across a notebook page and shoot down the scribbles coming at you. When things get too crowded you can shout  and clear the whole screen (You get poinst for shouting here :)

## About The Game

The idea was a shooter made out of paper plane  that looks like it was drawn in the pages  of a school notebook. Everything is drawn on lined paper in pen and highlighter colours .The game is designed to be simple and easy to pick up, but hard to master.Your goal is get points by shooting down the enemies coming at you

You get 3 lives. Enemies keep coming from the right and the game slowly gets faster and harder the longer you survive. Every kill fills up your shout meter. Once it's full you can press X to let out a shout, which sends a shockwave across the screen, hits every enemy in its way and wipes out enemy bullets.




## Screenshots

![Main Menu](src/assets/Screenshot%202026-11-22%20223013.png)
![Gameplay](src/assets/Screenshot%202026-11-22%20222621.png)
![Game Over](src/assets/Screenshot%202026-11-22%20223003.png)

## Installation

You'll need [Node.js](https://nodejs.org/) installed.

1. Clone the repo

   ```
   git clone https://github.com/catmoreak/Shout-Shooter.git
   cd Shout-Shooter
   ```

2. Install the dependencies

   ```
   npm install
   ```

3. Start it up

   ```
   npm run dev
   ```

4. Open the link it gives you (usually http://localhost:5173) and enjoy!

If you want a build you can host somewhere, run `npm run build` and the files will end up in the `dist` folder.

## Controls

| Actions | Keybind |
| --- | --- |
| Move Up / Down | W / S or Arrow Keys |
| Shoot (Hold) | Space |
| Shout (When the meter is full) | X |
| Pause | P or Esc |
| Mute | M |

## File Structure

```
Shout-Shooter/
├── public/              
├── src/
│   ├── assets/          
│   ├── game/            
│   ├── utils/           
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

Made with React, TypeScript and Vite. The game itself is drawn on a plain HTML canvas.

## Feedback

Any feedback regarding bugs, balance or anything that feels off can be posted in the Issues tab of the repository.

Thank You!
