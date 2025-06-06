
let gameState = null;

function pollState() {
  fetch('backend/get_state.php')
    .then(res => res.json())
    .then(state => {
      if (JSON.stringify(state) !== JSON.stringify(gameState)) {
        gameState = state;
        updateUI();
      }
    });
}

function saveState() {
  fetch('backend/save_state.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameState)
  });
}

function claimSet(selectedCards, playerName) {
  // Check if the set is valid and unclaimed
  if (!isValidSet(selectedCards) || isAlreadyClaimed(selectedCards)) {
    alert("Invalid or already claimed set.");
    return;
  }

  // Update local state
  gameState.claimed_sets.push({
    set: selectedCards,
    player: playerName,
    time: Date.now()
  });
  gameState.scores[playerName] = (gameState.scores[playerName] || 0) + 1;

  saveState();
  updateUI();
}

function isAlreadyClaimed(selected) {
  return gameState.claimed_sets.some(claimed => 
    JSON.stringify(claimed.set.sort()) === JSON.stringify(selected.sort())
  );
}

function isValidSet(cards) {
  // Your Set-specific logic here
  return true; // placeholder
}

function updateUI() {
  // Render cards, claimed sets, scores, etc.
  console.log("Updated UI with", gameState);
}

// Game start: generate or load cards
function initializeGameIfNeeded() {
  if (!gameState) {
    gameState = {
      cards: generateDeck().slice(0, 12),
      claimed_sets: [],
      scores: {}
    };
    saveState();
  }
}

setInterval(pollState, 3000); //1500);
initializeGameIfNeeded();

