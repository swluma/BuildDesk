const BOARD_SIZE = 8;
const MAX_RACK = 3;
const GAME_DURATION = 180;
const SPECIAL_SPAWN_CHANCE = 0.05;
const RESUME_COUNTDOWN = 3;
const INVALID_FLASH_MS = 3000;
const SUCCESS_FLASH_MS = 1000;
const DESIRED_GRID_SIZE = 5;
const DESIRED_MAX_BLOCKS = 5;
const DESIRED_SKILL_COST = 15;
const DESIRED_SKILL_COOLDOWN_MS = 15000;
const PLACED_NORMAL = 'normal';
const PLACED_SPECIAL = 'special';

const COLORS = [
  '#62d8ff', '#ff7da7', '#ffd36b', '#a78bff', '#6ff1b8', '#ff9f50', '#82f06d', '#4fd2ff', '#ff89f3'
];

const DESIRED_PREVIEW_COLORS = ['#62d8ff', '#ff7da7'];

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
const scorePopupLayerEl = document.getElementById('score-popup-layer');
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
const skillBtnEls = [document.getElementById('skill-btn-0'), document.getElementById('skill-btn-1')];
const desiredPieceBtnEls = [
  document.getElementById('desired-piece-btn-0'),
  document.getElementById('desired-piece-btn-1'),
];
const desiredPiecePreviewEls = [
  document.getElementById('desired-piece-preview-0'),
  document.getElementById('desired-piece-preview-1'),
];
const desiredPieceModalEl = document.getElementById('desired-piece-modal');
const desiredPieceGridEl = document.getElementById('desired-piece-grid');
const desiredPieceLivePreviewEl = document.getElementById('desired-piece-live-preview');
const desiredPieceCountEl = document.getElementById('desired-piece-count');
const desiredPieceResetBtn = document.getElementById('desired-piece-reset');
const desiredPieceCancelBtn = document.getElementById('desired-piece-cancel');
const desiredPieceSaveBtn = document.getElementById('desired-piece-save');

const state = {
  board: [],
  scores: [0, 0],
  racks: [[], []],
  slotEls: [[], []],
  boardCells: [],
  activeDrags: new Map(),
  specialPiece: null,
  desiredPieces: [],
  skillCooldownEndsAt: [0, 0],
  desiredDraft: null,
  desiredGridCells: [],
  gameActive: false,
  timeLeft: GAME_DURATION,
  timerHandle: null,
  pauseHandle: null,
  skillUiHandle: null,
  boardMetrics: null,
  scorePopupHandle: null,
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

function defaultDesiredCells() {
  return [[0, 0]];
}

function editorCoordsToCells(cellKeys) {
  return Array.from(cellKeys, (key) => key.split(',').map(Number));
}

function makePieceFromCells(cells, {
  special = false,
  shapeId = 'custom',
  previewColor = null,
  idPrefix = null,
} = {}) {
  const dims = dimsForCells(cloneCells(cells));
  return {
    id: `${idPrefix || (special ? 'S' : 'N')}-${Math.random().toString(36).slice(2, 10)}`,
    shapeId,
    cells: dims.cells,
    width: dims.width,
    height: dims.height,
    previewColor: previewColor || (special ? '#ffb54a' : randomItem(COLORS)),
    special,
  };
}

function makePiece({ special = false } = {}) {
  const shape = randomItem(SHAPES);
  return makePieceFromCells(shape.cells, {
    special,
    shapeId: shape.id,
    previewColor: special ? '#ffb54a' : randomItem(COLORS),
  });
}

function makeDesiredPiece(player, cells = defaultDesiredCells()) {
  return makePieceFromCells(cells, {
    shapeId: `desired-${player}`,
    idPrefix: `D${player}`,
    previewColor: DESIRED_PREVIEW_COLORS[player] || COLORS[player],
  });
}

function makeDesiredRackPiece(player) {
  return makeDesiredPiece(player, state.desiredPieces[player].cells);
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
  if (state.skillUiHandle) clearInterval(state.skillUiHandle);
  if (state.scorePopupHandle) clearTimeout(state.scorePopupHandle);
  state.timerHandle = null;
  state.pauseHandle = null;
  state.skillUiHandle = null;
  state.scorePopupHandle = null;
  state.skillCooldownEndsAt = [0, 0];
  scorePopupLayerEl.innerHTML = '';
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

function buildDesiredPieceGrid() {
  desiredPieceGridEl.innerHTML = '';
  state.desiredGridCells = [];
  for (let y = 0; y < DESIRED_GRID_SIZE; y += 1) {
    for (let x = 0; x < DESIRED_GRID_SIZE; x += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'desired-grid-cell';
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      cell.addEventListener('click', () => toggleDesiredDraftCell(x, y));
      desiredPieceGridEl.appendChild(cell);
      state.desiredGridCells.push(cell);
    }
  }
}

function fillAllRacks() {
  for (let player = 0; player < 2; player += 1) {
    state.racks[player] = Array.from({ length: MAX_RACK }, () => makePiece());
  }
}

function getRenderSlotSize(targetEl, fallback = 72) {
  return Math.max(24, Math.min(targetEl.clientWidth || fallback, targetEl.clientHeight || fallback));
}

function renderMiniPiece(targetEl, piece, slotSize, { specialPreview = false, forceEnabled = false } = {}) {
  targetEl.innerHTML = '';
  if (!piece) return;

  const disabled = forceEnabled ? false : isPieceDisabled(piece);
  const safeSlotSize = slotSize || getRenderSlotSize(targetEl);

  const pieceEl = document.createElement('div');
  pieceEl.className = 'mini-piece';
  pieceEl.dataset.pieceId = piece.id;
  pieceEl.classList.toggle('disabled', disabled);

  const padding = safeSlotSize * 0.08;
  const cellSize = Math.min(
    (safeSlotSize - padding * 2) / Math.max(piece.width, 1),
    (safeSlotSize - padding * 2) / Math.max(piece.height, 1)
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
    const color = disabled
      ? 'linear-gradient(180deg, #8e97a0, #56606b)'
      : (specialPreview ? 'linear-gradient(180deg, #ffcf6b, #ff9a2b)' : piece.previewColor);
    cell.style.background = color;
    if (disabled) {
      cell.style.boxShadow = 'inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.08)';
    } else if (piece.special || specialPreview) {
      cell.style.boxShadow = 'inset 0 -2px 0 rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.24), 0 0 0 1px rgba(255,215,111,0.4)';
    }
    pieceEl.appendChild(cell);
  });

  targetEl.appendChild(pieceEl);
}

function renderDesiredPiecePreviews() {
  desiredPiecePreviewEls.forEach((previewEl, player) => {
    renderMiniPiece(previewEl, state.desiredPieces[player], getRenderSlotSize(previewEl, 68), { forceEnabled: true });
  });
}

function renderSkillButtons() {
  const now = Date.now();
  skillBtnEls.forEach((btn, player) => {
    const score = Math.floor(state.scores[player]);
    const cooldownMs = Math.max(0, state.skillCooldownEndsAt[player] - now);
    const cooldownSeconds = cooldownMs / 1000;
    const handTurns = cooldownMs > 0 ? cooldownMs / DESIRED_SKILL_COOLDOWN_MS : 0;
    const canUse = state.gameActive && cooldownMs <= 0 && score >= DESIRED_SKILL_COST;

    btn.disabled = !canUse;
    btn.classList.toggle('cooldown-active', cooldownMs > 0);
    btn.classList.toggle('insufficient-score', state.gameActive && cooldownMs <= 0 && score < DESIRED_SKILL_COST);
    btn.innerHTML = `
      <span class="skill-btn-label">P${player + 1} Desired</span>
      <span class="skill-btn-cost">-${DESIRED_SKILL_COST}</span>
      ${cooldownMs > 0 ? `
        <span class="skill-watch" aria-hidden="true">
          <span class="skill-watch-face">
            <span class="skill-watch-hand" style="transform: translateX(-50%) rotate(${handTurns}turn);"></span>
          </span>
        </span>
        <span class="skill-btn-timer">${cooldownSeconds.toFixed(1)}s</span>
      ` : ''}
    `;
  });
}

function startSkillUiLoop() {
  if (state.skillUiHandle) clearInterval(state.skillUiHandle);
  state.skillUiHandle = setInterval(() => {
    renderSkillButtons();
  }, 100);
}

function renderRacks() {
  state.slotEls.forEach((slots, player) => {
    slots.forEach((slotEl, slotIndex) => {
      const canvas = slotEl.querySelector('.piece-canvas');
      const piece = state.racks[player][slotIndex] || null;
      const disabled = isPieceDisabled(piece);
      slotEl.dataset.pieceId = piece ? piece.id : '';
      slotEl.classList.toggle('disabled', disabled);
      renderMiniPiece(canvas, piece, Math.min(slotEl.clientWidth, slotEl.clientHeight));
      if (piece && !disabled) attachPiecePointer(slotEl, piece, { sourceType: 'rack', player, slotIndex });
      else slotEl.onpointerdown = null;
    });
  });
}

function renderSpecialSlot() {
  const disabled = isPieceDisabled(state.specialPiece);
  specialSlotEl.classList.toggle('has-piece', Boolean(state.specialPiece));
  specialSlotEl.classList.toggle('ready', Boolean(state.specialPiece) && !disabled);
  specialSlotEl.classList.toggle('empty', !state.specialPiece);
  specialSlotEl.classList.toggle('disabled', disabled);

  let canvas = specialSlotEl.querySelector('.special-canvas');
  if (!canvas) {
    canvas = document.createElement('div');
    canvas.className = 'special-canvas';
    specialSlotEl.appendChild(canvas);
  }
  renderMiniPiece(canvas, state.specialPiece, Math.min(specialSlotEl.clientWidth, specialSlotEl.clientHeight), { specialPreview: true });
  if (state.specialPiece && !disabled) attachPiecePointer(specialSlotEl, state.specialPiece, { sourceType: 'special' });
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
  renderSkillButtons();
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
  state.boardMetrics = {
    left: boardRect.left,
    top: boardRect.top,
    width: boardRect.width,
    height: boardRect.height,
    cellSize: boardRect.width / BOARD_SIZE,
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
  const sourceRect = originEl.getBoundingClientRect();
  const cellSize = state.boardMetrics.cellSize;
  const dragEl = createDragElement(piece, cellSize);

  originEl.classList.add('drag-origin');

  const drag = {
    pointerId: event.pointerId,
    piece,
    originEl,
    source,
    dragEl,
    cellSize,
    pointerOffsetX: Math.min(event.clientX - sourceRect.left, piece.width * cellSize * 0.5),
    pointerOffsetY: Math.min(event.clientY - sourceRect.top, piece.height * cellSize * 0.5),
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

  drag.candidate = {
    x: Math.round((left - state.boardMetrics.left) / drag.cellSize),
    y: Math.round((top - state.boardMetrics.top) / drag.cellSize),
  };
  drag.valid = canPlacePiece(drag.piece, drag.candidate.x, drag.candidate.y);
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

function anyPlacementForPiece(piece) {
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (canPlacePiece(piece, x, y)) return true;
    }
  }
  return false;
}

function isPieceDisabled(piece) {
  return Boolean(piece) && !anyPlacementForPiece(piece);
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
  let specialCount = 0;
  clearSet.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cell = state.board[y][x];
    if (!cell) return;
    if (cell.kind === PLACED_SPECIAL) specialCount += 1;
    baseScore += cell.kind === PLACED_SPECIAL ? 2 : 1;
  });
  const lineCount = rows.length + cols.length;
  return {
    points: baseScore * lineCount,
    lineCount,
    specialDoubled: specialCount > 0,
  };
}

function getPopupAnchorCell(piece, x, y) {
  const anchorCell = piece.cells[piece.cells.length - 1] || [0, 0];
  return { x: x + anchorCell[0], y: y + anchorCell[1] };
}

function showScorePopup({ lineCount, points, specialDoubled }, anchorCell) {
  if (!state.boardMetrics) refreshLayoutMetrics();

  if (state.scorePopupHandle) clearTimeout(state.scorePopupHandle);
  state.scorePopupHandle = null;
  scorePopupLayerEl.innerHTML = '';

  const popupEl = document.createElement('div');
  popupEl.className = 'score-popup';

  const linesEl = document.createElement('div');
  linesEl.className = 'score-popup-lines';
  linesEl.textContent = `line x${lineCount}!`;
  popupEl.appendChild(linesEl);

  const pointsEl = document.createElement('div');
  pointsEl.className = 'score-popup-points';
  pointsEl.textContent = `+${points}`;
  popupEl.appendChild(pointsEl);

  if (specialDoubled) {
    const bonusEl = document.createElement('div');
    bonusEl.className = 'score-popup-bonus';
    bonusEl.textContent = 'score x2!';
    popupEl.appendChild(bonusEl);
  }

  const cellSize = state.boardMetrics.cellSize;
  const left = Math.min(state.boardMetrics.width - 20, Math.max(20, (anchorCell.x + 0.5) * cellSize));
  const top = Math.min(state.boardMetrics.height - 20, Math.max(24, (anchorCell.y + 0.2) * cellSize));

  popupEl.style.left = `${left}px`;
  popupEl.style.top = `${top}px`;
  scorePopupLayerEl.appendChild(popupEl);

  state.scorePopupHandle = setTimeout(() => {
    popupEl.remove();
    state.scorePopupHandle = null;
  }, 3000);
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
    renderRacks();
    renderSpecialSlot();
  }, 220);
}

function maybeSpawnSpecial() {
  if (state.specialPiece || Math.random() >= SPECIAL_SPAWN_CHANCE) return;
  state.specialPiece = makePiece({ special: true });
  renderSpecialSlot();
}

function refillSource(source) {
  if (source.sourceType === 'rack') {
    state.racks[source.player][source.slotIndex] = makePiece();
    renderRacks();
    return;
  }
  state.specialPiece = null;
  renderSpecialSlot();
}

function estimateNearestPlayer(y) {
  return y < BOARD_SIZE / 2 ? 0 : 1;
}

function placeDraggedPiece(drag) {
  const { x, y } = drag.candidate;
  putPieceOnBoard(drag.piece, x, y);
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  flashSuccess(drag.originEl);

  const clearInfo = getClearInfo();
  if (clearInfo.rows.length || clearInfo.cols.length) {
    const scoreResult = scoreForClear(clearInfo.rows, clearInfo.cols);
    const scoringPlayer = drag.source.sourceType === 'rack' ? drag.source.player : estimateNearestPlayer(y);
    state.scores[scoringPlayer] += scoreResult.points;
    updateScores();
    showScorePopup(scoreResult, getPopupAnchorCell(drag.piece, x, y));
    animateAndClear(clearInfo.rows, clearInfo.cols);
    maybeSpawnSpecial();
  }

  refillSource(drag.source);
  setTimeout(() => checkForStuckAfterMove(drag.source.sourceType === 'rack' ? drag.source.player : estimateNearestPlayer(y)), 240);
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

function clearBoardAndRefreshPieces() {
  state.board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
  fillAllRacks();
  state.specialPiece = null;
  renderBoard();
  renderRacks();
  renderSpecialSlot();
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
    state.gameActive = true;
  }, 1000);
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
    if (state.timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  state.gameActive = false;
  if (state.timerHandle) clearInterval(state.timerHandle);
  if (state.skillUiHandle) clearInterval(state.skillUiHandle);
  state.timerHandle = null;
  state.skillUiHandle = null;
  renderSkillButtons();
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

function centerCellsInEditor(cells) {
  const dims = dimsForCells(cells);
  const offsetX = Math.floor((DESIRED_GRID_SIZE - dims.width) / 2);
  const offsetY = Math.floor((DESIRED_GRID_SIZE - dims.height) / 2);
  return dims.cells.map(([x, y]) => `${x + offsetX},${y + offsetY}`);
}

function updateDesiredPieceModal() {
  const draftKeys = state.desiredDraft?.cellKeys || new Set(centerCellsInEditor(defaultDesiredCells()));
  state.desiredGridCells.forEach((cellEl) => {
    const key = `${cellEl.dataset.x},${cellEl.dataset.y}`;
    cellEl.classList.toggle('active', draftKeys.has(key));
  });

  const cells = editorCoordsToCells(draftKeys);
  const previewPiece = cells.length > 0 ? makeDesiredPiece(state.desiredDraft.player, cells) : null;
  renderMiniPiece(desiredPieceLivePreviewEl, previewPiece, getRenderSlotSize(desiredPieceLivePreviewEl, 88), { forceEnabled: true });
  desiredPieceCountEl.textContent = `${cells.length} / ${DESIRED_MAX_BLOCKS} blocks`;
  desiredPieceCountEl.classList.toggle('maxed', cells.length >= DESIRED_MAX_BLOCKS);
  desiredPieceSaveBtn.disabled = cells.length === 0;
}

function openDesiredPieceModal(player) {
  state.desiredDraft = {
    player,
    cellKeys: new Set(centerCellsInEditor(state.desiredPieces[player].cells)),
  };
  desiredPieceModalEl.classList.remove('hidden');
  updateDesiredPieceModal();
}

function closeDesiredPieceModal() {
  desiredPieceModalEl.classList.add('hidden');
  state.desiredDraft = null;
}

function toggleDesiredDraftCell(x, y) {
  if (!state.desiredDraft) return;
  const key = `${x},${y}`;
  if (state.desiredDraft.cellKeys.has(key)) {
    state.desiredDraft.cellKeys.delete(key);
  } else if (state.desiredDraft.cellKeys.size < DESIRED_MAX_BLOCKS) {
    state.desiredDraft.cellKeys.add(key);
  }
  updateDesiredPieceModal();
}

function resetDesiredDraft() {
  if (!state.desiredDraft) return;
  state.desiredDraft.cellKeys = new Set(centerCellsInEditor(defaultDesiredCells()));
  updateDesiredPieceModal();
}

function saveDesiredDraft() {
  if (!state.desiredDraft) return;
  const cells = editorCoordsToCells(state.desiredDraft.cellKeys);
  if (cells.length === 0) return;
  state.desiredPieces[state.desiredDraft.player] = makeDesiredPiece(state.desiredDraft.player, cells);
  renderDesiredPiecePreviews();
  closeDesiredPieceModal();
}

function activateDesiredSkill(player) {
  if (!state.gameActive) return;
  if (Math.floor(state.scores[player]) < DESIRED_SKILL_COST) return;
  if (Date.now() < state.skillCooldownEndsAt[player]) return;
  state.scores[player] -= DESIRED_SKILL_COST;
  state.skillCooldownEndsAt[player] = Date.now() + DESIRED_SKILL_COOLDOWN_MS;
  state.racks[player][Math.floor(MAX_RACK / 2)] = makeDesiredRackPiece(player);
  updateScores();
  renderRacks();
}

function initDesiredPieces() {
  state.desiredPieces = [makeDesiredPiece(0), makeDesiredPiece(1)];
  renderDesiredPiecePreviews();
}

function startGameFlow() {
  endOverlayEl.classList.add('hidden');
  overlayEl.classList.add('hidden');
  closeDesiredPieceModal();
  hidePauseOverlay();
  resetState();
  fillAllRacks();
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  renderDesiredPiecePreviews();
  refreshLayoutMetrics();
  startVisibleCountdown('START', 3, () => {
    state.gameActive = true;
    startSkillUiLoop();
    renderSkillButtons();
    startTimerLoop();
  });
}

function init() {
  buildBoard();
  buildRacks();
  buildDesiredPieceGrid();
  initDesiredPieces();
  resetState();
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  renderSkillButtons();
  refreshLayoutMetrics();
}

desiredPieceBtnEls.forEach((btn, player) => {
  btn.addEventListener('click', () => openDesiredPieceModal(player));
});
skillBtnEls.forEach((btn, player) => {
  btn.addEventListener('click', () => activateDesiredSkill(player));
});
desiredPieceResetBtn.addEventListener('click', resetDesiredDraft);
desiredPieceCancelBtn.addEventListener('click', closeDesiredPieceModal);
desiredPieceSaveBtn.addEventListener('click', saveDesiredDraft);
desiredPieceModalEl.addEventListener('click', (event) => {
  if (event.target === desiredPieceModalEl) closeDesiredPieceModal();
});
startBtn.addEventListener('click', startGameFlow);
restartBtn.addEventListener('click', startGameFlow);
window.addEventListener('resize', () => {
  refreshLayoutMetrics();
  renderRacks();
  renderSpecialSlot();
  renderDesiredPiecePreviews();
  if (state.desiredDraft) updateDesiredPieceModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !desiredPieceModalEl.classList.contains('hidden')) {
    closeDesiredPieceModal();
  }
});

document.addEventListener('touchmove', (event) => {
  event.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', (event) => {
  event.preventDefault();
});

init();
