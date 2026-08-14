# Shadow Duel

A simple, original two-player trading-card duel game you play in a browser
(pass the device back and forth — no login, no server-side game state).

## Files

- `package.json` — tells Node.js the project's name and how to start it.
- `server.js` — a tiny Express web server that serves the `public/` folder.
- `public/index.html` — the page structure (boards, hand, buttons).
- `public/style.css` — all the visual styling.
- `public/cards.js` — the list of cards in the game. Add new monsters or
  spells here — just copy an existing block and change the values.
- `public/game.js` — the game rules and logic (turns, attacks, win conditions).

## Rules (quick version)

- Each player starts at 8000 Life Points with a shuffled 24-card deck and a
  5-card hand.
- On your turn: draw 1 card, play up to 1 monster from your hand, play any
  number of spell cards, then attack with any monster that doesn't have
  "summoning sickness" (just-played monsters can't attack the turn they
  arrive).
- Attacking a monster compares ATK: the loser is destroyed and the
  difference in ATK is dealt as damage. If the opponent has no monsters,
  attack directly for full damage.
- You lose if your Life Points hit 0, or if you have to draw with an empty
  deck.

## Running it locally

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser.
