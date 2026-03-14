const BOARD_SIZE = 8;
const MAX_RACK = 3;
const DEFAULT_GAME_DURATION = 120;
const MIN_GAME_DURATION = 30;
const MAX_GAME_DURATION = 600;
const DEFAULT_SPECIAL_SPAWN_CHANCE = 0.05;
const SPECIAL_TILE_COUNT = 3;
const RESUME_COUNTDOWN = 3;
const INVALID_FLASH_MS = 800;
const SUCCESS_FLASH_MS = 700;
const CLEAR_ANIMATION_MS = 360;
const DESIRED_GRID_SIZE = 5;
const DESIRED_MAX_BLOCKS = 5;
const DEFAULT_DESIRED_SKILL_COST = 15;
const DEFAULT_DESIRED_SKILL_COOLDOWN_MS = 15000;
const MAX_CUSTOM_PIECES = 10;
const COMPUTER_PLAYER = 0;

const COMPUTER_DIFFICULTIES = {
  easy: {
    label: 'Easy',
    intervalMs: 5000,
    allowDesiredSkill: false,
    considerSpecialTiles: false,
    selection: 'easy',
    description: 'Slow and forgiving. Uses regular pieces only.',
  },
  normal: {
    label: 'Normal',
    intervalMs: 4000,
    allowDesiredSkill: true,
    considerSpecialTiles: false,
    selection: 'normal',
    description: 'Solid scoring with occasional desired-piece use.',
  },
  hard: {
    label: 'Hard',
    intervalMs: 3000,
    allowDesiredSkill: true,
    considerSpecialTiles: true,
    selection: 'hard',
    description: 'Strong scoring and special-tile awareness.',
  },
  insane: {
    label: 'Insane',
    intervalMs: 2000,
    allowDesiredSkill: true,
    considerSpecialTiles: true,
    selection: 'insane',
    description: 'Fastest pace with strongest current-board play.',
  },
};

const COLORS = [
  '#62d8ff', '#ff7da7', '#ffd36b', '#a78bff', '#6ff1b8', '#ff9f50', '#82f06d', '#4fd2ff', '#ff89f3'
];

const PLAYER_PREVIEW_COLORS = [
  'linear-gradient(180deg, #ff8a9a 0%, #e13b55 100%)',
  'linear-gradient(180deg, #7fc4ff 0%, #2f74e8 100%)',
];

const DESIRED_PREVIEW_COLORS = [
  'linear-gradient(180deg, #ffb1bb 0%, #f04f68 100%)',
  'linear-gradient(180deg, #a2d6ff 0%, #478cff 100%)',
];

const PLAYER_COLOR_THEMES = [
  {
    id: 'red',
    label: 'Red',
    previewColor: 'linear-gradient(180deg, #ff8a9a 0%, #e13b55 100%)',
    desiredColor: 'linear-gradient(180deg, #ffb1bb 0%, #f04f68 100%)',
  },
  {
    id: 'blue',
    label: 'Blue',
    previewColor: 'linear-gradient(180deg, #7fc4ff 0%, #2f74e8 100%)',
    desiredColor: 'linear-gradient(180deg, #a2d6ff 0%, #478cff 100%)',
  },
  {
    id: 'gold',
    label: 'Gold',
    previewColor: 'linear-gradient(180deg, #ffe48b 0%, #de9b23 100%)',
    desiredColor: 'linear-gradient(180deg, #ffefb2 0%, #f1b545 100%)',
  },
  {
    id: 'mint',
    label: 'Mint',
    previewColor: 'linear-gradient(180deg, #9ff8ce 0%, #24b276 100%)',
    desiredColor: 'linear-gradient(180deg, #c6ffe2 0%, #49ca93 100%)',
  },
  {
    id: 'violet',
    label: 'Violet',
    previewColor: 'linear-gradient(180deg, #c1a5ff 0%, #7548e3 100%)',
    desiredColor: 'linear-gradient(180deg, #dbc8ff 0%, #9168f3 100%)',
  },
  {
    id: 'coral',
    label: 'Coral',
    previewColor: 'linear-gradient(180deg, #ffb091 0%, #ea6133 100%)',
    desiredColor: 'linear-gradient(180deg, #ffc8b2 0%, #ff7a4f 100%)',
  },
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
const scorePopupLayerEl = document.getElementById('score-popup-layer');
const rackEls = [document.getElementById('rack-0'), document.getElementById('rack-1')];
const scoreEls = [document.getElementById('score-0'), document.getElementById('score-1')];
const timerEl = document.getElementById('timer');
const pauseBtnEl = document.getElementById('pause-btn');
const overlayEl = document.getElementById('overlay');
const countdownOverlayEl = document.getElementById('countdown-overlay');
const countdownTitleEl = document.getElementById('countdown-title');
const countdownNumberEl = document.getElementById('countdown-number');
const pauseOverlayEl = document.getElementById('pause-overlay');
const pauseMessageEl = document.getElementById('pause-message');
const pauseResumeEl = document.getElementById('pause-resume');
const pauseMenuOverlayEl = document.getElementById('pause-menu-overlay');
const pauseMenuResumeBtn = document.getElementById('pause-menu-resume');
const pauseMenuQuitBtn = document.getElementById('pause-menu-quit');
const endOverlayEl = document.getElementById('end-overlay');
const endSummaryEl = document.getElementById('end-summary');
const endTitleEl = document.getElementById('end-title');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const vsComputerBtn = document.getElementById('vs-computer-btn');
const prepTimeInputEl = document.getElementById('prep-time-input');
const specialSpawnBtn = document.getElementById('special-spawn-btn');
const specialSpawnModalEl = document.getElementById('special-spawn-modal');
const specialSpawnInputEl = document.getElementById('special-spawn-input');
const specialSpawnCloseBtn = document.getElementById('special-spawn-close');
const desiredSkillSettingsBtn = document.getElementById('desired-skill-settings-btn');
const desiredSkillSettingsModalEl = document.getElementById('desired-skill-settings-modal');
const desiredSkillCostInputEl = document.getElementById('desired-skill-cost-input');
const desiredSkillCooldownInputEl = document.getElementById('desired-skill-cooldown-input');
const desiredSkillToggleBtn = document.getElementById('desired-skill-toggle-btn');
const desiredSkillSettingsCloseBtn = document.getElementById('desired-skill-settings-close');
const gameDescriptionBtn = document.getElementById('game-description-btn');
const pieceSlotTemplate = document.getElementById('piece-slot-template');
const skillBtnEls = [document.getElementById('skill-btn-0'), document.getElementById('skill-btn-1')];
const playerNameEls = [
  document.getElementById('player-name-0'),
  document.getElementById('player-name-1'),
];
const desiredPieceBtnEls = [
  document.getElementById('desired-piece-btn-0'),
  document.getElementById('desired-piece-btn-1'),
];
const playerColorOptionEls = [
  document.getElementById('player-color-options-0'),
  document.getElementById('player-color-options-1'),
];
const prepPlayerLabelEls = [
  document.getElementById('prep-player-label-0'),
  document.getElementById('prep-player-label-1'),
];
const desiredPiecePreviewEls = [
  document.getElementById('desired-piece-preview-0'),
  document.getElementById('desired-piece-preview-1'),
];
const desiredPieceModalEl = document.getElementById('desired-piece-modal');
const desiredPieceModalTitleEl = document.getElementById('desired-piece-modal-title');
const desiredPieceModalCopyEl = document.getElementById('desired-piece-modal-copy');
const desiredPieceGridEl = document.getElementById('desired-piece-grid');
const desiredPieceLivePreviewEl = document.getElementById('desired-piece-live-preview');
const desiredPieceCountEl = document.getElementById('desired-piece-count');
const desiredPieceResetBtn = document.getElementById('desired-piece-reset');
const desiredPieceCancelBtn = document.getElementById('desired-piece-cancel');
const desiredPieceSaveBtn = document.getElementById('desired-piece-save');
const piecePoolBtn = document.getElementById('piece-pool-btn');
const piecePoolModalEl = document.getElementById('piece-pool-modal');
const piecePoolSummaryEl = document.getElementById('piece-pool-summary');
const piecePoolListEl = document.getElementById('piece-pool-list');
const customPieceBtn = document.getElementById('custom-piece-btn');
const piecePoolCloseBtn = document.getElementById('piece-pool-close');
const computerDifficultyBtn = document.getElementById('computer-difficulty-btn');
const difficultyModalEl = document.getElementById('difficulty-modal');
const difficultyListEl = document.getElementById('difficulty-list');
const difficultyCloseBtn = document.getElementById('difficulty-close');
const gameDescriptionModalEl = document.getElementById('game-description-modal');
const gameDescriptionCloseBtn = document.getElementById('game-description-close');

const state = {
  board: [],
  scores: [0, 0],
  racks: [[], []],
  slotEls: [[], []],
  boardCells: [],
  activeDrags: new Map(),
  specialTiles: new Set(),
  desiredPieces: [],
  customShapes: [],
  allowedShapeIds: new Set(),
  skillCooldownEndsAt: [0, 0],
  nextCustomShapeNumber: 1,
  pieceEditorDraft: null,
  desiredGridCells: [],
  playerColorThemeIndexes: [0, 1],
  gameActive: false,
  matchInProgress: false,
  manualPauseActive: false,
  timeLeft: DEFAULT_GAME_DURATION,
  prepDuration: DEFAULT_GAME_DURATION,
  prepSpecialSpawnChance: DEFAULT_SPECIAL_SPAWN_CHANCE,
  prepDesiredSkillCost: DEFAULT_DESIRED_SKILL_COST,
  prepDesiredSkillCooldownMs: DEFAULT_DESIRED_SKILL_COOLDOWN_MS,
  desiredSkillEnabled: true,
  timerHandle: null,
  pauseHandle: null,
  skillUiHandle: null,
  boardMetrics: null,
  scorePopupHandle: null,
  vsComputer: false,
  computerMoveHandle: null,
  computerDifficulty: 'normal',
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

function getAllShapeDefs() {
  return [
    ...SHAPES,
    ...state.customShapes.map((shape) => ({ ...shape, custom: true })),
  ];
}

function getPlayerColorTheme(player) {
  const selectedIndex = state.playerColorThemeIndexes[player] ?? player;
  return PLAYER_COLOR_THEMES[selectedIndex] || PLAYER_COLOR_THEMES[player] || PLAYER_COLOR_THEMES[0];
}

function editorCoordsToCells(cellKeys) {
  return Array.from(cellKeys, (key) => key.split(',').map(Number));
}

function makePieceFromCells(cells, {
  shapeId = 'custom',
  previewColor = null,
  idPrefix = null,
} = {}) {
  const dims = dimsForCells(cloneCells(cells));
  return {
    id: `${idPrefix || 'N'}-${Math.random().toString(36).slice(2, 10)}`,
    shapeId,
    cells: dims.cells,
    width: dims.width,
    height: dims.height,
    previewColor: previewColor || randomItem(COLORS),
  };
}

function getPlayerPreviewColor(player) {
  return getPlayerColorTheme(player).previewColor || PLAYER_PREVIEW_COLORS[player] || randomItem(COLORS);
}

function getPlayerDesiredColor(player) {
  return getPlayerColorTheme(player).desiredColor || DESIRED_PREVIEW_COLORS[player] || getPlayerPreviewColor(player);
}

function makePiece(player = null) {
  const allShapes = getAllShapeDefs();
  const availableShapes = allShapes.filter((shape) => state.allowedShapeIds.has(shape.id));
  const shape = randomItem(availableShapes.length > 0 ? availableShapes : allShapes);
  return makePieceFromCells(shape.cells, {
    shapeId: shape.id,
    previewColor: player === null ? randomItem(COLORS) : getPlayerPreviewColor(player),
  });
}

function makeDesiredPiece(player, cells = defaultDesiredCells()) {
  return makePieceFromCells(cells, {
    shapeId: `desired-${player}`,
    idPrefix: `D${player}`,
    previewColor: getPlayerDesiredColor(player),
  });
}

function makeDesiredRackPiece(player) {
  return makeDesiredPiece(player, state.desiredPieces[player].cells);
}

function resetState() {
  state.board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
  state.scores = [0, 0];
  state.racks = [[], []];
  state.specialTiles = new Set();
  state.timeLeft = state.prepDuration;
  state.gameActive = false;
  state.manualPauseActive = false;
  clearActiveDrags();
  if (state.timerHandle) clearInterval(state.timerHandle);
  if (state.pauseHandle) clearInterval(state.pauseHandle);
  if (state.skillUiHandle) clearInterval(state.skillUiHandle);
  if (state.scorePopupHandle) clearTimeout(state.scorePopupHandle);
  if (state.computerMoveHandle) clearTimeout(state.computerMoveHandle);
  state.timerHandle = null;
  state.pauseHandle = null;
  state.skillUiHandle = null;
  state.scorePopupHandle = null;
  state.computerMoveHandle = null;
  state.skillCooldownEndsAt = [0, 0];
  scorePopupLayerEl.innerHTML = '';
  updateTimer();
  updateScores();
  renderPauseButton();
}

function isComputerPlayer(player) {
  return state.vsComputer && player === COMPUTER_PLAYER;
}

function getPlayerDisplayName(player) {
  if (isComputerPlayer(player)) return 'COMPUTER';
  return state.vsComputer && player === 1 ? 'PLAYER' : `PLAYER ${player + 1}`;
}

function getSkillLabel(player) {
  return isComputerPlayer(player) ? 'CPU Desired' : `P${player + 1} Desired`;
}

function getComputerDifficultyConfig() {
  return COMPUTER_DIFFICULTIES[state.computerDifficulty] || COMPUTER_DIFFICULTIES.normal;
}

function getComputerDifficultyLabel() {
  return getComputerDifficultyConfig().label;
}

function initAllowedShapes() {
  state.allowedShapeIds = new Set(getAllShapeDefs().map((shape) => shape.id));
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

function buildPiecePoolList() {
  piecePoolListEl.innerHTML = '';
  getAllShapeDefs().forEach((shape, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'piece-pool-item';
    cardEl.dataset.shapeId = shape.id;
    cardEl.tabIndex = 0;
    cardEl.setAttribute('role', 'button');
    cardEl.setAttribute('aria-pressed', 'true');
    cardEl.addEventListener('click', () => toggleAllowedShape(shape.id));
    cardEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleAllowedShape(shape.id);
      }
    });

    const previewEl = document.createElement('div');
    previewEl.className = 'piece-pool-item-preview';

    const metaEl = document.createElement('div');
    metaEl.className = 'piece-pool-item-meta';

    const nameEl = document.createElement('div');
    nameEl.className = 'piece-pool-item-name';
    nameEl.textContent = shape.custom ? shape.label : 'Common Piece';

    const stateEl = document.createElement('div');
    stateEl.className = 'piece-pool-item-state';

    metaEl.append(nameEl, stateEl);
    cardEl.append(previewEl, metaEl);
    if (shape.custom) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'piece-pool-item-delete';
      deleteBtn.setAttribute('aria-label', `Delete ${shape.label}`);
      deleteBtn.textContent = '×';
      deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        removeCustomShape(shape.id);
      });
      cardEl.appendChild(deleteBtn);
    }
    piecePoolListEl.appendChild(cardEl);

    const previewPiece = makePieceFromCells(shape.cells, {
      shapeId: shape.id,
      idPrefix: `P${index}`,
      previewColor: COLORS[index % COLORS.length],
    });
    const enabled = state.allowedShapeIds.has(shape.id);
    cardEl.classList.toggle('disabled', !enabled);
    cardEl.setAttribute('aria-pressed', String(enabled));
    stateEl.textContent = enabled ? 'Enabled' : 'Disabled';
    renderMiniPiece(previewEl, previewPiece, getRenderSlotSize(previewEl, 68), { forceEnabled: enabled });
  });
}

function buildDifficultyList() {
  difficultyListEl.innerHTML = '';
  Object.entries(COMPUTER_DIFFICULTIES).forEach(([key, config]) => {
    const optionEl = document.createElement('button');
    optionEl.type = 'button';
    optionEl.className = 'difficulty-option';
    optionEl.classList.toggle('active', key === state.computerDifficulty);
    optionEl.setAttribute('aria-pressed', String(key === state.computerDifficulty));
    optionEl.addEventListener('click', () => {
      state.computerDifficulty = key;
      renderModeUi();
      buildDifficultyList();
      if (state.vsComputer && state.gameActive) {
        clearComputerMoveTimer();
        scheduleComputerMove();
      }
    });

    const titleEl = document.createElement('div');
    titleEl.className = 'difficulty-option-title';
    titleEl.textContent = config.label.toUpperCase();

    const metaEl = document.createElement('div');
    metaEl.className = 'difficulty-option-meta';
    metaEl.textContent = `${(config.intervalMs / 1000).toFixed(0)}s per move`;

    const copyEl = document.createElement('div');
    copyEl.className = 'difficulty-option-copy';
    copyEl.textContent = config.description;

    optionEl.append(titleEl, metaEl, copyEl);
    difficultyListEl.appendChild(optionEl);
  });
}

function fillAllRacks() {
  for (let player = 0; player < 2; player += 1) {
    state.racks[player] = Array.from({ length: MAX_RACK }, () => makePiece(player));
  }
}

function getRenderSlotSize(targetEl, fallback = 72) {
  return Math.max(24, Math.min(targetEl.clientWidth || fallback, targetEl.clientHeight || fallback));
}

function renderMiniPiece(targetEl, piece, slotSize, { forceEnabled = false } = {}) {
  targetEl.innerHTML = '';
  if (!piece) return;

  const disabled = forceEnabled ? false : isPieceDisabled(piece);
  const safeSlotSize = slotSize || getRenderSlotSize(targetEl);
  const targetWidth = targetEl.clientWidth || safeSlotSize;
  const targetHeight = targetEl.clientHeight || safeSlotSize;

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
  pieceEl.style.left = `${(targetWidth - renderWidth) / 2}px`;
  pieceEl.style.top = `${(targetHeight - renderHeight) / 2}px`;

  piece.cells.forEach(([x, y]) => {
    const cell = document.createElement('div');
    cell.className = 'mini-piece-cell';
    cell.style.width = `${cellSize - 2}px`;
    cell.style.height = `${cellSize - 2}px`;
    cell.style.left = `${x * cellSize + 1}px`;
    cell.style.top = `${y * cellSize + 1}px`;
    const color = disabled
      ? 'linear-gradient(180deg, #8e97a0, #56606b)'
      : piece.previewColor;
    cell.style.background = color;
    if (disabled) {
      cell.style.boxShadow = 'inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.08)';
    }
    pieceEl.appendChild(cell);
  });

  targetEl.appendChild(pieceEl);
}

function renderDesiredPiecePreviews() {
  desiredPiecePreviewEls.forEach((previewEl, player) => {
    previewEl.setAttribute('aria-label', `${getPlayerDisplayName(player).toLowerCase()} desired piece`);
    renderMiniPiece(previewEl, state.desiredPieces[player], getRenderSlotSize(previewEl, 68), { forceEnabled: true });
  });
}

function buildPlayerColorOptions() {
  playerColorOptionEls.forEach((containerEl, player) => {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    PLAYER_COLOR_THEMES.forEach((theme, index) => {
      const optionEl = document.createElement('button');
      optionEl.type = 'button';
      optionEl.className = 'player-color-option';
      optionEl.dataset.player = String(player);
      optionEl.dataset.themeIndex = String(index);
      optionEl.setAttribute('aria-label', `${getPlayerDisplayName(player)} color ${theme.label}`);
      optionEl.setAttribute('title', theme.label);
      optionEl.style.setProperty('--swatch', theme.previewColor);
      containerEl.appendChild(optionEl);
    });
  });
}

function renderPlayerColorOptions() {
  playerColorOptionEls.forEach((containerEl, player) => {
    if (!containerEl) return;
    Array.from(containerEl.children).forEach((optionEl, index) => {
      const selected = index === state.playerColorThemeIndexes[player];
      optionEl.classList.toggle('active', selected);
      optionEl.setAttribute('aria-pressed', String(selected));
    });
  });
}

function renderPiecePoolButton() {
  piecePoolBtn.textContent = `Piece Types (${state.allowedShapeIds.size}/${getAllShapeDefs().length})`;
}

function renderModeUi() {
  playerNameEls.forEach((el, player) => {
    el.textContent = getPlayerDisplayName(player);
  });
  if (prepPlayerLabelEls[0]) prepPlayerLabelEls[0].textContent = state.vsComputer ? 'COMPUTER' : 'PLAYER 1';
  if (prepPlayerLabelEls[1]) prepPlayerLabelEls[1].textContent = state.vsComputer ? 'PLAYER' : 'PLAYER 2';
  const computerSetupLabel = state.vsComputer ? 'Computer Piece' : 'Desired Piece';
  const humanSetupLabel = state.vsComputer ? 'Your Piece' : 'Desired Piece';
  desiredPieceBtnEls[0].textContent = computerSetupLabel;
  desiredPieceBtnEls[1].textContent = humanSetupLabel;
  computerDifficultyBtn.classList.toggle('hidden', !state.vsComputer);
  computerDifficultyBtn.textContent = `Difficulty: ${getComputerDifficultyLabel()}`;
  vsComputerBtn.textContent = `VS Computer: ${state.vsComputer ? 'On' : 'Off'}`;
  vsComputerBtn.classList.toggle('active', state.vsComputer);
  renderPlayerColorOptions();
}

function renderPiecePoolList() {
  const scrollTop = piecePoolListEl.scrollTop;
  buildPiecePoolList();
  const totalCount = getAllShapeDefs().length;
  const enabledCount = state.allowedShapeIds.size;
  piecePoolSummaryEl.textContent = `${enabledCount} of ${totalCount} enabled`;
  customPieceBtn.textContent = `Add Custom Piece (${state.customShapes.length}/${MAX_CUSTOM_PIECES})`;
  customPieceBtn.disabled = state.customShapes.length >= MAX_CUSTOM_PIECES;
  piecePoolListEl.scrollTop = scrollTop;
  renderPiecePoolButton();
}

function renderSkillButtons() {
  const now = Date.now();
  skillBtnEls.forEach((btn, player) => {
    const score = Math.floor(state.scores[player]);
    const cooldownMs = Math.max(0, state.skillCooldownEndsAt[player] - now);
    const cooldownSeconds = cooldownMs / 1000;
    const handTurns = cooldownMs > 0 && state.prepDesiredSkillCooldownMs > 0
      ? cooldownMs / state.prepDesiredSkillCooldownMs
      : 0;
    const skillAvailable = state.desiredSkillEnabled;
    const canUse = skillAvailable && !isComputerPlayer(player) && state.gameActive && cooldownMs <= 0 && score >= state.prepDesiredSkillCost;

    btn.disabled = !canUse;
    btn.classList.toggle('cooldown-active', skillAvailable && cooldownMs > 0);
    btn.classList.toggle('insufficient-score', skillAvailable && state.gameActive && cooldownMs <= 0 && score < state.prepDesiredSkillCost);
    btn.innerHTML = `
      <span class="skill-btn-label">${getSkillLabel(player)}</span>
      <span class="skill-btn-cost">${skillAvailable ? `-${state.prepDesiredSkillCost}` : 'Disabled'}</span>
      ${skillAvailable && cooldownMs > 0 ? `
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
    const computerControlled = isComputerPlayer(player);
    slots.forEach((slotEl, slotIndex) => {
      const canvas = slotEl.querySelector('.piece-canvas');
      const piece = state.racks[player][slotIndex] || null;
      const disabled = isPieceDisabled(piece);
      slotEl.dataset.pieceId = piece ? piece.id : '';
      slotEl.classList.toggle('computer-controlled', computerControlled);
      slotEl.classList.toggle('disabled', disabled || computerControlled);
      renderMiniPiece(canvas, piece, Math.min(slotEl.clientWidth, slotEl.clientHeight));
      if (piece && !disabled && !computerControlled) attachPiecePointer(slotEl, piece, { sourceType: 'rack', player, slotIndex });
      else slotEl.onpointerdown = null;
    });
  });
}

function renderSpecialSlot() {
  return;
}

function renderBoard() {
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const cellEl = state.boardCells[y][x];
      cellEl.classList.remove('clearing', 'ghost-valid', 'ghost-invalid', 'special-spawn');
      cellEl.classList.toggle('special-tile', state.specialTiles.has(`${x},${y}`));
      cellEl.innerHTML = '';
      const cellState = state.board[y][x];
      if (cellState) {
        const fill = document.createElement('div');
        fill.className = 'board-cell-fill';
        if (state.specialTiles.has(`${x},${y}`)) fill.classList.add('on-special-tile');
        fill.style.background = cellState.previewColor;
        cellEl.appendChild(fill);
      }
    }
  }
}

function updateScores() {
  const highestScore = Math.max(...state.scores);
  const leaderCount = state.scores.filter((score) => score === highestScore).length;

  state.scores.forEach((score, i) => {
    scoreEls[i].textContent = String(Math.floor(score));
    const scoreBoxEl = scoreEls[i].parentElement;
    if (scoreBoxEl) {
      scoreBoxEl.classList.toggle('leader', leaderCount === 1 && score === highestScore);
    }
  });
  renderSkillButtons();
}

function renderPauseButton() {
  const autoPauseVisible = !pauseOverlayEl.classList.contains('hidden');
  const countdownVisible = !countdownOverlayEl.classList.contains('hidden');
  pauseBtnEl.hidden = !state.matchInProgress;
  pauseBtnEl.disabled = !state.gameActive || state.manualPauseActive || autoPauseVisible || countdownVisible;
}

function updateTimer() {
  timerEl.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
}

function clampPreparationDuration(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return state.prepDuration;
  return Math.max(MIN_GAME_DURATION, Math.min(MAX_GAME_DURATION, parsed));
}

function renderPreparationDuration() {
  if (prepTimeInputEl) prepTimeInputEl.value = String(state.prepDuration);
  if (!state.gameActive) {
    state.timeLeft = state.prepDuration;
    updateTimer();
  }
}

function getSpecialSpawnChancePercent() {
  return Math.round(state.prepSpecialSpawnChance * 100);
}

function renderSpecialSpawnChance() {
  if (specialSpawnBtn) {
    specialSpawnBtn.textContent = `Special Tile Chance: ${getSpecialSpawnChancePercent()}%`;
  }
  if (specialSpawnInputEl) {
    specialSpawnInputEl.value = String(getSpecialSpawnChancePercent());
  }
}

function renderDesiredSkillSettings() {
  if (desiredSkillSettingsBtn) {
    desiredSkillSettingsBtn.textContent = `Desired Skill: ${state.desiredSkillEnabled ? 'On' : 'Off'} · Cost ${state.prepDesiredSkillCost} · ${Math.round(state.prepDesiredSkillCooldownMs / 1000)}s`;
  }
  if (desiredSkillCostInputEl) {
    desiredSkillCostInputEl.value = String(state.prepDesiredSkillCost);
  }
  if (desiredSkillCooldownInputEl) {
    desiredSkillCooldownInputEl.value = String(Math.round(state.prepDesiredSkillCooldownMs / 1000));
  }
  if (desiredSkillToggleBtn) {
    desiredSkillToggleBtn.textContent = `Skill: ${state.desiredSkillEnabled ? 'On' : 'Off'}`;
    desiredSkillToggleBtn.classList.toggle('active', state.desiredSkillEnabled);
  }
}

function setPreparationDuration(value) {
  state.prepDuration = clampPreparationDuration(value);
  renderPreparationDuration();
}

function previewPreparationDuration(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepDuration = Math.min(MAX_GAME_DURATION, parsed);
  if (!state.gameActive) {
    state.timeLeft = state.prepDuration;
    updateTimer();
  }
}

function commitPreparationDuration() {
  if (!prepTimeInputEl) return;
  if (!prepTimeInputEl.value) {
    renderPreparationDuration();
    return;
  }
  setPreparationDuration(prepTimeInputEl.value);
}

function previewSpecialSpawnChance(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepSpecialSpawnChance = Math.max(0, Math.min(1, parsed / 100));
  renderSpecialSpawnChance();
}

function commitSpecialSpawnChance() {
  if (!specialSpawnInputEl) return;
  if (!specialSpawnInputEl.value) {
    renderSpecialSpawnChance();
    return;
  }
  previewSpecialSpawnChance(specialSpawnInputEl.value);
}

function previewDesiredSkillCost(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepDesiredSkillCost = Math.max(0, Math.min(100, Math.floor(parsed)));
  renderDesiredSkillSettings();
  renderSkillButtons();
}

function commitDesiredSkillCost() {
  if (!desiredSkillCostInputEl) return;
  if (!desiredSkillCostInputEl.value) {
    renderDesiredSkillSettings();
    return;
  }
  previewDesiredSkillCost(desiredSkillCostInputEl.value);
}

function previewDesiredSkillCooldown(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepDesiredSkillCooldownMs = Math.max(0, Math.min(100000, Math.floor(parsed) * 1000));
  renderDesiredSkillSettings();
  renderSkillButtons();
}

function commitDesiredSkillCooldown() {
  if (!desiredSkillCooldownInputEl) return;
  if (!desiredSkillCooldownInputEl.value) {
    renderDesiredSkillSettings();
    return;
  }
  previewDesiredSkillCooldown(desiredSkillCooldownInputEl.value);
}

function toggleDesiredSkillEnabled() {
  state.desiredSkillEnabled = !state.desiredSkillEnabled;
  renderDesiredSkillSettings();
  renderSkillButtons();
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
    cell.style.background = piece.previewColor;
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

function clearActiveDrags() {
  if (!state.activeDrags.size) return;
  state.activeDrags.forEach(cancelDragVisuals);
  state.activeDrags.clear();
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerUp);
  clearGhostMarks();
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
    state.board[y + dy][x + dx] = { previewColor: piece.previewColor };
  });
}

function specialTileKey(x, y) {
  return `${x},${y}`;
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
  const consumedSpecialTiles = [];
  clearSet.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cell = state.board[y][x];
    if (!cell) return;
    baseScore += 1;
    if (state.specialTiles.has(key)) consumedSpecialTiles.push(key);
  });
  const lineCount = rows.length + cols.length;
  const specialDoubled = consumedSpecialTiles.length > 0;
  return {
    points: baseScore * lineCount * (specialDoubled ? 2 : 1),
    lineCount,
    specialDoubled,
    consumedSpecialTiles,
  };
}

function cloneBoard(board = state.board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function canPlacePieceOnBoard(board, piece, x, y) {
  return piece.cells.every(([dx, dy]) => {
    const px = x + dx;
    const py = y + dy;
    return px >= 0 && px < BOARD_SIZE && py >= 0 && py < BOARD_SIZE && !board[py][px];
  });
}

function getClearInfoForBoard(board) {
  const rows = [];
  const cols = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    if (board[y].every(Boolean)) rows.push(y);
  }
  for (let x = 0; x < BOARD_SIZE; x += 1) {
    let full = true;
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      if (!board[y][x]) {
        full = false;
        break;
      }
    }
    if (full) cols.push(x);
  }
  return { rows, cols };
}

function scoreForClearOnBoard(board, specialTiles, rows, cols) {
  const clearSet = new Set();
  rows.forEach((y) => {
    for (let x = 0; x < BOARD_SIZE; x += 1) clearSet.add(`${x},${y}`);
  });
  cols.forEach((x) => {
    for (let y = 0; y < BOARD_SIZE; y += 1) clearSet.add(`${x},${y}`);
  });

  let baseScore = 0;
  const consumedSpecialTiles = [];
  clearSet.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cell = board[y][x];
    if (!cell) return;
    baseScore += 1;
    if (specialTiles.has(key)) consumedSpecialTiles.push(key);
  });

  const lineCount = rows.length + cols.length;
  const specialDoubled = consumedSpecialTiles.length > 0;
  return {
    points: baseScore * lineCount * (specialDoubled ? 2 : 1),
    lineCount,
    specialDoubled,
    consumedSpecialTiles,
  };
}

function countPlacementsOnBoard(board, piece) {
  let count = 0;
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (canPlacePieceOnBoard(board, piece, x, y)) count += 1;
    }
  }
  return count;
}

function evaluatePlacement(piece, x, y, {
  rack = state.racks[COMPUTER_PLAYER],
  specialTiles = state.specialTiles,
} = {}) {
  const simulatedBoard = cloneBoard();
  piece.cells.forEach(([dx, dy]) => {
    simulatedBoard[y + dy][x + dx] = { previewColor: piece.previewColor };
  });

  const clearInfo = getClearInfoForBoard(simulatedBoard);
  const scoreResult = (clearInfo.rows.length || clearInfo.cols.length)
    ? scoreForClearOnBoard(simulatedBoard, specialTiles, clearInfo.rows, clearInfo.cols)
    : { points: 0, lineCount: 0, specialDoubled: false, consumedSpecialTiles: [] };

  clearInfo.rows.forEach((row) => {
    for (let col = 0; col < BOARD_SIZE; col += 1) simulatedBoard[row][col] = null;
  });
  clearInfo.cols.forEach((col) => {
    for (let row = 0; row < BOARD_SIZE; row += 1) simulatedBoard[row][col] = null;
  });

  let occupiedCells = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (simulatedBoard[row][col]) occupiedCells += 1;
    }
  }

  const futurePlacements = rack
    .filter((candidate) => candidate && candidate.id !== piece.id)
    .reduce((total, candidate) => total + countPlacementsOnBoard(simulatedBoard, candidate), 0);

  return {
    piece,
    x,
    y,
    immediateScore: 1 + scoreResult.points,
    lineCount: scoreResult.lineCount,
    specialCount: scoreResult.consumedSpecialTiles.length,
    occupiedCells,
    futurePlacements,
  };
}

function compareComputerMoves(a, b, config) {
  if (!a) return 1;
  if (!b) return -1;
  if (config.selection === 'easy') {
    return (
      a.immediateScore - b.immediateScore
      || a.lineCount - b.lineCount
      || b.occupiedCells - a.occupiedCells
      || a.futurePlacements - b.futurePlacements
      || a.y - b.y
      || a.x - b.x
    );
  }
  if (config.selection === 'insane') {
    return (
      b.immediateScore - a.immediateScore
      || b.lineCount - a.lineCount
      || b.specialCount - a.specialCount
      || b.futurePlacements - a.futurePlacements
      || a.occupiedCells - b.occupiedCells
      || b.piece.cells.length - a.piece.cells.length
      || a.y - b.y
      || a.x - b.x
    );
  }
  return (
    b.immediateScore - a.immediateScore
    || b.lineCount - a.lineCount
    || b.futurePlacements - a.futurePlacements
    || b.specialCount - a.specialCount
    || a.occupiedCells - b.occupiedCells
    || b.piece.cells.length - a.piece.cells.length
    || a.y - b.y
    || a.x - b.x
  );
}

function pickBestComputerMoveForRack(rack, {
  useSkill = false,
  config = getComputerDifficultyConfig(),
} = {}) {
  const moves = [];
  const specialTiles = config.considerSpecialTiles ? state.specialTiles : new Set();
  rack.forEach((piece, slotIndex) => {
    if (!piece) return;
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        if (!canPlacePiece(piece, x, y)) continue;
        moves.push({
          ...evaluatePlacement(piece, x, y, { rack, specialTiles }),
          slotIndex,
          useSkill,
        });
      }
    }
  });

  if (!moves.length) return null;

  moves.sort((a, b) => compareComputerMoves(a, b, config));

  if (config.selection === 'easy') {
    const poolSize = Math.max(1, Math.min(moves.length, 6));
    return randomItem(moves.slice(0, poolSize));
  }
  if (config.selection === 'normal') {
    const poolSize = Math.max(1, Math.min(moves.length, 3));
    return randomItem(moves.slice(0, poolSize));
  }
  if (config.selection === 'hard') {
    const poolSize = Math.max(1, Math.min(moves.length, 2));
    return randomItem(moves.slice(0, poolSize));
  }
  return moves[0];
}

function canUseDesiredSkill(player, { allowComputer = false } = {}) {
  if (!state.desiredSkillEnabled) return false;
  if (!state.gameActive) return false;
  if (!allowComputer && isComputerPlayer(player)) return false;
  if (Math.floor(state.scores[player]) < state.prepDesiredSkillCost) return false;
  if (Date.now() < state.skillCooldownEndsAt[player]) return false;
  return true;
}

function getComputerMovePlan() {
  const config = getComputerDifficultyConfig();
  const currentRack = state.racks[COMPUTER_PLAYER];
  const regularMove = pickBestComputerMoveForRack(currentRack, { config, useSkill: false });
  if (!config.allowDesiredSkill || !canUseDesiredSkill(COMPUTER_PLAYER, { allowComputer: true })) {
    return regularMove;
  }

  const desiredSlotIndex = Math.floor(MAX_RACK / 2);
  const skillRack = currentRack.map((piece, index) => (
    index === desiredSlotIndex ? makeDesiredRackPiece(COMPUTER_PLAYER) : piece
  ));
  const skillMove = pickBestComputerMoveForRack(skillRack, { config, useSkill: true });
  if (!skillMove) return regularMove;
  if (!regularMove) return skillMove;
  return compareComputerMoves(skillMove, regularMove, config) < 0 ? skillMove : regularMove;
}

function getPopupAnchorCell(piece, x, y) {
  const anchorCell = piece.cells[piece.cells.length - 1] || [0, 0];
  return { x: x + anchorCell[0], y: y + anchorCell[1] };
}

function showScorePopup({ lineCount, points, specialDoubled }, anchorCell, player = null) {
  if (!state.boardMetrics) refreshLayoutMetrics();

  if (state.scorePopupHandle) clearTimeout(state.scorePopupHandle);
  state.scorePopupHandle = null;
  scorePopupLayerEl.innerHTML = '';

  const popupEl = document.createElement('div');
  popupEl.className = 'score-popup';
  if (player === 0) popupEl.classList.add('player-top-clear');

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
  }, 1000);
}

function animateAndClear(rows, cols, consumedSpecialTiles = []) {
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
    consumedSpecialTiles.forEach((key) => state.specialTiles.delete(key));
    renderBoard();
    renderRacks();
    renderSpecialSlot();
  }, CLEAR_ANIMATION_MS);
}

function animateSpecialTileSpawn(tileKeys) {
  tileKeys.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cellEl = state.boardCells?.[y]?.[x];
    if (!cellEl) return;
    cellEl.classList.remove('special-spawn');
    void cellEl.offsetWidth;
    cellEl.classList.add('special-spawn');
    setTimeout(() => cellEl.classList.remove('special-spawn'), 720);
  });
}

function renderSpawnedSpecialTiles(tileKeys) {
  tileKeys.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cellEl = state.boardCells?.[y]?.[x];
    if (!cellEl) return;
    cellEl.classList.add('special-tile');
    const fillEl = cellEl.querySelector('.board-cell-fill');
    if (fillEl) fillEl.classList.add('on-special-tile');
  });
}

function maybeSpawnSpecialTiles() {
  if (Math.random() >= state.prepSpecialSpawnChance) return;
  const availableTiles = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const key = specialTileKey(x, y);
      if (!state.specialTiles.has(key)) availableTiles.push(key);
    }
  }
  if (!availableTiles.length) return;
  const spawnCount = Math.min(SPECIAL_TILE_COUNT, availableTiles.length);
  const spawnedTiles = [];
  for (let i = 0; i < spawnCount; i += 1) {
    const pickIndex = Math.floor(Math.random() * availableTiles.length);
    const [tileKey] = availableTiles.splice(pickIndex, 1);
    state.specialTiles.add(tileKey);
    spawnedTiles.push(tileKey);
  }
  renderSpawnedSpecialTiles(spawnedTiles);
  animateSpecialTileSpawn(spawnedTiles);
  renderSpecialSlot();
}

function refillSource(source) {
  state.racks[source.player][source.slotIndex] = makePiece(source.player);
  renderRacks();
}

function clearComputerMoveTimer() {
  if (!state.computerMoveHandle) return;
  clearInterval(state.computerMoveHandle);
  state.computerMoveHandle = null;
}

function scheduleComputerMove() {
  if (!state.gameActive || !state.vsComputer) return;
  if (state.computerMoveHandle) return;
  const { intervalMs } = getComputerDifficultyConfig();
  state.computerMoveHandle = setInterval(() => {
    if (!state.gameActive || !state.vsComputer) return;
    runComputerTurn();
  }, intervalMs);
}

function runComputerTurn() {
  if (!state.gameActive || !state.vsComputer) return;
  const move = getComputerMovePlan();
  if (!move) return;

  if (move.useSkill) {
    const activated = activateDesiredSkill(COMPUTER_PLAYER, { allowComputer: true });
    if (!activated) return;
  }

  const slotIndex = move.slotIndex;
  if (slotIndex < 0) return;
  const originEl = state.slotEls[COMPUTER_PLAYER][slotIndex];
  if (!originEl) return;
  const piece = state.racks[COMPUTER_PLAYER][slotIndex];
  if (!piece || !canPlacePiece(piece, move.x, move.y)) return;

  placeDraggedPiece({
    piece,
    candidate: { x: move.x, y: move.y },
    source: { sourceType: 'rack', player: COMPUTER_PLAYER, slotIndex },
    originEl,
  });
}

function placeDraggedPiece(drag) {
  const { x, y } = drag.candidate;
  const scoringPlayer = drag.source.player;
  putPieceOnBoard(drag.piece, x, y);
  state.scores[scoringPlayer] += 1;
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  flashSuccess(drag.originEl);
  updateScores();

  const clearInfo = getClearInfo();
  if (clearInfo.rows.length || clearInfo.cols.length) {
    const scoreResult = scoreForClear(clearInfo.rows, clearInfo.cols);
    state.scores[scoringPlayer] += scoreResult.points;
    updateScores();
    showScorePopup(scoreResult, getPopupAnchorCell(drag.piece, x, y), scoringPlayer);
    animateAndClear(clearInfo.rows, clearInfo.cols, scoreResult.consumedSpecialTiles);
    maybeSpawnSpecialTiles();
  }

  refillSource(drag.source);
  setTimeout(() => checkForStuckAfterMove(drag.source.player), 240);
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
  renderPauseButton();
}

function hidePauseOverlay() {
  pauseOverlayEl.classList.add('hidden');
  renderPauseButton();
}

function openPauseMenu() {
  if (!state.gameActive) return;
  state.gameActive = false;
  state.manualPauseActive = true;
  clearComputerMoveTimer();
  clearActiveDrags();
  pauseMenuOverlayEl.classList.remove('hidden');
  renderSkillButtons();
  renderPauseButton();
}

function closePauseMenu() {
  pauseMenuOverlayEl.classList.add('hidden');
}

function resumePausedGame() {
  if (!state.manualPauseActive) return;
  closePauseMenu();
  renderPauseButton();
  startVisibleCountdown('RESUME', RESUME_COUNTDOWN, () => {
    state.manualPauseActive = false;
    state.gameActive = true;
    renderSkillButtons();
    renderPauseButton();
    scheduleComputerMove();
  });
}

function quitPausedGame() {
  if (!state.manualPauseActive) return;
  const shouldQuit = window.confirm('Quit the current game and return to the setup screen?');
  if (!shouldQuit) return;
  closePauseMenu();
  returnToPreparation();
}

function clearBoardAndRefreshPieces() {
  state.board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
  state.specialTiles = new Set();
  fillAllRacks();
  renderBoard();
  renderRacks();
  renderSpecialSlot();
}

function handleStuck(triggerPlayer) {
  state.gameActive = false;
  clearComputerMoveTimer();
  state.scores[triggerPlayer] = Math.floor(state.scores[triggerPlayer] * 0.75);
  updateScores();
  showPauseOverlay(`${getPlayerDisplayName(triggerPlayer)} caused a jam. Score reduced by 25%!`);
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
    scheduleComputerMove();
  }, 1000);
}

function startVisibleCountdown(title, from, onDone) {
  countdownTitleEl.textContent = title;
  countdownNumberEl.textContent = String(from);
  countdownOverlayEl.classList.remove('hidden');
  renderPauseButton();
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
      renderPauseButton();
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
  state.matchInProgress = false;
  state.manualPauseActive = false;
  clearComputerMoveTimer();
  if (state.timerHandle) clearInterval(state.timerHandle);
  if (state.skillUiHandle) clearInterval(state.skillUiHandle);
  state.timerHandle = null;
  state.skillUiHandle = null;
  closePauseMenu();
  hidePauseOverlay();
  renderSkillButtons();
  renderPauseButton();
  const [a, b] = state.scores;
  let title = 'DRAW';
  if (a > b) title = `${getPlayerDisplayName(0)} WINS`;
  else if (b > a) title = `${getPlayerDisplayName(1)} WINS`;
  endTitleEl.textContent = title;
  endSummaryEl.innerHTML = `
    <div>${getPlayerDisplayName(0)}: <strong>${Math.floor(a)}</strong></div>
    <div>${getPlayerDisplayName(1)}: <strong>${Math.floor(b)}</strong></div>
  `;
  endOverlayEl.classList.remove('hidden');
}

function toggleVsComputer() {
  state.vsComputer = !state.vsComputer;
  closeDifficultyModal();
  renderModeUi();
  renderDesiredPiecePreviews();
  renderSkillButtons();
  renderRacks();
}

function openDifficultyModal() {
  if (!state.vsComputer) return;
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeSpecialSpawnModal();
  closeDesiredSkillSettingsModal();
  difficultyModalEl.classList.remove('hidden');
  buildDifficultyList();
}

function closeDifficultyModal() {
  difficultyModalEl.classList.add('hidden');
}

function openSpecialSpawnModal() {
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeDesiredSkillSettingsModal();
  renderSpecialSpawnChance();
  specialSpawnModalEl.classList.remove('hidden');
}

function closeSpecialSpawnModal() {
  specialSpawnModalEl.classList.add('hidden');
}

function openDesiredSkillSettingsModal() {
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeSpecialSpawnModal();
  renderDesiredSkillSettings();
  desiredSkillSettingsModalEl.classList.remove('hidden');
}

function closeDesiredSkillSettingsModal() {
  desiredSkillSettingsModalEl.classList.add('hidden');
}

function centerCellsInEditor(cells) {
  const dims = dimsForCells(cells);
  const offsetX = Math.floor((DESIRED_GRID_SIZE - dims.width) / 2);
  const offsetY = Math.floor((DESIRED_GRID_SIZE - dims.height) / 2);
  return dims.cells.map(([x, y]) => `${x + offsetX},${y + offsetY}`);
}

function getPieceEditorConfig() {
  if (state.pieceEditorDraft?.mode === 'custom') {
    return {
      title: 'CUSTOM PIECE',
      copy: 'Draw up to 5 blocks in the 5 x 5 field to add a custom piece.',
      previewFactory: (cells) => makePieceFromCells(cells, {
        shapeId: 'custom-preview',
        idPrefix: 'C',
        previewColor: COLORS[state.customShapes.length % COLORS.length],
      }),
    };
  }
  return {
    title: 'DESIRED PIECE',
    copy: 'Draw up to 5 blocks in the 5 x 5 field.',
    previewFactory: (cells) => makeDesiredPiece(state.pieceEditorDraft.player, cells),
  };
}

function updateDesiredPieceModal() {
  const draftKeys = state.pieceEditorDraft?.cellKeys || new Set(centerCellsInEditor(defaultDesiredCells()));
  const config = getPieceEditorConfig();
  desiredPieceModalTitleEl.textContent = config.title;
  desiredPieceModalCopyEl.textContent = config.copy;
  state.desiredGridCells.forEach((cellEl) => {
    const key = `${cellEl.dataset.x},${cellEl.dataset.y}`;
    cellEl.classList.toggle('active', draftKeys.has(key));
  });

  const cells = editorCoordsToCells(draftKeys);
  const previewPiece = cells.length > 0 ? config.previewFactory(cells) : null;
  renderMiniPiece(desiredPieceLivePreviewEl, previewPiece, getRenderSlotSize(desiredPieceLivePreviewEl, 88), { forceEnabled: true });
  desiredPieceCountEl.textContent = `${cells.length} / ${DESIRED_MAX_BLOCKS} blocks`;
  desiredPieceCountEl.classList.toggle('maxed', cells.length >= DESIRED_MAX_BLOCKS);
  desiredPieceSaveBtn.disabled = cells.length === 0;
}

function openDesiredPieceModal(player) {
  closeGameDescriptionModal();
  closeDifficultyModal();
  closeSpecialSpawnModal();
  closeDesiredSkillSettingsModal();
  closePiecePoolModal();
  state.pieceEditorDraft = {
    mode: 'desired',
    player,
    cellKeys: new Set(centerCellsInEditor(state.desiredPieces[player].cells)),
  };
  desiredPieceModalEl.classList.remove('hidden');
  updateDesiredPieceModal();
}

function openCustomPieceModal() {
  if (state.customShapes.length >= MAX_CUSTOM_PIECES) return;
  closeGameDescriptionModal();
  closeDifficultyModal();
  closeSpecialSpawnModal();
  closeDesiredSkillSettingsModal();
  closePiecePoolModal();
  state.pieceEditorDraft = {
    mode: 'custom',
    returnToPiecePool: true,
    cellKeys: new Set(centerCellsInEditor(defaultDesiredCells())),
  };
  desiredPieceModalEl.classList.remove('hidden');
  updateDesiredPieceModal();
}

function closeDesiredPieceModal({ reopenPiecePool = false } = {}) {
  desiredPieceModalEl.classList.add('hidden');
  state.pieceEditorDraft = null;
  if (reopenPiecePool) openPiecePoolModal();
}

function openPiecePoolModal() {
  closeGameDescriptionModal();
  closeDifficultyModal();
  closeSpecialSpawnModal();
  closeDesiredSkillSettingsModal();
  closeDesiredPieceModal();
  piecePoolModalEl.classList.remove('hidden');
  renderPiecePoolList();
}

function closePiecePoolModal() {
  piecePoolModalEl.classList.add('hidden');
}

function openGameDescriptionModal() {
  closeDifficultyModal();
  closeSpecialSpawnModal();
  closeDesiredSkillSettingsModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  gameDescriptionModalEl.classList.remove('hidden');
}

function closeGameDescriptionModal() {
  gameDescriptionModalEl.classList.add('hidden');
}

function toggleAllowedShape(shapeId) {
  if (state.allowedShapeIds.has(shapeId)) {
    if (state.allowedShapeIds.size === 1) return;
    state.allowedShapeIds.delete(shapeId);
  } else {
    state.allowedShapeIds.add(shapeId);
  }
  renderPiecePoolList();
}

function toggleDesiredDraftCell(x, y) {
  if (!state.pieceEditorDraft) return;
  const key = `${x},${y}`;
  if (state.pieceEditorDraft.cellKeys.has(key)) {
    state.pieceEditorDraft.cellKeys.delete(key);
  } else if (state.pieceEditorDraft.cellKeys.size < DESIRED_MAX_BLOCKS) {
    state.pieceEditorDraft.cellKeys.add(key);
  }
  updateDesiredPieceModal();
}

function resetDesiredDraft() {
  if (!state.pieceEditorDraft) return;
  state.pieceEditorDraft.cellKeys = new Set(centerCellsInEditor(defaultDesiredCells()));
  updateDesiredPieceModal();
}

function saveDesiredDraft() {
  if (!state.pieceEditorDraft) return;
  const cells = editorCoordsToCells(state.pieceEditorDraft.cellKeys);
  if (cells.length === 0) return;
  if (state.pieceEditorDraft.mode === 'custom') {
    const shapeNumber = state.nextCustomShapeNumber;
    const shapeId = `custom-${shapeNumber}`;
    state.nextCustomShapeNumber += 1;
    state.customShapes.push({
      id: shapeId,
      label: `Custom Piece ${shapeNumber}`,
      cells: dimsForCells(cells).cells,
    });
    state.allowedShapeIds.add(shapeId);
    renderPiecePoolList();
    closeDesiredPieceModal({ reopenPiecePool: true });
    return;
  }
  state.desiredPieces[state.pieceEditorDraft.player] = makeDesiredPiece(state.pieceEditorDraft.player, cells);
  renderDesiredPiecePreviews();
  closeDesiredPieceModal();
}

function setPlayerColorTheme(player, themeIndex) {
  if (!Number.isInteger(themeIndex)) return;
  if (!PLAYER_COLOR_THEMES[themeIndex]) return;
  state.playerColorThemeIndexes[player] = themeIndex;
  state.desiredPieces[player] = makeDesiredPiece(player, state.desiredPieces[player].cells);
  state.racks[player] = state.racks[player].map((piece) => {
    if (!piece) return piece;
    if (piece.shapeId === `desired-${player}`) return makeDesiredRackPiece(player);
    return {
      ...piece,
      previewColor: getPlayerPreviewColor(player),
    };
  });
  renderModeUi();
  renderDesiredPiecePreviews();
  renderRacks();
  renderBoard();
}

function replaceRemovedShapeInRacks(shapeId) {
  let changed = false;
  state.racks = state.racks.map((rack, player) => rack.map((piece) => {
    if (piece?.shapeId !== shapeId) return piece;
    changed = true;
    return makePiece(player);
  }));
  if (changed) renderRacks();
}

function removeCustomShape(shapeId) {
  const nextCustomShapes = state.customShapes.filter((shape) => shape.id !== shapeId);
  if (nextCustomShapes.length === state.customShapes.length) return;
  state.customShapes = nextCustomShapes;
  state.allowedShapeIds.delete(shapeId);
  if (state.allowedShapeIds.size === 0) {
    const fallbackShape = getAllShapeDefs()[0];
    if (fallbackShape) state.allowedShapeIds.add(fallbackShape.id);
  }
  replaceRemovedShapeInRacks(shapeId);
  renderPiecePoolList();
}

function activateDesiredSkill(player, { allowComputer = false } = {}) {
  if (!canUseDesiredSkill(player, { allowComputer })) return false;
  state.scores[player] -= state.prepDesiredSkillCost;
  state.skillCooldownEndsAt[player] = Date.now() + state.prepDesiredSkillCooldownMs;
  state.racks[player][Math.floor(MAX_RACK / 2)] = makeDesiredRackPiece(player);
  updateScores();
  renderRacks();
  return true;
}

function initDesiredPieces() {
  state.desiredPieces = [makeDesiredPiece(0), makeDesiredPiece(1)];
  renderDesiredPiecePreviews();
}

function startGameFlow() {
  commitPreparationDuration();
  commitSpecialSpawnChance();
  commitDesiredSkillCost();
  commitDesiredSkillCooldown();
  endOverlayEl.classList.add('hidden');
  overlayEl.classList.add('hidden');
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeSpecialSpawnModal();
  closeDesiredSkillSettingsModal();
  closePauseMenu();
  hidePauseOverlay();
  resetState();
  state.matchInProgress = true;
  renderPauseButton();
  fillAllRacks();
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  renderModeUi();
  renderDesiredPiecePreviews();
  refreshLayoutMetrics();
  startVisibleCountdown('START', 3, () => {
    state.gameActive = true;
    startSkillUiLoop();
    renderSkillButtons();
    renderPauseButton();
    startTimerLoop();
    scheduleComputerMove();
  });
}

function returnToPreparation() {
  endOverlayEl.classList.add('hidden');
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeSpecialSpawnModal();
  closeDesiredSkillSettingsModal();
  closePauseMenu();
  hidePauseOverlay();
  resetState();
  state.matchInProgress = false;
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  renderModeUi();
  renderDesiredPiecePreviews();
  renderSkillButtons();
  renderPreparationDuration();
  renderSpecialSpawnChance();
  renderDesiredSkillSettings();
  overlayEl.classList.remove('hidden');
  refreshLayoutMetrics();
  renderPauseButton();
}

function init() {
  buildBoard();
  buildRacks();
  buildDesiredPieceGrid();
  buildPlayerColorOptions();
  buildDifficultyList();
  initAllowedShapes();
  initDesiredPieces();
  resetState();
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  renderModeUi();
  renderSkillButtons();
  renderPiecePoolList();
  renderPiecePoolButton();
  renderPreparationDuration();
  renderSpecialSpawnChance();
  renderDesiredSkillSettings();
  refreshLayoutMetrics();
  renderPauseButton();
}

desiredPieceBtnEls.forEach((btn, player) => {
  btn.addEventListener('click', () => openDesiredPieceModal(player));
});
playerColorOptionEls.forEach((containerEl, player) => {
  containerEl?.addEventListener('click', (event) => {
    const optionEl = event.target.closest('.player-color-option');
    if (!optionEl) return;
    setPlayerColorTheme(player, Number(optionEl.dataset.themeIndex));
  });
});
piecePoolBtn.addEventListener('click', openPiecePoolModal);
specialSpawnBtn.addEventListener('click', openSpecialSpawnModal);
desiredSkillSettingsBtn.addEventListener('click', openDesiredSkillSettingsModal);
gameDescriptionBtn.addEventListener('click', openGameDescriptionModal);
vsComputerBtn.addEventListener('click', toggleVsComputer);
computerDifficultyBtn.addEventListener('click', openDifficultyModal);
customPieceBtn.addEventListener('click', openCustomPieceModal);
prepTimeInputEl?.addEventListener('input', (event) => {
  const digitsOnly = event.target.value.replace(/[^\d]/g, '');
  event.target.value = digitsOnly;
  if (digitsOnly) previewPreparationDuration(digitsOnly);
});
prepTimeInputEl?.addEventListener('blur', () => {
  commitPreparationDuration();
});
specialSpawnInputEl?.addEventListener('input', (event) => {
  const digitsOnly = event.target.value.replace(/[^\d]/g, '');
  event.target.value = digitsOnly;
  if (digitsOnly) previewSpecialSpawnChance(digitsOnly);
});
specialSpawnInputEl?.addEventListener('blur', () => {
  commitSpecialSpawnChance();
});
desiredSkillCostInputEl?.addEventListener('input', (event) => {
  const digitsOnly = event.target.value.replace(/[^\d]/g, '');
  event.target.value = digitsOnly;
  if (digitsOnly) previewDesiredSkillCost(digitsOnly);
});
desiredSkillCostInputEl?.addEventListener('blur', () => {
  commitDesiredSkillCost();
});
desiredSkillCooldownInputEl?.addEventListener('input', (event) => {
  const digitsOnly = event.target.value.replace(/[^\d]/g, '');
  event.target.value = digitsOnly;
  if (digitsOnly) previewDesiredSkillCooldown(digitsOnly);
});
desiredSkillCooldownInputEl?.addEventListener('blur', () => {
  commitDesiredSkillCooldown();
});
desiredSkillToggleBtn.addEventListener('click', toggleDesiredSkillEnabled);
skillBtnEls.forEach((btn, player) => {
  btn.addEventListener('click', () => activateDesiredSkill(player));
});
desiredPieceResetBtn.addEventListener('click', resetDesiredDraft);
desiredPieceCancelBtn.addEventListener('click', () => closeDesiredPieceModal({
  reopenPiecePool: Boolean(state.pieceEditorDraft?.returnToPiecePool),
}));
desiredPieceSaveBtn.addEventListener('click', saveDesiredDraft);
piecePoolCloseBtn.addEventListener('click', closePiecePoolModal);
difficultyCloseBtn.addEventListener('click', closeDifficultyModal);
specialSpawnCloseBtn.addEventListener('click', () => {
  commitSpecialSpawnChance();
  closeSpecialSpawnModal();
});
desiredSkillSettingsCloseBtn.addEventListener('click', () => {
  commitDesiredSkillCost();
  commitDesiredSkillCooldown();
  closeDesiredSkillSettingsModal();
});
gameDescriptionCloseBtn.addEventListener('click', closeGameDescriptionModal);
pauseBtnEl.addEventListener('click', openPauseMenu);
pauseMenuResumeBtn.addEventListener('click', resumePausedGame);
pauseMenuQuitBtn.addEventListener('click', quitPausedGame);
desiredPieceModalEl.addEventListener('click', (event) => {
  if (event.target === desiredPieceModalEl) {
    closeDesiredPieceModal({ reopenPiecePool: Boolean(state.pieceEditorDraft?.returnToPiecePool) });
  }
});
difficultyModalEl.addEventListener('click', (event) => {
  if (event.target === difficultyModalEl) closeDifficultyModal();
});
specialSpawnModalEl.addEventListener('click', (event) => {
  if (event.target === specialSpawnModalEl) {
    commitSpecialSpawnChance();
    closeSpecialSpawnModal();
  }
});
desiredSkillSettingsModalEl.addEventListener('click', (event) => {
  if (event.target === desiredSkillSettingsModalEl) {
    commitDesiredSkillCost();
    commitDesiredSkillCooldown();
    closeDesiredSkillSettingsModal();
  }
});
piecePoolModalEl.addEventListener('click', (event) => {
  if (event.target === piecePoolModalEl) closePiecePoolModal();
});
gameDescriptionModalEl.addEventListener('click', (event) => {
  if (event.target === gameDescriptionModalEl) closeGameDescriptionModal();
});
startBtn.addEventListener('click', startGameFlow);
restartBtn.addEventListener('click', returnToPreparation);
window.addEventListener('resize', () => {
  refreshLayoutMetrics();
  renderRacks();
  renderSpecialSlot();
  renderDesiredPiecePreviews();
  if (state.pieceEditorDraft) updateDesiredPieceModal();
  if (!piecePoolModalEl.classList.contains('hidden')) renderPiecePoolList();
});

function hasScrollableParent(target) {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1) {
        return true;
      }
    }
    node = node.parentElement;
  }
  return false;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !desiredPieceModalEl.classList.contains('hidden')) {
    closeDesiredPieceModal({ reopenPiecePool: Boolean(state.pieceEditorDraft?.returnToPiecePool) });
  } else if (event.key === 'Escape' && !difficultyModalEl.classList.contains('hidden')) {
    closeDifficultyModal();
  } else if (event.key === 'Escape' && !specialSpawnModalEl.classList.contains('hidden')) {
    commitSpecialSpawnChance();
    closeSpecialSpawnModal();
  } else if (event.key === 'Escape' && !desiredSkillSettingsModalEl.classList.contains('hidden')) {
    commitDesiredSkillCost();
    commitDesiredSkillCooldown();
    closeDesiredSkillSettingsModal();
  } else if (event.key === 'Escape' && !piecePoolModalEl.classList.contains('hidden')) {
    closePiecePoolModal();
  } else if (event.key === 'Escape' && !gameDescriptionModalEl.classList.contains('hidden')) {
    closeGameDescriptionModal();
  } else if (event.key === 'Escape' && state.gameActive) {
    openPauseMenu();
  }
});

document.addEventListener('touchmove', (event) => {
  if (hasScrollableParent(event.target)) return;
  event.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', (event) => {
  event.preventDefault();
});

init();
