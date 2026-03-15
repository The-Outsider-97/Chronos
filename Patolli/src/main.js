const POSITIONS = [
  [50, 8], [58, 14], [66, 20], [74, 28], [82, 36], [88, 44],
  [92, 50], [88, 56], [82, 64], [74, 72], [66, 80], [58, 86],
  [50, 92], [42, 86], [34, 80], [26, 72], [18, 64], [12, 56],
  [8, 50], [12, 44], [18, 36], [26, 28], [34, 20], [42, 14]
];

const WIN_SCORE = 20;

const state = {
  turn: 'red',
  red: { index: 0, lap: 0, score: 0 },
  blue: { index: 12, lap: 0, score: 0 },
  pendingRoll: null,
  winner: null
};

const refs = {
  turnName: document.getElementById('turn-name'),
  winnerBanner: document.getElementById('winner-banner'),
  redCard: document.getElementById('red-card'),
  blueCard: document.getElementById('blue-card'),
  redRunner: document.getElementById('red-runner'),
  blueRunner: document.getElementById('blue-runner'),
  redScore: document.getElementById('red-score'),
  blueScore: document.getElementById('blue-score'),
  redLap: document.getElementById('red-lap'),
  blueLap: document.getElementById('blue-lap'),
  redHome: document.getElementById('red-home'),
  blueHome: document.getElementById('blue-home'),
  rollBtn: document.getElementById('roll-btn'),
  moveBtn: document.getElementById('move-btn'),
  lastRoll: document.getElementById('last-roll'),
  beanPips: document.querySelectorAll('#bean-pips span'),
  log: document.getElementById('log')
};

function setRunnerPosition(color) {
  const [x, y] = POSITIONS[state[color].index];
  const node = color === 'red' ? refs.redRunner : refs.blueRunner;
  node.style.left = `${x}%`;
  node.style.top = `${y}%`;
}

function setBeanPips(value = 0) {
  refs.beanPips.forEach((pip, index) => {
    pip.classList.toggle('active', index < value);
  });
}

function appendLog(message) {
  const entry = document.createElement('p');
  entry.textContent = message;
  refs.log.prepend(entry);
}

function syncUi() {
  refs.turnName.textContent = state.turn.toUpperCase();
  refs.turnName.className = state.turn === 'red' ? 'red-turn' : 'blue-turn';
  refs.redCard.classList.toggle('active', state.turn === 'red');
  refs.blueCard.classList.toggle('active', state.turn === 'blue');

  refs.redScore.textContent = String(state.red.score);
  refs.blueScore.textContent = String(state.blue.score);
  refs.redLap.textContent = String(state.red.lap);
  refs.blueLap.textContent = String(state.blue.lap);
  refs.redHome.textContent = String(Math.max(0, 6 - state.red.lap));
  refs.blueHome.textContent = String(Math.max(0, 6 - state.blue.lap));

  if (state.winner) {
    refs.winnerBanner.textContent = `${state.winner.toUpperCase()} CLAIMED THE RITUAL`;
    refs.winnerBanner.classList.remove('hidden');
  }

  setRunnerPosition('red');
  setRunnerPosition('blue');
}

function nextTurn() {
  state.pendingRoll = null;
  refs.moveBtn.disabled = true;
  state.turn = state.turn === 'red' ? 'blue' : 'red';
  setBeanPips(0);
  syncUi();
}

function completeGame() {
  refs.rollBtn.disabled = true;
  refs.moveBtn.disabled = true;
  state.winner = state.turn;
}

function applyRoll() {
  if (!state.pendingRoll || state.winner) return;

  const mover = state[state.turn];
  const foeColor = state.turn === 'red' ? 'blue' : 'red';
  const foe = state[foeColor];
  const oldIndex = mover.index;

  mover.index = (mover.index + state.pendingRoll) % POSITIONS.length;
  if (mover.index <= oldIndex) {
    mover.lap += 1;
    mover.score += 5;
    appendLog(`${state.turn.toUpperCase()} completed a sacred loop (+5).`);
  }

  if (mover.index === foe.index) {
    foe.index = foeColor === 'red' ? 0 : 12;
    mover.score += 2;
    appendLog(`${state.turn.toUpperCase()} captured ${foeColor.toUpperCase()} (+2).`);
  }

  appendLog(`${state.turn.toUpperCase()} advanced ${state.pendingRoll} spaces.`);

  if (mover.score >= WIN_SCORE) {
    appendLog(`${state.turn.toUpperCase()} wins the match!`);
    completeGame();
    setBeanPips(state.pendingRoll);
    syncUi();
    return;
  }

  nextTurn();
}

refs.rollBtn.addEventListener('click', () => {
  if (state.pendingRoll || state.winner) return;
  state.pendingRoll = Math.ceil(Math.random() * 5);
  refs.lastRoll.textContent = `Roll: ${state.pendingRoll}`;
  setBeanPips(state.pendingRoll);
  refs.moveBtn.disabled = false;
  appendLog(`${state.turn.toUpperCase()} cast beans for ${state.pendingRoll}.`);
});

refs.moveBtn.addEventListener('click', applyRoll);

setBeanPips(0);
syncUi();
appendLog('Match started. Red takes the first cast.');
