const POSITIONS = [
  [50, 7], [57, 14], [64, 21], [71, 28], [78, 35], [85, 42],
  [92, 50], [85, 58], [78, 65], [71, 72], [64, 79], [57, 86],
  [50, 93], [43, 86], [36, 79], [29, 72], [22, 65], [15, 58],
  [8, 50], [15, 42], [22, 35], [29, 28], [36, 21], [43, 14]
];

const state = {
  turn: 'red',
  red: { index: 0, lap: 0, score: 0 },
  blue: { index: 12, lap: 0, score: 0 },
  pendingRoll: null
};

const refs = {
  turnName: document.getElementById('turn-name'),
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
  log: document.getElementById('log')
};

function setRunnerPosition(color) {
  const [x, y] = POSITIONS[state[color].index];
  const node = color === 'red' ? refs.redRunner : refs.blueRunner;
  node.style.left = `${x}%`;
  node.style.top = `${y}%`;
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

  setRunnerPosition('red');
  setRunnerPosition('blue');
}

function nextTurn() {
  state.pendingRoll = null;
  refs.moveBtn.disabled = true;
  state.turn = state.turn === 'red' ? 'blue' : 'red';
  syncUi();
}

function applyRoll() {
  if (!state.pendingRoll) return;
  const mover = state[state.turn];
  const foeColor = state.turn === 'red' ? 'blue' : 'red';
  const foe = state[foeColor];

  const oldIndex = mover.index;
  mover.index = (mover.index + state.pendingRoll) % POSITIONS.length;
  if (mover.index <= oldIndex) {
    mover.lap += 1;
    mover.score += 5;
    appendLog(`${state.turn.toUpperCase()} completed a lap (+5 points).`);
  }

  if (mover.index === foe.index) {
    foe.index = foeColor === 'red' ? 0 : 12;
    mover.score += 2;
    appendLog(`${state.turn.toUpperCase()} captured ${foeColor.toUpperCase()} (+2 points).`);
  }

  appendLog(`${state.turn.toUpperCase()} advanced ${state.pendingRoll} spaces.`);

  if (mover.score >= 20) {
    appendLog(`${state.turn.toUpperCase()} wins the match!`);
    refs.rollBtn.disabled = true;
    refs.moveBtn.disabled = true;
  } else {
    nextTurn();
  }

  syncUi();
}

refs.rollBtn.addEventListener('click', () => {
  if (state.pendingRoll) return;
  state.pendingRoll = Math.ceil(Math.random() * 5);
  refs.lastRoll.textContent = `Roll: ${state.pendingRoll}`;
  refs.moveBtn.disabled = false;
  appendLog(`${state.turn.toUpperCase()} cast beans for ${state.pendingRoll}.`);
});

refs.moveBtn.addEventListener('click', applyRoll);

syncUi();
appendLog('Match started. Red takes the first cast.');
