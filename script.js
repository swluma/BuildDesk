const BOARD_SIZE = 8;
const MAX_RACK = 3;
const GAME_DURATION = 180;
const SPECIAL_SPAWN_CHANCE = 0.05;
const RESUME_COUNTDOWN = 3;
const INVALID_FLASH_MS = 3000;
const SUCCESS_FLASH_MS = 1000;
const PLACED_NORMAL = 'normal';
const PLACED_SPECIAL = 'special';

const COLORS = [
  '#62d8ff', '#ff7da7', '#ffd36b', '#a78bff', '#6ff1b8', '#ff9f50', '#82f06d', '#4fd2ff', '#ff89f3'
];

const SHAPES = [
  { id: 'single', cells: [[0, 0]] },
  { id: 'dominoH', cells: [[0, 0], [1, 0]] },
  { id: 'dominoV', cells: [[0, 0], [0, 1]] },
  { id: 'tripleH', cells: [[0, 0], [1, 0], [2, 0]] },
  { id: 'tripleV', cells: [[0, 0], [0, 1], [0, 2]] },
  { id: 'square2', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { id: 'L3a', cells: [[0, 0], [0, 1], [1, 1]] },
  { id: 'L3b', cells: [[1, 0], [0, 1], [1, 1]] },
  { id: 'L4a', cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { id: 'L4b', cells: [[1, 0], [1, 1], [1, 2], [0, 2]] },
  { id: 'L4c', cells: [[0, 0], [1, 0], [2, 0], [0, 1]] },
  { id: 'L4d', cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  { id: 'T4', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  { id: 'plus5', cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  { id: 'z4a', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { id: 'z4b', cells: [[1, 0], [0, 1], [1, 1], [0, 2]] },
  { id: 'line4H', cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { id: 'line4V', cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
  { id: 'line5H', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { id: 'line5V', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
];

const app = document.getElementById('app');
const boardEl = document.getElementById('board');
const boardShellEl = document.getElementById('board-shell');
const ghostLayerEl = document.getElementById('ghost-layer');
const rackEls = [document.getElementById('rack-0'), document.getElementById('rack-1')];
const scoreEls = [document.getElementById('score-0'), document.getElementById('score-1')];
const timerEl = document.getElementById('timer');
const overlayEl = document.getElementById('overlay');
const countdownOverlayEl = document.getElementById('countdown-overlay');
const countdownTitleEl = document.getElementById('countdown-title');
const countdownNumberEl = document.getElementById('countdown-number');
const pauseOverlayEl = document.getElementById('pause-overlay');
const pauseMessageEl = document.getElementById('pause-message');
const pauseResumeEl = document.getElementById('pause-resume');
const endOverlayEl = document.getElementById('end-overlay');
const endSummaryEl = document.getElementById('end-summary');
const endTitleEl = document.getElementById('end-title');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const pieceSlotTemplate = document.getElementById('piece-slot-template');
const specialSlotEl = document.getElementById('special-slot');

const state = {
  board: [],
  scores: [0, 0],
  racks: [[], []],
  slotEls: [[], []],
  boardCells: [],
  activeDrags: new Map(),
  specialPiece: null,
  gameActive: false,
  timeLeft: GAME_DURATION,
  timerHandle: null,
  pauseHandle: null,
  boardMetrics: null,
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cloneCells(cells) {
  return cells.map(([x, y]) => [x, y]);
}

function dimsForCells(cells) {
  const xs = cells.map(([x]) => x);
  const ys = cells.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const normalized = cells.map(([x, y]) => [x - minX, y - minY]);
  const width = Math.max(...normalized.map(([x]) => x)) + 1;
  const height = Math.max(...normalized.map(([, y]) => y)) + 1;
  return { width, height, cells: normalized };
}

function makePiece({ special = false } = {}) {
  const shape = randomItem(SHAPES);
  const dims = dimsForCells(cloneCells(shape.cells));
  return {
    id: `${special ? 'S' : 'N'}-${Math.random().toString(36).slice(2, 10)}`,
    shapeId: shape.id,
    cells: dims.cells,
    width: dims.width,
    height: dims.height,
    previewColor: special ? '#ffb54a' : randomItem(COLORS),
    special,
  };
}

function resetState() {
  state.board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
  state.scores = [0, 0];
  state.racks = [[], []];
  state.specialPiece = null;
  state.timeLeft = GAME_DURATION;
  state.gameActive = false;
  state.activeDrags.forEach(cancelDragVisuals);
  state.activeDrags.clear();
  if (state.timerHandle) clearInterval(state.timerHandle);
  if (state.pauseHandle) clearInterval(state.pauseHandle);
  state.timerHandle = null;
  state.pauseHandle = null;
  updateTimer();
  updateScores();
}

function buildBoard() {
  boardEl.innerHTML = '';
  state.boardCells = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    const row = [];
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const cell = document.createElement('div');
      cell.className = 'board-cell';
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      boardEl.appendChild(cell);
      row.push(cell);
    }
    state.boardCells.push(row);
  }
}

function buildRacks() {
  rackEls.forEach((rackEl, player) => {
    rackEl.innerHTML = '';
    state.slotEls[player] = [];
    for (let i = 0; i < MAX_RACK; i += 1) {
      const slotEl = pieceSlotTemplate.content.firstElementChild.cloneNode(true);
      slotEl.dataset.player = String(player);
      slotEl.dataset.slot = String(i);
      rackEl.appendChild(slotEl);
      state.slotEls[player].push(slotEl);
    }
  });
}

function fillAllRacks() {
  for (let player = 0; player < 2; player += 1) {
    state.racks[player] = Array.from({ length: MAX_RACK }, () => makePiece());
  }
}

function renderMiniPiece(targetEl, piece, slotSize, { specialPreview = false } = {}) {
  targetEl.innerHTML = '';
  if (!piece) return;

  const pieceEl = document.createElement('div');
  pieceEl.className = 'mini-piece';
  pieceEl.dataset.pieceId = piece.id;

  const padding = slotSize * 0.08;
  const cellSize = Math.min(
    (slotSize - padding * 2) / Math.max(piece.width, 1),
    (slotSize - padding * 2) / Math.max(piece.height, 1)
  );
  const renderWidth = piece.width * cellSize;
  const renderHeight = piece.height * cellSize;

  pieceEl.style.width = `${renderWidth}px`;
  pieceEl.style.height = `${renderHeight}px`;
  pieceEl.style.left = `${(targetEl.clientWidth - renderWidth) / 2}px`;
  pieceEl.style.top = `${(targetEl.clientHeight - renderHeight) / 2}px`;

  piece.cells.forEach(([x, y]) => {
    const cell = document.createElement('div');
    cell.className = 'mini-piece-cell';
    cell.style.width = `${cellSize - 2}px`;
    cell.style.height = `${cellSize - 2}px`;
    cell.style.left = `${x * cellSize + 1}px`;
    cell.style.top = `${y * cellSize + 1}px`;
    const color = specialPreview ? 'linear-gradient(180deg, #ffcf6b, #ff9a2b)' : piece.previewColor;
    cell.style.background = color;
    if (piece.special || specialPreview) {
      cell.style.boxShadow = 'inset 0 -2px 0 rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.24), 0 0 0 1px rgba(255,215,111,0.4)';
    }
    pieceEl.appendChild(cell);
  });

  targetEl.appendChild(pieceEl);
}

function renderRacks() {
  state.slotEls.forEach((slots, player) => {
    slots.forEach((slotEl, slotIndex) => {
      const canvas = slotEl.querySelector('.piece-canvas');
      const piece = state.racks[player][slotIndex] || null;
      slotEl.dataset.pieceId = piece ? piece.id : '';
      renderMiniPiece(canvas, piece, Math.min(slotEl.clientWidth, slotEl.clientHeight));
      if (piece) attachPiecePointer(slotEl, piece, { sourceType: 'rack', player, slotIndex });
      else slotEl.onpointerdown = null;
    });
  });
}

function renderSpecialSlot() {
  specialSlotEl.classList.toggle('has-piece', Boolean(state.specialPiece));
  specialSlotEl.classList.toggle('ready', Boolean(state.specialPiece));
  specialSlotEl.classList.toggle('empty', !state.specialPiece);

  let canvas = specialSlotEl.querySelector('.special-canvas');
  if (!canvas) {
    canvas = document.createElement('div');
    canvas.className = 'special-canvas';
    specialSlotEl.appendChild(canvas);
  }
  renderMiniPiece(canvas, state.specialPiece, Math.min(specialSlotEl.clientWidth, specialSlotEl.clientHeight), { specialPreview: true });
  if (state.specialPiece) attachPiecePointer(specialSlotEl, state.specialPiece, { sourceType: 'special' });
  else specialSlotEl.onpointerdown = null;
}

function renderBoard() {
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const cellEl = state.boardCells[y][x];
      cellEl.classList.remove('clearing', 'ghost-valid', 'ghost-invalid');
      cellEl.innerHTML = '';
      const cellState = state.board[y][x];
      if (cellState) {
        const fill = document.createElement('div');
        fill.className = `board-cell-fill ${cellState.kind}`;
        cellEl.appendChild(fill);
      }
    }
  }
}

function updateScores() {
  state.scores.forEach((score, i) => {
    scoreEls[i].textContent = String(Math.floor(score));
  });
}

function updateTimer() {
  timerEl.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
}

function sizeBoardToFit() {
  const availableWidth = Math.max(0, boardShellEl.clientWidth - 12);
  const availableHeight = Math.max(0, boardShellEl.clientHeight - 12);
  const size = Math.max(120, Math.floor(Math.min(availableWidth, availableHeight)));
  boardEl.style.width = `${size}px`;
  boardEl.style.height = `${size}px`;
}

function fitAppScale() {
  app.style.transform = 'scale(1)';
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const naturalWidth = Math.max(app.scrollWidth, app.clientWidth);
  const naturalHeight = Math.max(app.scrollHeight, app.clientHeight);
  const scale = Math.min(1, viewportWidth / naturalWidth, viewportHeight / naturalHeight);
  app.style.transform = `scale(${scale})`;
}

function refreshLayoutMetrics() {
  sizeBoardToFit();
  fitAppScale();
  const boardRect = boardEl.getBoundingClientRect();
  const shellRect = boardShellEl.getBoundingClientRect();
  const cellSize = boardRect.width / BOARD_SIZE;
  state.boardMetrics = {
    left: boardRect.left,
    top: boardRect.top,
    width: boardRect.width,
    height: boardRect.height,
    cellSize,
    shellLeft: shellRect.left,
    shellTop: shellRect.top,
  };
}

function attachPiecePointer(containerEl, piece, source) {
  containerEl.onpointerdown = (event) => {
    if (!state.gameActive) return;
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    refreshLayoutMetrics();
    startDrag(event, piece, containerEl, source);
  };
}

function createDragElement(piece, cellSize) {
  const dragEl = document.createElement('div');
  dragEl.className = 'drag-piece';
  dragEl.style.width = `${piece.width * cellSize}px`;
  dragEl.style.height = `${piece.height * cellSize}px`;

  piece.cells.forEach(([x, y]) => {
    const cell = document.createElement('div');
    cell.className = 'drag-piece-cell';
    cell.style.width = `${cellSize - 2}px`;
    cell.style.height = `${cellSize - 2}px`;
    cell.style.left = `${x * cellSize + 1}px`;
    cell.style.top = `${y * cellSize + 1}px`;
    cell.style.background = piece.special
      ? 'linear-gradient(180deg, #ffd26f, #ff9f2e)'
      : piece.previewColor;
    if (piece.special) cell.style.border = '1px solid rgba(255, 215, 111, 0.7)';
    dragEl.appendChild(cell);
  });

  document.body.appendChild(dragEl);
  return dragEl;
}

function startDrag(event, piece, originEl, source) {
  if (state.activeDrags.has(event.pointerId)) return;
  const boardMetrics = state.boardMetrics;
  const sourceRect = originEl.getBoundingClientRect();
  const cellSize = boardMetrics.cellSize;
  const dragEl = createDragElement(piece, cellSize);
  const pointerOffsetX = event.clientX - sourceRect.left;
  const pointerOffsetY = event.clientY - sourceRect.top;
  const scale = cellSize / Math.max(1, Math.min(sourceRect.width / Math.max(piece.width, 1), sourceRect.height / Math.max(piece.height, 1)));

  originEl.classList.add('drag-origin');

  const drag = {
    pointerId: event.pointerId,
    piece,
    originEl,
    source,
    dragEl,
    cellSize,
    pointerOffsetX: Math.min(pointerOffsetX, piece.width * cellSize * 0.5),
    pointerOffsetY: Math.min(pointerOffsetY, piece.height * cellSize * 0.5),
    candidate: null,
    valid: false,
  };

  state.activeDrags.set(event.pointerId, drag);
  updateDrag(event, drag);

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', onPointerUp, { passive: false });
}

function onPointerMove(event) {
  const drag = state.activeDrags.get(event.pointerId);
  if (!drag) return;
  event.preventDefault();
  updateDrag(event, drag);
}

function clearGhostMarks() {
  state.boardCells.flat().forEach((cell) => {
    cell.classList.remove('ghost-valid', 'ghost-invalid');
  });
}

function markGhost(drag) {
  clearGhostMarks();
  if (!drag.candidate) return;
  const className = drag.valid ? 'ghost-valid' : 'ghost-invalid';
  drag.piece.cells.forEach(([dx, dy]) => {
    const x = drag.candidate.x + dx;
    const y = drag.candidate.y + dy;
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      state.boardCells[y][x].classList.add(className);
    }
  });
}

function updateDrag(event, drag) {
  const left = event.clientX - drag.pointerOffsetX;
  const top = event.clientY - drag.pointerOffsetY;
  drag.dragEl.style.left = `${left}px`;
  drag.dragEl.style.top = `${top}px`;

  const candidateX = Math.round((left - state.boardMetrics.left) / drag.cellSize);
  const candidateY = Math.round((top - state.boardMetrics.top) / drag.cellSize);
  const candidate = { x: candidateX, y: candidateY };
  drag.candidate = candidate;
  drag.valid = canPlacePiece(drag.piece, candidateX, candidateY);
  drag.dragEl.classList.toggle('valid', drag.valid);
  drag.dragEl.classList.toggle('invalid', !drag.valid);
  markGhost(drag);
}

function onPointerUp(event) {
  const drag = state.activeDrags.get(event.pointerId);
  if (!drag) return;
  event.preventDefault();
  finishDrag(drag);
  state.activeDrags.delete(event.pointerId);
  if (state.activeDrags.size === 0) {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    clearGhostMarks();
  }
}

function cancelDragVisuals(drag) {
  drag.originEl.classList.remove('drag-origin');
  drag.dragEl?.remove();
}

function finishDrag(drag) {
  drag.originEl.classList.remove('drag-origin');
  drag.dragEl.remove();
  if (!state.gameActive) return;
  if (drag.valid && drag.candidate) {
    placeDraggedPiece(drag);
  } else {
    flashInvalid(drag.originEl);
  }
}

function flashInvalid(originEl) {
  originEl.classList.remove('flash-red');
  void originEl.offsetWidth;
  originEl.classList.add('flash-red');
  setTimeout(() => originEl.classList.remove('flash-red'), INVALID_FLASH_MS);
}

function flashSuccess(originEl) {
  originEl.classList.remove('flash-blue');
  void originEl.offsetWidth;
  originEl.classList.add('flash-blue');
  setTimeout(() => originEl.classList.remove('flash-blue'), SUCCESS_FLASH_MS);
}

function canPlacePiece(piece, x, y) {
  return piece.cells.every(([dx, dy]) => {
    const px = x + dx;
    const py = y + dy;
    return px >= 0 && px < BOARD_SIZE && py >= 0 && py < BOARD_SIZE && !state.board[py][px];
  });
}

function putPieceOnBoard(piece, x, y) {
  piece.cells.forEach(([dx, dy]) => {
    state.board[y + dy][x + dx] = { kind: piece.special ? PLACED_SPECIAL : PLACED_NORMAL };
  });
}

function getClearInfo() {
  const rows = [];
  const cols = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    if (state.board[y].every(Boolean)) rows.push(y);
  }
  for (let x = 0; x < BOARD_SIZE; x += 1) {
    let full = true;
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      if (!state.board[y][x]) {
        full = false;
        break;
      }
    }
    if (full) cols.push(x);
  }
  return { rows, cols };
}

function scoreForClear(rows, cols) {
  const clearSet = new Set();
  rows.forEach((y) => {
    for (let x = 0; x < BOARD_SIZE; x += 1) clearSet.add(`${x},${y}`);
  });
  cols.forEach((x) => {
    for (let y = 0; y < BOARD_SIZE; y += 1) clearSet.add(`${x},${y}`);
  });

  let baseScore = 0;
  clearSet.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cell = state.board[y][x];
    if (!cell) return;
    baseScore += cell.kind === PLACED_SPECIAL ? 2 : 1;
  });
  return baseScore * (rows.length + cols.length);
}

function animateAndClear(rows, cols) {
  const seen = new Set();
  rows.forEach((y) => {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      state.boardCells[y][x].classList.add('clearing');
    }
  });
  cols.forEach((x) => {
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      state.boardCells[y][x].classList.add('clearing');
    }
  });

  setTimeout(() => {
    rows.forEach((y) => {
      for (let x = 0; x < BOARD_SIZE; x += 1) state.board[y][x] = null;
    });
    cols.forEach((x) => {
      for (let y = 0; y < BOARD_SIZE; y += 1) state.board[y][x] = null;
    });
    renderBoard();
  }, 220);
}

function maybeSpawnSpecial() {
  if (state.specialPiece) return;
  if (Math.random() < SPECIAL_SPAWN_CHANCE) {
    state.specialPiece = makePiece({ special: true });
    renderSpecialSlot();
  }
}

function refillSource(source) {
  if (source.sourceType === 'rack') {
    state.racks[source.player][source.slotIndex] = makePiece();
    renderRacks();
  } else if (source.sourceType === 'special') {
    state.specialPiece = null;
    renderSpecialSlot();
  }
}

function placeDraggedPiece(drag) {
  const { x, y } = drag.candidate;
  putPieceOnBoard(drag.piece, x, y);
  renderBoard();
  flashSuccess(drag.originEl);

  const clearInfo = getClearInfo();
  if (clearInfo.rows.length || clearInfo.cols.length) {
    const points = scoreForClear(clearInfo.rows, clearInfo.cols);
    const scoringPlayer = drag.source.sourceType === 'rack' ? drag.source.player : estimateNearestPlayer(y);
    state.scores[scoringPlayer] += points;
    updateScores();
    animateAndClear(clearInfo.rows, clearInfo.cols);
    maybeSpawnSpecial();
  }

  refillSource(drag.source);
  setTimeout(() => checkForStuckAfterMove(drag.source.sourceType === 'rack' ? drag.source.player : estimateNearestPlayer(y)), 240);
}

function estimateNearestPlayer(y) {
  return y < BOARD_SIZE / 2 ? 0 : 1;
}

function anyPlacementForPiece(piece) {
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (canPlacePiece(piece, x, y)) return true;
    }
  }
  return false;
}

function checkForStuckAfterMove(triggerPlayer) {
  if (!state.gameActive) return;
  const allRegularPieces = [...state.racks[0], ...state.racks[1]].filter(Boolean);
  const stuck = allRegularPieces.length > 0 && allRegularPieces.every((piece) => !anyPlacementForPiece(piece));
  if (stuck) handleStuck(triggerPlayer);
}

function showPauseOverlay(message) {
  pauseMessageEl.textContent = message;
  pauseResumeEl.textContent = String(RESUME_COUNTDOWN);
  pauseOverlayEl.classList.remove('hidden');
}

function hidePauseOverlay() {
  pauseOverlayEl.classList.add('hidden');
}

function handleStuck(triggerPlayer) {
  state.gameActive = false;
  state.scores[triggerPlayer] = Math.floor(state.scores[triggerPlayer] / 2);
  updateScores();
  showPauseOverlay(`Player ${triggerPlayer + 1} caused a jam. Score halved!`);

  clearBoardAndRefreshPieces();

  let remaining = RESUME_COUNTDOWN;
  if (state.pauseHandle) clearInterval(state.pauseHandle);
  state.pauseHandle = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      pauseResumeEl.textContent = String(remaining);
      return;
    }
    clearInterval(state.pauseHandle);
    state.pauseHandle = null;
    hidePauseOverlay();
    startVisibleCountdown('RESUME', RESUME_COUNTDOWN, () => {
      state.gameActive = true;
    });
  }, 1000);
}

function clearBoardAndRefreshPieces() {
  state.board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
  fillAllRacks();
  state.specialPiece = null;
  renderBoard();
  renderRacks();
  renderSpecialSlot();
}

function startVisibleCountdown(title, from, onDone) {
  countdownTitleEl.textContent = title;
  countdownNumberEl.textContent = String(from);
  countdownOverlayEl.classList.remove('hidden');
  let current = from;
  const handle = setInterval(() => {
    current -= 1;
    if (current > 0) {
      countdownNumberEl.textContent = String(current);
      return;
    }
    clearInterval(handle);
    countdownNumberEl.textContent = 'GO';
    setTimeout(() => {
      countdownOverlayEl.classList.add('hidden');
      onDone?.();
    }, 400);
  }, 1000);
}

function startTimerLoop() {
  if (state.timerHandle) clearInterval(state.timerHandle);
  state.timerHandle = setInterval(() => {
    if (!state.gameActive) return;
    state.timeLeft -= 1;
    updateTimer();
    if (state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  state.gameActive = false;
  if (state.timerHandle) clearInterval(state.timerHandle);
  state.timerHandle = null;
  const [a, b] = state.scores;
  let title = 'DRAW';
  if (a > b) title = 'PLAYER 1 WINS';
  else if (b > a) title = 'PLAYER 2 WINS';
  endTitleEl.textContent = title;
  endSummaryEl.innerHTML = `
    <div>Player 1: <strong>${Math.floor(a)}</strong></div>
    <div>Player 2: <strong>${Math.floor(b)}</strong></div>
  `;
  endOverlayEl.classList.remove('hidden');
}

function startGameFlow() {
  endOverlayEl.classList.add('hidden');
  overlayEl.classList.add('hidden');
  hidePauseOverlay();
  resetState();
  fillAllRacks();
  renderRacks();
  renderSpecialSlot();
  renderBoard();
  refreshLayoutMetrics();
  startVisibleCountdown('START', 3, () => {
    state.gameActive = true;
    startTimerLoop();
  });
}

function init() {
  buildBoard();
  buildRacks();
  resetState();
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  refreshLayoutMetrics();
}

startBtn.addEventListener('click', startGameFlow);
restartBtn.addEventListener('click', startGameFlow);
window.addEventListener('resize', () => {
  refreshLayoutMetrics();
  renderRacks();
  renderSpecialSlot();
});

document.addEventListener('touchmove', (event) => {
  event.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', (event) => {
  event.preventDefault();
});

init();
