// Game configuration
const snakes = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

const ladders = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

let currentPlayer = 1;
let positions = {};
let gameOver = false;
let numberOfPlayers = 0;
let soundEnabled = true;

// Sound effects
const sounds = {
  diceRoll: new Audio(
    "./dice.mp3"
  ),
  playerMove: new Audio(
    "./move.mp3"
  ),
  snakeBite: new Audio(
    "./snake.mp3"
  ),
  ladderClimb: new Audio(
    "./ladder.mp3"
  ),
  winGame: new Audio(
    "./win.mp3"
  ),
  turnChange: new Audio(
    "./turn.mp3"
  ),
};

// Preload sounds
Object.values(sounds).forEach((sound) => {
  sound.preload = "auto";
  sound.load();
});

// Theme toggle functionality
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  // Save preference to localStorage
  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("darkTheme", isDark);
  // Update button emoji
  themeToggle.innerHTML = isDark
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun-icon lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon-icon lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
});

// Sound toggle functionality
const soundToggle = document.getElementById("soundToggle");
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  // Save preference to localStorage
  localStorage.setItem("soundEnabled", soundEnabled);
  // Update button icon
  soundToggle.innerHTML = soundEnabled
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="22" x2="16" y1="9" y2="15" />
              <line x1="16" x2="22" y1="9" y2="15" />
            </svg>`;
});

// Check for saved theme preference
if (localStorage.getItem("darkTheme") === "true") {
  document.body.classList.add("dark-theme");
  themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon-icon lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
}

// Check for saved sound preference
if (localStorage.getItem("soundEnabled") === "false") {
  soundEnabled = false;
  soundToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" x2="16" y1="9" y2="15" />
          <line x1="16" x2="22" y1="9" y2="15" />
        </svg>`;
}

// Play sound function
function playSound(soundName) {
  if (!soundEnabled) return;

  // Stop and rewind the sound if it's already playing
  sounds[soundName].pause();
  sounds[soundName].currentTime = 0;

  // Play the sound
  sounds[soundName].play().catch((e) => console.log("Sound play failed:", e));
}

// Start game with selected number of players
function startGame(players) {
  numberOfPlayers = players;
  positions = {};

  // Initialize positions for all players
  for (let i = 1; i <= players; i++) {
    positions[i] = 1;
  }

  // Hide player selection and show game
  document.getElementById("playerSelection").classList.add("hidden");
  document.getElementById("gameContainer").classList.remove("hidden");

  // Create players info
  createPlayersInfo();

  // Reset and start game
  resetGame();
  createBoard();
}

// Create players info display
function createPlayersInfo() {
  const playersInfo = document.getElementById("playersInfo");
  playersInfo.innerHTML = "";

  for (let i = 1; i <= numberOfPlayers; i++) {
    const playerDiv = document.createElement("div");
    playerDiv.className = "player-info"; // No highlight here - we'll handle it separately

    const playerColor = document.createElement("div");
    playerColor.className = `player-color player${i}`;

    const playerText = document.createElement("span");
    playerText.textContent = `Player ${i}`;

    playerDiv.appendChild(playerColor);
    playerDiv.appendChild(playerText);
    playersInfo.appendChild(playerDiv);
  }
  
  // Highlight the first player
  if (numberOfPlayers > 0) {
    document.querySelector('.player-info').classList.add('current-player');
  }
}

// Create board
function createBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let i = 100; i >= 1; i--) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i;

    // Check for snakes
    if (snakes[i]) {
      cell.classList.add("snake-start");
      const indicator = document.createElement("span");
      indicator.className = "cell-indicator snake-indicator";
      indicator.textContent = `→${snakes[i]}`;
      cell.appendChild(indicator);
    }

    // Check for snake endpoints
    Object.entries(snakes).forEach(([start, end]) => {
      if (parseInt(end) === i) {
        cell.classList.add("snake-end");
      }
    });

    // Check for ladders
    if (ladders[i]) {
      cell.classList.add("ladder-start");
      const indicator = document.createElement("span");
      indicator.className = "cell-indicator ladder-indicator";
      indicator.textContent = `→${ladders[i]}`;
      cell.appendChild(indicator);
    }

    // Check for ladder endpoints
    Object.entries(ladders).forEach(([start, end]) => {
      if (parseInt(end) === i) {
        cell.classList.add("ladder-end");
      }
    });

    board.appendChild(cell);
  }
  updatePlayerPositions();
}

// Update player positions on the board
function updatePlayerPositions() {
  const existingPlayers = document.querySelectorAll(".player");
  existingPlayers.forEach((player) => player.remove());

  Object.entries(positions).forEach(([player, position]) => {
    const cell = document.querySelector(`.cell:nth-child(${101 - position})`);
    if (cell) {
      const playerDiv = document.createElement("div");
      playerDiv.className = `player player${player}`;
      cell.appendChild(playerDiv);
    }
  });
}

// Handle dice roll
function rollDice() {
  if (gameOver) return;

  playSound("diceRoll");
  const dice = document.getElementById("dice");
  dice.classList.add("rolling");

  // Disable dice during animation
  dice.style.pointerEvents = "none";

  setTimeout(() => {
    const roll = Math.floor(Math.random() * 6) + 1;
    dice.classList.remove("rolling");
    dice.setAttribute("data-value", roll);

    // Re-enable dice after animation
    dice.style.pointerEvents = "auto";

    movePlayer(roll);
  }, 600);
}

// Move player
function movePlayer(spaces) {
  const currentPosition = positions[currentPlayer];
  const newPosition = currentPosition + spaces;

  // Play move sound
  playSound("playerMove");

  // Check if new position would exceed 100
  if (newPosition > 100) {
    updatePlayerPositions();
    changeTurn(); 
    return;
  }

  // Move player to new position
  positions[currentPlayer] = newPosition;

  // Check for snakes
  if (snakes[newPosition]) {
    playSound("snakeBite");
    positions[currentPlayer] = snakes[newPosition];
  }

  // Check for ladders
  if (ladders[newPosition]) {
    playSound("ladderClimb");
    positions[currentPlayer] = ladders[newPosition];
  }

  updatePlayerPositions();

  // Check for win (exactly 100)
  if (positions[currentPlayer] === 100) {
    gameOver = true;
    playSound("winGame");
    document.getElementById("currentPlayer").textContent = `Player ${currentPlayer} wins!`;
    document.getElementById("dice").style.pointerEvents = "none";
    return;
  }

  // Only change turn if game is not over
  if (!gameOver) {
    changeTurn(); // Use our new turn change function
  }
}

function changeTurn() {
  playSound("turnChange");
  // Remove highlight from current player
  const currentPlayerElement = document.querySelector(`.player-info:nth-child(${currentPlayer})`);
  if (currentPlayerElement) {
    currentPlayerElement.classList.remove('current-player');
  }
  
  // Move to next player
  currentPlayer = (currentPlayer % numberOfPlayers) + 1;
  
  // Update UI
  document.getElementById("currentPlayer").textContent = `Player ${currentPlayer}`;
  
  // Add highlight to new current player
  const newPlayerElement = document.querySelector(`.player-info:nth-child(${currentPlayer})`);
  if (newPlayerElement) {
    newPlayerElement.classList.add('current-player');
  }
}

// update player highlight
function updatePlayerHighlight() {
  const playerInfos = document.querySelectorAll('.player-info');
  playerInfos.forEach((info, index) => {
    const playerNumber = index + 1;
    if (playerNumber === currentPlayer) {
      info.classList.add('current-player');
    } else {
      info.classList.remove('current-player');
    }
  });
}

// Reset game
function resetGame() {
  for (let i = 1; i <= numberOfPlayers; i++) {
    positions[i] = 1;
  }
  currentPlayer = 1;
  gameOver = false;
  document.getElementById("currentPlayer").textContent = "Player 1";
  document.getElementById("dice").setAttribute("data-value", "1");
  document.getElementById("dice").style.pointerEvents = "auto";
  updatePlayerPositions();
  
  // Reset player highlights
  document.querySelectorAll('.player-info').forEach((el, index) => {
    if (index === 0) { // First player (Player 1)
      el.classList.add('current-player');
    } else {
      el.classList.remove('current-player');
    }
  });
}

// Initialize event listeners
document.getElementById("dice").addEventListener("click", rollDice);
document.getElementById("resetButton").addEventListener("click", resetGame);
