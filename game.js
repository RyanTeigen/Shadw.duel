// The whole game lives in this one object. Everything the screen shows
// comes from reading this object; every button click changes this object.
const game = {
  players: [
    { lp: 8000, deck: [], hand: [], field: [null, null, null, null, null], monsterPlayedThisTurn: false },
    { lp: 8000, deck: [], hand: [], field: [null, null, null, null, null], monsterPlayedThisTurn: false },
  ],
  currentPlayer: 0,
  turnNumber: 1,
  gameOver: false,
  winner: null,
  log: [],
  selectedAttacker: null, // index of the attacking monster on the current player's field, or null
};

function addLog(message) {
  game.log.unshift(message);
  if (game.log.length > 50) game.log.pop();
}

function drawCards(playerIndex, count) {
  const player = game.players[playerIndex];
  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) {
      endGame(1 - playerIndex, `Player ${playerIndex + 1} ran out of cards!`);
      return;
    }
    player.hand.push(player.deck.shift());
  }
}

function endGame(winnerIndex, reason) {
  if (game.gameOver) return;
  game.gameOver = true;
  game.winner = winnerIndex;
  addLog(reason);
  addLog(`Player ${winnerIndex + 1} wins!`);
}

function checkLifePoints() {
  if (game.players[0].lp <= 0) endGame(1, "Player 1 ran out of Life Points!");
  else if (game.players[1].lp <= 0) endGame(0, "Player 2 ran out of Life Points!");
}

function startGame() {
  game.players[0].deck = shuffle(buildDeck());
  game.players[1].deck = shuffle(buildDeck());
  drawCards(0, 5);
  drawCards(1, 5);
  drawCards(game.currentPlayer, 1); // first player's turn-start draw
  addLog("The duel begins! Player 1 goes first.");
  render();
}

function playMonster(cardId) {
  const player = game.players[game.currentPlayer];
  if (player.monsterPlayedThisTurn) {
    addLog("You already played a monster this turn.");
    return;
  }
  const emptySlot = player.field.findIndex((slot) => slot === null);
  if (emptySlot === -1) {
    addLog("Your field is full — no room for another monster.");
    return;
  }
  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return;
  const [card] = player.hand.splice(cardIndex, 1);
  player.field[emptySlot] = { card, summonSickness: true, hasAttacked: false };
  player.monsterPlayedThisTurn = true;
  addLog(`Player ${game.currentPlayer + 1} summoned ${card.name} (${card.atk} ATK / ${card.def} DEF).`);
  render();
}

function playSpell(cardId) {
  const player = game.players[game.currentPlayer];
  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return;
  const [card] = player.hand.splice(cardIndex, 1);
  addLog(`Player ${game.currentPlayer + 1} cast ${card.name}: ${card.text}`);
  card.effect(game, game.currentPlayer);
  checkLifePoints();
  render();
}

function selectAttacker(slotIndex) {
  const player = game.players[game.currentPlayer];
  const slot = player.field[slotIndex];
  if (!slot) return;
  if (slot.summonSickness) {
    addLog(`${slot.card.name} was just summoned and can't attack yet.`);
    return;
  }
  if (slot.hasAttacked) {
    addLog(`${slot.card.name} already attacked this turn.`);
    return;
  }
  game.selectedAttacker = game.selectedAttacker === slotIndex ? null : slotIndex;
  render();
}

function attackSlot(defenderSlotIndex) {
  if (game.selectedAttacker === null) return;
  const attackerIndex = game.currentPlayer;
  const defenderIndex = 1 - game.currentPlayer;
  const attackerSlot = game.players[attackerIndex].field[game.selectedAttacker];
  const defenderField = game.players[defenderIndex].field;
  const defenderHasMonsters = defenderField.some((s) => s !== null);

  if (defenderSlotIndex === null) {
    if (defenderHasMonsters) {
      addLog("Your opponent still has monsters — attack one of those, or attack an empty zone to go direct.");
      return;
    }
    game.players[defenderIndex].lp -= attackerSlot.card.atk;
    addLog(`${attackerSlot.card.name} attacks directly for ${attackerSlot.card.atk} damage!`);
    attackerSlot.hasAttacked = true;
    game.selectedAttacker = null;
    checkLifePoints();
    render();
    return;
  }

  const defenderSlot = defenderField[defenderSlotIndex];
  if (!defenderSlot) return;

  const a = attackerSlot.card;
  const d = defenderSlot.card;
  if (a.atk > d.atk) {
    const excess = a.atk - d.atk;
    addLog(`${a.name} (${a.atk}) destroys ${d.name} (${d.atk}) — ${excess} damage to Player ${defenderIndex + 1}.`);
    defenderField[defenderSlotIndex] = null;
    game.players[defenderIndex].lp -= excess;
  } else if (a.atk === d.atk) {
    addLog(`${a.name} and ${d.name} destroy each other!`);
    defenderField[defenderSlotIndex] = null;
    game.players[attackerIndex].field[game.selectedAttacker] = null;
  } else {
    const excess = d.atk - a.atk;
    addLog(`${d.name} (${d.atk}) destroys ${a.name} (${a.atk}) — ${excess} damage to Player ${attackerIndex + 1}.`);
    game.players[attackerIndex].field[game.selectedAttacker] = null;
    game.players[attackerIndex].lp -= excess;
  }

  if (attackerSlot) attackerSlot.hasAttacked = true;
  game.selectedAttacker = null;
  checkLifePoints();
  render();
}

function endTurn() {
  game.currentPlayer = 1 - game.currentPlayer;
  game.turnNumber++;
  game.selectedAttacker = null;
  const player = game.players[game.currentPlayer];
  player.monsterPlayedThisTurn = false;
  player.field.forEach((slot) => {
    if (slot) {
      slot.summonSickness = false;
      slot.hasAttacked = false;
    }
  });
  addLog(`— Player ${game.currentPlayer + 1}'s turn (${game.turnNumber}) —`);
  drawCards(game.currentPlayer, 1);
  render();
}

function restartGame() {
  game.players = [
    { lp: 8000, deck: [], hand: [], field: [null, null, null, null, null], monsterPlayedThisTurn: false },
    { lp: 8000, deck: [], hand: [], field: [null, null, null, null, null], monsterPlayedThisTurn: false },
  ];
  game.currentPlayer = 0;
  game.turnNumber = 1;
  game.gameOver = false;
  game.winner = null;
  game.log = [];
  game.selectedAttacker = null;
  startGame();
}

// ---------- Rendering ----------

function cardEl(card, extraClass) {
  const div = document.createElement("div");
  div.className = `card ${card.type} ${extraClass || ""}`;
  if (card.type === "monster") {
    div.innerHTML = `
      <div class="card-icon">${card.icon}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-stats">${card.atk} / ${card.def}</div>
    `;
  } else {
    div.innerHTML = `
      <div class="card-icon">${card.icon}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-text">${card.text}</div>
    `;
  }
  return div;
}

function render() {
  const me = game.currentPlayer;
  const opp = 1 - game.currentPlayer;

  document.getElementById("opponent-info").textContent = `Player ${opp + 1}: ${game.players[opp].lp} LP (${game.players[opp].deck.length} cards left)`;
  document.getElementById("player-info").textContent = `Player ${me + 1}: ${game.players[me].lp} LP (${game.players[me].deck.length} cards left)`;
  document.getElementById("turn-info").textContent = `Turn ${game.turnNumber} — Player ${me + 1}'s turn`;

  // Opponent hand: face-down, just a count
  const oppHand = document.getElementById("opponent-hand");
  oppHand.innerHTML = "";
  game.players[opp].hand.forEach(() => {
    const back = document.createElement("div");
    back.className = "card card-back";
    oppHand.appendChild(back);
  });

  // Opponent field
  const oppField = document.getElementById("opponent-field");
  oppField.innerHTML = "";
  game.players[opp].field.forEach((slot, index) => {
    const zone = document.createElement("div");
    zone.className = "zone";
    if (slot) {
      zone.appendChild(cardEl(slot.card));
    } else {
      zone.classList.add("empty");
    }
    if (game.selectedAttacker !== null) {
      zone.classList.add("targetable");
      zone.onclick = () => attackSlot(slot ? index : null);
    }
    oppField.appendChild(zone);
  });

  // Player field
  const playerField = document.getElementById("player-field");
  playerField.innerHTML = "";
  game.players[me].field.forEach((slot, index) => {
    const zone = document.createElement("div");
    zone.className = "zone";
    if (slot) {
      const el = cardEl(slot.card);
      if (slot.summonSickness || slot.hasAttacked) el.classList.add("dimmed");
      if (game.selectedAttacker === index) el.classList.add("selected");
      el.onclick = () => selectAttacker(index);
      zone.appendChild(el);
    } else {
      zone.classList.add("empty");
    }
    playerField.appendChild(zone);
  });

  // Player hand
  const playerHand = document.getElementById("player-hand");
  playerHand.innerHTML = "";
  game.players[me].hand.forEach((card) => {
    const el = cardEl(card, "playable");
    el.onclick = () => (card.type === "monster" ? playMonster(card.id) : playSpell(card.id));
    playerHand.appendChild(el);
  });

  // Log
  const log = document.getElementById("log");
  log.innerHTML = game.log.map((line) => `<div>${line}</div>`).join("");

  // Game over overlay
  const overlay = document.getElementById("game-over-overlay");
  if (game.gameOver) {
    document.getElementById("game-over-text").textContent = `Player ${game.winner + 1} wins!`;
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

document.getElementById("end-turn-btn").addEventListener("click", endTurn);
document.getElementById("restart-btn").addEventListener("click", restartGame);

startGame();
