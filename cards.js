// All the cards in the game. Add your own here — just copy a block and change the values.
// type: "monster" or "spell"

const MONSTER_TEMPLATES = [
  { name: "Ember Whelp", icon: "🔥", atk: 400, def: 200 },
  { name: "Stone Guardian", icon: "🗿", atk: 300, def: 600 },
  { name: "River Sprite", icon: "💧", atk: 350, def: 350 },
  { name: "Wind Falcon", icon: "🦅", atk: 500, def: 250 },
  { name: "Shadow Stalker", icon: "🐺", atk: 600, def: 300 },
  { name: "Iron Golem", icon: "🤖", atk: 450, def: 700 },
  { name: "Flame Serpent", icon: "🐍", atk: 700, def: 400 },
  { name: "Crystal Sentinel", icon: "💎", atk: 400, def: 800 },
  { name: "Storm Drake", icon: "🐲", atk: 900, def: 500 },
  { name: "Ancient Titan", icon: "⛰️", atk: 1200, def: 900 },
];

const SPELL_TEMPLATES = [
  {
    name: "Healing Potion",
    icon: "🧪",
    text: "Restore 800 Life Points.",
    effect: (game, playerIndex) => {
      game.players[playerIndex].lp += 800;
    },
  },
  {
    name: "Healing Potion",
    icon: "🧪",
    text: "Restore 800 Life Points.",
    effect: (game, playerIndex) => {
      game.players[playerIndex].lp += 800;
    },
  },
  {
    name: "Fireball",
    icon: "☄️",
    text: "Deal 300 damage directly to your opponent.",
    effect: (game, playerIndex) => {
      const opponent = game.players[1 - playerIndex];
      opponent.lp -= 300;
    },
  },
  {
    name: "Draw Two",
    icon: "📖",
    text: "Draw 2 extra cards from your deck.",
    effect: (game, playerIndex) => {
      game.drawCards(playerIndex, 2);
    },
  },
];

// Builds one full 20-card deck: two copies of each monster + the spells above.
function buildDeck() {
  const deck = [];
  let uid = 0;

  MONSTER_TEMPLATES.forEach((template) => {
    for (let copy = 0; copy < 2; copy++) {
      deck.push({
        id: `card-${uid++}`,
        type: "monster",
        name: template.name,
        icon: template.icon,
        atk: template.atk,
        def: template.def,
      });
    }
  });

  SPELL_TEMPLATES.forEach((template) => {
    deck.push({
      id: `card-${uid++}`,
      type: "spell",
      name: template.name,
      icon: template.icon,
      text: template.text,
      effect: template.effect,
    });
  });

  return deck;
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
