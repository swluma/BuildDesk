const BOARD_SIZE = 8;
const MAX_RACK = 3;
const DEFAULT_GAME_DURATION = 120;
const MIN_GAME_DURATION = 30;
const MAX_GAME_DURATION = 600;
const DEFAULT_SPECIAL_SPAWN_CHANCE = 0.05;
const DEFAULT_STUCK_PENALTY = 0.25;
const SPECIAL_TILE_COUNT = 3;
const SKILL_TILE_SPAWN_INTERVAL_MS = 10000;
const SKILL_TILE_SPAWN_COUNT = 2;
const DEFAULT_MAX_SKILL_TILES = 10;
const SCORE_BOOST_DURATION_MS = 10000;
const RESUME_COUNTDOWN = 3;
const INVALID_FLASH_MS = 800;
const SUCCESS_FLASH_MS = 700;
const CLEAR_ANIMATION_MS = 360;
const DESIRED_GRID_SIZE = 5;
const DESIRED_MAX_BLOCKS = 5;
const DEFAULT_DESIRED_SKILL_COST = 15;
const DEFAULT_DESIRED_SKILL_COOLDOWN_MS = 15000;
const MAX_CUSTOM_PIECES = 10;
const MIN_CUSTOM_COMPUTER_INTERVAL_MS = 100;
const MAX_CUSTOM_COMPUTER_INTERVAL_MS = 5000;
const IDLE_PENALTY_GRACE_MS = 5000;
const IDLE_PENALTY_TICK_MS = 1000;
const SETTINGS_STORAGE_KEY = 'blockblast_duel_settings_v1';
const multiplayerApi = window.BlockblastMultiplayer || {};

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
    glowColor: '255, 79, 116',
  },
  {
    id: 'blue',
    label: 'Blue',
    previewColor: 'linear-gradient(180deg, #7fc4ff 0%, #2f74e8 100%)',
    desiredColor: 'linear-gradient(180deg, #a2d6ff 0%, #478cff 100%)',
    glowColor: '71, 140, 255',
  },
  {
    id: 'gold',
    label: 'Gold',
    previewColor: 'linear-gradient(180deg, #ffe48b 0%, #de9b23 100%)',
    desiredColor: 'linear-gradient(180deg, #ffefb2 0%, #f1b545 100%)',
    glowColor: '241, 181, 69',
  },
  {
    id: 'mint',
    label: 'Mint',
    previewColor: 'linear-gradient(180deg, #9ff8ce 0%, #24b276 100%)',
    desiredColor: 'linear-gradient(180deg, #c6ffe2 0%, #49ca93 100%)',
    glowColor: '73, 202, 147',
  },
  {
    id: 'violet',
    label: 'Violet',
    previewColor: 'linear-gradient(180deg, #c1a5ff 0%, #7548e3 100%)',
    desiredColor: 'linear-gradient(180deg, #dbc8ff 0%, #9168f3 100%)',
    glowColor: '145, 104, 243',
  },
  {
    id: 'coral',
    label: 'Coral',
    previewColor: 'linear-gradient(180deg, #ffb091 0%, #ea6133 100%)',
    desiredColor: 'linear-gradient(180deg, #ffc8b2 0%, #ff7a4f 100%)',
    glowColor: '255, 122, 79',
  },
];

const SKILL_TILE_TYPES = [
  { id: 'red', label: 'Score Boost', color: '#ff5a6b' },
  { id: 'blue', label: 'Piece Block', color: '#4da3ff' },
  { id: 'green', label: 'Area Clear', color: '#54db7d' },
];

const SHAPES = [
  { id: 'single', cells: [[0, 0]] },
  { id: 'dominoH', cells: [[0, 0], [1, 0]] },
  { id: 'dominoV', cells: [[0, 0], [0, 1]] },
  { id: 'tripleH', cells: [[0, 0], [1, 0], [2, 0]] },
  { id: 'tripleV', cells: [[0, 0], [0, 1], [0, 2]] },
  { id: 'square2', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { id: 'L3c', cells: [[0, 0], [1, 0], [0, 1]] },
  { id: 'L3d', cells: [[0, 0], [1, 0], [1, 1]] },
  { id: 'L3a', cells: [[0, 0], [0, 1], [1, 1]] },
  { id: 'L3b', cells: [[1, 0], [0, 1], [1, 1]] },
  { id: 'L4a', cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { id: 'L4b', cells: [[1, 0], [1, 1], [1, 2], [0, 2]] },
  { id: 'L4c', cells: [[0, 0], [1, 0], [2, 0], [0, 1]] },
  { id: 'L4d', cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  { id: 'L4e', cells: [[0, 0], [1, 0], [0, 1], [0, 2]] },
  { id: 'L4f', cells: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  { id: 'L4g', cells: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  { id: 'L4h', cells: [[2, 0], [0, 1], [1, 1], [2, 1]] },
  { id: 'T4', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  { id: 'T4up', cells: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  { id: 'T4left', cells: [[0, 0], [0, 1], [1, 1], [0, 2]] },
  { id: 'T4right', cells: [[1, 0], [0, 1], [1, 1], [1, 2]] },
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
const scoreBoxEls = scoreEls.map((el) => el?.parentElement || null);
const ownedSkillEls = [document.getElementById('owned-skill-0'), document.getElementById('owned-skill-1')];
const ownedSkillBoxEls = ownedSkillEls.map((el) => el?.parentElement || null);
const timerEl = document.getElementById('timer');
const pauseBtnEl = document.getElementById('pause-btn');
const overlayEl = document.getElementById('overlay');
const sessionStatusPillEl = document.getElementById('session-status-pill');
const sessionWarningEl = document.getElementById('session-warning');
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
const roomStatusBtn = document.getElementById('room-status-btn');
const roomStatusModalEl = document.getElementById('room-status-modal');
const roomPrepPanelEl = document.getElementById('room-prep-panel');
const roomModeBadgeEl = document.getElementById('room-mode-badge');
const roomPhaseValueEl = document.getElementById('room-phase-value');
const roomPlayerNameEl = document.getElementById('room-player-name');
const roomCodeValueEl = document.getElementById('room-code-value');
const roomConnectionStatusEl = document.getElementById('room-connection-status');
const roomConnectionStatusCopyEl = document.getElementById('room-connection-status-copy');
const roomOpponentStatusEl = document.getElementById('room-opponent-status');
const roomStatusCopyEl = document.getElementById('room-status-copy');
const roomRetryBtn = document.getElementById('room-retry-btn');
const continueLocalBtn = document.getElementById('continue-local-btn');
const roomStatusCloseBtn = document.getElementById('room-status-close');
const restartBtn = document.getElementById('restart-btn');
const computerModeBtnEls = [
  document.getElementById('computer-mode-btn-0'),
  document.getElementById('computer-mode-btn-1'),
];
const prepTimeInputEl = document.getElementById('prep-time-input');
const specialSpawnBtn = document.getElementById('special-spawn-btn');
const specialSpawnModalEl = document.getElementById('special-spawn-modal');
const specialSpawnInputEl = document.getElementById('special-spawn-input');
const specialSpawnCloseBtn = document.getElementById('special-spawn-close');
const skillTileSettingsBtn = document.getElementById('skill-tile-settings-btn');
const skillTileSettingsModalEl = document.getElementById('skill-tile-settings-modal');
const skillTileIntervalInputEl = document.getElementById('skill-tile-interval-input');
const skillTileMaxInputEl = document.getElementById('skill-tile-max-input');
const skillTileMaxValueEl = document.getElementById('skill-tile-max-value');
const skillTileSettingsCloseBtn = document.getElementById('skill-tile-settings-close');
const stuckPenaltyBtn = document.getElementById('stuck-penalty-btn');
const nonStopModeBtn = document.getElementById('non-stop-mode-btn');
const stuckPenaltyModalEl = document.getElementById('stuck-penalty-modal');
const stuckPenaltyInputEl = document.getElementById('stuck-penalty-input');
const stuckPenaltyCloseBtn = document.getElementById('stuck-penalty-close');
const desiredSkillSettingsBtn = document.getElementById('desired-skill-settings-btn');
const settingsTransferBtn = document.getElementById('settings-transfer-btn');
const desiredSkillSettingsModalEl = document.getElementById('desired-skill-settings-modal');
const desiredSkillCostInputEl = document.getElementById('desired-skill-cost-input');
const desiredSkillCooldownInputEl = document.getElementById('desired-skill-cooldown-input');
const desiredSkillToggleBtn = document.getElementById('desired-skill-toggle-btn');
const desiredSkillSettingsCloseBtn = document.getElementById('desired-skill-settings-close');
const gameDescriptionBtn = document.getElementById('game-description-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
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
const blockStyleBtnEls = [
  document.getElementById('block-style-btn-0'),
  document.getElementById('block-style-btn-1'),
];
const prepPlayerLabelEls = [
  document.getElementById('prep-player-label-0'),
  document.getElementById('prep-player-label-1'),
];
const desiredPiecePreviewEls = [
  document.getElementById('desired-piece-preview-0'),
  document.getElementById('desired-piece-preview-1'),
];
const blockStyleModalEl = document.getElementById('block-style-modal');
const blockStyleModalTitleEl = document.getElementById('block-style-modal-title');
const blockStyleModalCopyEl = document.getElementById('block-style-modal-copy');
const blockStylePreviewEl = document.getElementById('block-style-preview');
const blockStyleGlowValueEl = document.getElementById('block-style-glow-value');
const blockStyleColorOptionsEl = document.getElementById('block-style-color-options');
const blockStyleColorPickerEl = document.getElementById('block-style-color-picker');
const blockStyleColorCodeEl = document.getElementById('block-style-color-code');
const blockStyleGlowInputEl = document.getElementById('block-style-glow-input');
const blockStyleCloseBtn = document.getElementById('block-style-close');
const settingsTransferModalEl = document.getElementById('settings-transfer-modal');
const settingsExportOutputEl = document.getElementById('settings-export-output');
const settingsImportInputEl = document.getElementById('settings-import-input');
const settingsCopyBtn = document.getElementById('settings-copy-btn');
const settingsSaveBtn = document.getElementById('settings-save-btn');
const settingsLoadBtn = document.getElementById('settings-load-btn');
const settingsUploadBtn = document.getElementById('settings-upload-btn');
const settingsUploadInputEl = document.getElementById('settings-upload-input');
const settingsTransferStatusEl = document.getElementById('settings-transfer-status');
const settingsTransferCloseBtn = document.getElementById('settings-transfer-close');
const settingsCopyToastEl = document.getElementById('settings-copy-toast');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
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
const toggleCommonPiecesBtn = document.getElementById('toggle-common-pieces-btn');
const toggleCustomPiecesBtn = document.getElementById('toggle-custom-pieces-btn');
const piecePoolListEl = document.getElementById('piece-pool-list');
const customPieceBtn = document.getElementById('custom-piece-btn');
const piecePoolCloseBtn = document.getElementById('piece-pool-close');
const computerDifficultyBtnEls = [
  document.getElementById('computer-difficulty-btn-0'),
  document.getElementById('computer-difficulty-btn-1'),
];
const difficultyModalEl = document.getElementById('difficulty-modal');
const difficultyListEl = document.getElementById('difficulty-list');
const difficultyCloseBtn = document.getElementById('difficulty-close');
const difficultyModalTitleEl = document.getElementById('difficulty-modal-title');
const difficultyCustomModalEl = document.getElementById('difficulty-custom-modal');
const difficultyCustomModalTitleEl = document.getElementById('difficulty-custom-modal-title');
const difficultyCustomCloseBtn = document.getElementById('difficulty-custom-close');
const difficultyCustomIntervalEl = document.getElementById('difficulty-custom-interval');
const difficultyCustomIntervalValueEl = document.getElementById('difficulty-custom-interval-value');
const difficultyCustomDesiredToggleBtn = document.getElementById('difficulty-custom-desired-toggle');
const difficultyCustomStrategyEl = document.getElementById('difficulty-custom-strategy');
const difficultyCustomStrategyCopyEl = document.getElementById('difficulty-custom-strategy-copy');
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
  skillTiles: new Map(),
  ownedSkills: [null, null],
  activeSkillEffects: [null, null],
  desiredPieces: [],
  customShapes: [],
  allowedShapeIds: new Set(),
  skillCooldownEndsAt: [0, 0],
  nextCustomShapeNumber: 1,
  pieceEditorDraft: null,
  desiredGridCells: [],
  playerColorThemeIndexes: [0, 1],
  playerCustomColors: [null, null],
  playerGlowLevels: [0, 0],
  blockStyleModalPlayer: null,
  gameActive: false,
  matchInProgress: false,
  manualPauseActive: false,
  timeLeft: DEFAULT_GAME_DURATION,
  prepDuration: DEFAULT_GAME_DURATION,
  prepSpecialSpawnChance: DEFAULT_SPECIAL_SPAWN_CHANCE,
  prepSkillTileSpawnIntervalMs: SKILL_TILE_SPAWN_INTERVAL_MS,
  prepMaxSkillTiles: DEFAULT_MAX_SKILL_TILES,
  prepStuckPenalty: DEFAULT_STUCK_PENALTY,
  prepNonStopMode: false,
  prepDesiredSkillCost: DEFAULT_DESIRED_SKILL_COST,
  prepDesiredSkillCooldownMs: DEFAULT_DESIRED_SKILL_COOLDOWN_MS,
  desiredSkillEnabled: true,
  timerHandle: null,
  pauseHandle: null,
  skillUiHandle: null,
  boardMetrics: null,
  skillTileSpawnElapsedMs: 0,
  scorePopupHandle: null,
  jamPenaltyPopupHandles: [null, null],
  computerPlayers: [false, false],
  computerMoveHandles: [null, null],
  idlePenaltyEligibleSince: [null, null],
  idlePenaltyNextTickAt: [null, null],
  computerDifficulties: ['normal', 'normal'],
  customComputerSettings: [0, 1].map(() => makeDefaultCustomComputerSettings()),
  activeDifficultyPlayer: 0,
  session: multiplayerApi.resolveSession
    ? multiplayerApi.resolveSession(window.location.search)
    : {
      source: 'direct',
      gameId: 'blockblast-duel',
      mode: 'local',
      requestedMode: 'local',
      playerName: '',
      roomCode: null,
      wsUrl: null,
      isRoomPlay: false,
      isLocalPlay: true,
      isHost: false,
      isGuest: false,
      maxPlayers: 2,
      isValid: true,
      validationErrors: [],
      transportKind: 'local-dev',
      clientId: `local_${Math.random().toString(36).slice(2, 10)}`,
    },
  room: multiplayerApi.createInitialRoomState
    ? multiplayerApi.createInitialRoomState(multiplayerApi.resolveSession
      ? multiplayerApi.resolveSession(window.location.search)
      : {
        roomCode: null,
        isRoomPlay: false,
      })
    : {
      roomCode: null,
      phase: 'idle',
      connectionStatus: 'offline',
      players: [],
      hostId: null,
      error: null,
      lastGameAction: null,
      lastSyncSnapshot: null,
    },
  roomClient: null,
  roomWarning: '',
  sessionFallbackActive: false,
  pendingRoomConnect: false,
  lastRemoteActionSummary: '',
};

let settingsCopyToastHandle = null;

function getSession() {
  return state.session;
}

function getFallbackLocalSession() {
  return multiplayerApi.createSession
    ? multiplayerApi.createSession({
      source: getSession().source,
      requestedMode: getSession().requestedMode,
      playerName: getSession().playerName,
      roomCode: getSession().roomCode,
      wsUrl: getSession().wsUrl,
      validationErrors: [...getSession().validationErrors],
      isValid: false,
    })
    : {
      ...getSession(),
      mode: 'local',
      isRoomPlay: false,
      isLocalPlay: true,
      isHost: false,
      isGuest: false,
      isValid: false,
    };
}

function isRoomSessionActive() {
  return Boolean(getSession().isRoomPlay) && !state.sessionFallbackActive;
}

function getLocalPlayerIndex() {
  if (!isRoomSessionActive()) return null;
  return getSession().isHost ? 0 : 1;
}

function getRemotePlayerIndex() {
  const localPlayerIndex = getLocalPlayerIndex();
  if (localPlayerIndex === null) return null;
  return localPlayerIndex === 0 ? 1 : 0;
}

function canEditPreparationForPlayer(player) {
  const localPlayerIndex = getLocalPlayerIndex();
  if (localPlayerIndex === null) return true;
  return player === localPlayerIndex;
}

function getRoomPlayers() {
  return state.room?.players || [];
}

function getLocalRoomPlayer() {
  return getRoomPlayers().find((player) => player.id === getSession().clientId) || null;
}

function getRemoteRoomPlayer() {
  return getRoomPlayers().find((player) => player.id !== getSession().clientId) || null;
}

function getRoomUiModel() {
  return multiplayerApi.buildRoomUiModel
    ? multiplayerApi.buildRoomUiModel(getSession(), state.room)
    : {
      modeLabel: getSession().isRoomPlay ? `${getSession().mode.toUpperCase()} MODE` : 'LOCAL MODE',
      phaseLabel: String(state.room?.phase || 'idle').toUpperCase(),
      connectionLabel: String(state.room?.connectionStatus || 'offline').toUpperCase(),
      playerName: getSession().playerName || 'Local Player',
      roomCode: getSession().roomCode || 'LOCAL',
      opponentName: getRemoteRoomPlayer()?.name || 'Waiting...',
      opponentConnected: Boolean(getRemoteRoomPlayer()),
      canStart: Boolean(getSession().isHost && getRemoteRoomPlayer()),
      statusCopy: state.roomWarning || 'Local single-device play is ready.',
      showContinueLocal: Boolean(getSession().isRoomPlay),
      showRetry: Boolean(getSession().isRoomPlay),
    };
}

function showSessionWarning(message) {
  state.roomWarning = message || '';
  if (!sessionWarningEl) return;
  sessionWarningEl.textContent = state.roomWarning;
  sessionWarningEl.classList.toggle('hidden', !state.roomWarning);
}

function getRoomDisplayPlayerName(player) {
  const session = getSession();
  const remotePlayer = getRemoteRoomPlayer();
  const localIndex = getLocalPlayerIndex();
  if (localIndex === null) return null;
  if (player === localIndex) return session.playerName || `PLAYER ${player + 1}`;
  return remotePlayer?.name || (player === 0 ? 'HOST' : 'GUEST');
}

function serializePieceForSync(piece) {
  if (!piece) return null;
  return {
    id: piece.id,
    player: piece.player,
    shapeId: piece.shapeId || null,
    cells: cloneCells(piece.cells),
    previewColor: piece.previewColor,
    glowColor: piece.glowColor,
    glowStrength: piece.glowStrength,
    desired: Boolean(piece.desired),
    disabled: Boolean(piece.disabled),
  };
}

function createPreparationConfigSnapshot() {
  return {
    prepDuration: state.prepDuration,
    prepSpecialSpawnChance: state.prepSpecialSpawnChance,
    prepSkillTileSpawnIntervalMs: state.prepSkillTileSpawnIntervalMs,
    prepMaxSkillTiles: state.prepMaxSkillTiles,
    prepStuckPenalty: state.prepStuckPenalty,
    prepNonStopMode: state.prepNonStopMode,
    prepDesiredSkillCost: state.prepDesiredSkillCost,
    prepDesiredSkillCooldownMs: state.prepDesiredSkillCooldownMs,
    desiredSkillEnabled: state.desiredSkillEnabled,
  };
}

function applyPreparationConfigSnapshot(config) {
  if (!config) return;
  if (Number.isFinite(config.prepDuration)) state.prepDuration = clampPreparationDuration(config.prepDuration);
  if (Number.isFinite(config.prepSpecialSpawnChance)) state.prepSpecialSpawnChance = config.prepSpecialSpawnChance;
  if (Number.isFinite(config.prepSkillTileSpawnIntervalMs)) state.prepSkillTileSpawnIntervalMs = config.prepSkillTileSpawnIntervalMs;
  if (Number.isFinite(config.prepMaxSkillTiles)) state.prepMaxSkillTiles = config.prepMaxSkillTiles;
  if (Number.isFinite(config.prepStuckPenalty)) state.prepStuckPenalty = config.prepStuckPenalty;
  state.prepNonStopMode = Boolean(config.prepNonStopMode);
  if (Number.isFinite(config.prepDesiredSkillCost)) state.prepDesiredSkillCost = config.prepDesiredSkillCost;
  if (Number.isFinite(config.prepDesiredSkillCooldownMs)) state.prepDesiredSkillCooldownMs = config.prepDesiredSkillCooldownMs;
  if (typeof config.desiredSkillEnabled === 'boolean') state.desiredSkillEnabled = config.desiredSkillEnabled;
  renderPreparationDuration();
  renderSpecialSpawnChance();
  renderSkillTileSettings();
  renderStuckPenalty();
  renderDesiredSkillSettings();
}

function createGameplaySyncSnapshot() {
  return {
    board: cloneBoard(),
    scores: [...state.scores],
    racks: state.racks.map((rack) => rack.map((piece) => serializePieceForSync(piece))),
    specialTiles: [...state.specialTiles],
    skillTiles: [...state.skillTiles.entries()].map(([key, skill]) => ({ key, skillId: skill.id })),
    ownedSkills: [...state.ownedSkills],
    activeSkillEffects: state.activeSkillEffects.map((effect) => (effect ? { ...effect } : null)),
    timeLeft: state.timeLeft,
    matchInProgress: state.matchInProgress,
    gameActive: state.gameActive,
  };
}

function publishGameplayAction(type, payload = {}, { includeSnapshot = false } = {}) {
  const createSerializableAction = multiplayerApi.createSerializableAction;
  if (!isRoomSessionActive() || !state.roomClient || typeof createSerializableAction !== 'function') return;
  const actionPayload = includeSnapshot
    ? {
      ...payload,
      snapshot: createGameplaySyncSnapshot(),
    }
    : payload;
  const action = createSerializableAction(type, actionPayload);
  state.roomClient.sendGameAction(action);
}

function handleRemoteGameplayAction(payload) {
  if (!payload?.action || payload.playerId === getSession().clientId) return;
  state.lastRemoteActionSummary = `${payload.action.type} from ${getRemoteRoomPlayer()?.name || 'opponent'}`;
  if (roomStatusCopyEl && state.room?.phase === 'playing') {
    roomStatusCopyEl.textContent = `${getRoomUiModel().statusCopy} Last remote action: ${state.lastRemoteActionSummary}.`;
  }
  // TODO(blockblast-multiplayer): apply remote room actions to authoritative board state.
}

function renderSessionUi() {
  const session = getSession();
  const roomUi = getRoomUiModel();
  document.body.classList.toggle('room-session-active', isRoomSessionActive());
  if (sessionStatusPillEl) sessionStatusPillEl.textContent = roomUi.modeLabel;
  if (roomStatusBtn) roomStatusBtn.classList.toggle('hidden', !session.isRoomPlay || state.sessionFallbackActive);
  if (roomModeBadgeEl) roomModeBadgeEl.textContent = roomUi.modeLabel;
  if (roomPhaseValueEl) roomPhaseValueEl.textContent = roomUi.phaseLabel;
  if (roomPlayerNameEl) roomPlayerNameEl.textContent = roomUi.playerName;
  if (roomCodeValueEl) roomCodeValueEl.textContent = roomUi.roomCode;
  if (roomConnectionStatusEl) roomConnectionStatusEl.textContent = roomUi.connectionLabel;
  if (roomConnectionStatusCopyEl) roomConnectionStatusCopyEl.textContent = roomUi.connectionLabel;
  if (roomOpponentStatusEl) roomOpponentStatusEl.textContent = roomUi.opponentName;
  if (roomStatusCopyEl) roomStatusCopyEl.textContent = state.lastRemoteActionSummary && state.room?.phase === 'playing'
    ? `${roomUi.statusCopy} Last remote action: ${state.lastRemoteActionSummary}.`
    : roomUi.statusCopy;
  if (roomRetryBtn) roomRetryBtn.hidden = !roomUi.showRetry;
  if (continueLocalBtn) continueLocalBtn.hidden = !roomUi.showContinueLocal;
  if (!session.isValid && session.validationErrors.length) {
    showSessionWarning(`${session.validationErrors.join(' ')} Running in local mode instead.`);
  } else if (!state.roomWarning) {
    showSessionWarning('');
  } else {
    showSessionWarning(state.roomWarning);
  }
  if (startBtn) {
    if (session.isRoomPlay && !state.sessionFallbackActive) {
      startBtn.textContent = session.isHost ? 'Start Match' : 'Waiting for Host';
      startBtn.disabled = !session.isHost || !roomUi.canStart;
    } else {
      startBtn.textContent = 'Start Game';
      startBtn.disabled = false;
    }
  }
}

function openRoomStatusModal() {
  if (!isRoomSessionActive()) return;
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  renderSessionUi();
  roomStatusModalEl?.classList.remove('hidden');
}

function closeRoomStatusModal() {
  roomStatusModalEl?.classList.add('hidden');
}

async function connectRoomSession() {
  if (!isRoomSessionActive() || !multiplayerApi.RoomClient || state.pendingRoomConnect) return;
  state.pendingRoomConnect = true;
  try {
    if (state.roomClient) await state.roomClient.disconnect({ notifyServer: false });
    state.roomClient = new multiplayerApi.RoomClient(getSession());
    state.roomClient.on('statechange', (nextRoomState) => {
      state.room = nextRoomState;
      renderSessionUi();
      renderModeUi();
    });
    state.roomClient.on(multiplayerApi.SERVER_EVENTS?.GAME_STARTED || 'game_started', (payload) => {
      applyPreparationConfigSnapshot(payload.config);
      beginGameFlow({ roomStartPayload: payload });
    });
    state.roomClient.on(multiplayerApi.SERVER_EVENTS?.GAME_ACTION || 'game_action', (payload) => {
      handleRemoteGameplayAction(payload);
    });
    state.roomClient.on('transportfallback', (payload) => {
      state.roomWarning = `${payload.reason} Using local dev room mode instead.`;
      renderSessionUi();
    });
    state.roomClient.on(multiplayerApi.SERVER_EVENTS?.ERROR || 'error', (payload) => {
      state.roomWarning = payload?.message || 'Room connection failed.';
      renderSessionUi();
    });
    state.roomClient.on(multiplayerApi.SERVER_EVENTS?.ROOM_CLOSED || 'room_closed', () => {
      state.roomWarning = 'The room was closed. You can retry or continue locally.';
      renderSessionUi();
    });
    await state.roomClient.connect();
    if (getSession().isGuest) state.roomClient.setReady(true);
    state.roomWarning = '';
  } catch (error) {
    state.roomWarning = error?.message || 'Failed to start the local room transport.';
  } finally {
    state.pendingRoomConnect = false;
    renderSessionUi();
  }
}

async function continueInLocalMode() {
  closeRoomStatusModal();
  if (state.roomClient) {
    await state.roomClient.disconnect({ notifyServer: false });
    state.roomClient = null;
  }
  state.sessionFallbackActive = true;
  state.session = getFallbackLocalSession();
  state.room = multiplayerApi.createInitialRoomState
    ? multiplayerApi.createInitialRoomState(state.session)
    : {
      roomCode: null,
      phase: 'idle',
      connectionStatus: 'offline',
      players: [],
      hostId: null,
      error: null,
      lastGameAction: null,
      lastSyncSnapshot: null,
    };
  state.roomWarning = getSession().validationErrors?.length
    ? `${getSession().validationErrors.join(' ')} Running in local mode instead.`
    : 'Running in local mode.';
  renderSessionUi();
  renderModeUi();
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cloneCells(cells) {
  return cells.map(([x, y]) => [x, y]);
}

function clampCustomComputerIntervalMs(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return COMPUTER_DIFFICULTIES.normal.intervalMs;
  return Math.max(
    MIN_CUSTOM_COMPUTER_INTERVAL_MS,
    Math.min(MAX_CUSTOM_COMPUTER_INTERVAL_MS, Math.round(numeric / 100) * 100),
  );
}

function makeDefaultCustomComputerSettings() {
  return {
    intervalMs: COMPUTER_DIFFICULTIES.normal.intervalMs,
    allowDesiredSkill: COMPUTER_DIFFICULTIES.normal.allowDesiredSkill,
    strategyKey: 'normal',
  };
}

function normalizeCustomComputerSettingsEntry(value) {
  const strategyKey = COMPUTER_DIFFICULTIES[value?.strategyKey] ? value.strategyKey : 'normal';
  return {
    intervalMs: clampCustomComputerIntervalMs(value?.intervalMs),
    allowDesiredSkill: value?.allowDesiredSkill === undefined
      ? COMPUTER_DIFFICULTIES.normal.allowDesiredSkill
      : Boolean(value.allowDesiredSkill),
    strategyKey,
  };
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

function clampColorChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex) {
  const normalized = String(hex || '').trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => clampColorChannel(value).toString(16).padStart(2, '0'))
    .join('')}`;
}

function shiftRgb(rgb, amount) {
  return {
    r: clampColorChannel(rgb.r + amount),
    g: clampColorChannel(rgb.g + amount),
    b: clampColorChannel(rgb.b + amount),
  };
}

function rgbToCss(rgb) {
  return `${clampColorChannel(rgb.r)}, ${clampColorChannel(rgb.g)}, ${clampColorChannel(rgb.b)}`;
}

function buildColorGradient(hex, { lift = 34, drop = -24 } = {}) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const light = rgbToHex(shiftRgb(rgb, lift));
  const dark = rgbToHex(shiftRgb(rgb, drop));
  return `linear-gradient(180deg, ${light} 0%, ${dark} 100%)`;
}

function getPlayerBaseHexColor(player) {
  const customColor = state.playerCustomColors[player];
  if (customColor) return customColor;
  const theme = getPlayerColorTheme(player);
  const themeMatch = theme.previewColor?.match(/#([0-9a-fA-F]{6})/);
  return themeMatch ? `#${themeMatch[1]}` : '#62d8ff';
}

function getPlayerGlowLevel(player) {
  const rawLevel = state.playerGlowLevels[player];
  return Number.isFinite(rawLevel) ? Math.max(0, Math.min(1, rawLevel)) : 0;
}

function getPlayerGlowColor(player) {
  const customColor = state.playerCustomColors[player];
  if (customColor) {
    const rgb = hexToRgb(customColor);
    if (rgb) return rgbToCss(rgb);
  }
  return getPlayerColorTheme(player).glowColor || '255, 255, 255';
}

function editorCoordsToCells(cellKeys) {
  return Array.from(cellKeys, (key) => key.split(',').map(Number));
}

function makePieceFromCells(cells, {
  shapeId = 'custom',
  previewColor = null,
  idPrefix = null,
  player = null,
  glowColor = null,
  glowStrength = 0.55,
} = {}) {
  const dims = dimsForCells(cloneCells(cells));
  return {
    id: `${idPrefix || 'N'}-${Math.random().toString(36).slice(2, 10)}`,
    shapeId,
    player,
    cells: dims.cells,
    width: dims.width,
    height: dims.height,
    previewColor: previewColor || randomItem(COLORS),
    glowColor,
    glowStrength,
  };
}

function getPlayerPreviewColor(player) {
  const customColor = state.playerCustomColors[player];
  if (customColor) return buildColorGradient(customColor) || customColor;
  return getPlayerColorTheme(player).previewColor || PLAYER_PREVIEW_COLORS[player] || randomItem(COLORS);
}

function getPlayerDesiredColor(player) {
  return getPlayerPreviewColor(player);
}

function getPieceGlowStyle(piece, { scale = 1 } = {}) {
  if (!piece?.glowColor) return '';
  const glowStrength = Math.max(0, Math.min(1, Number(piece.glowStrength) || 0));
  if (glowStrength <= 0) return '';
  const blur = Math.round((10 + glowStrength * 20) * scale);
  const spread = Math.round((1 + glowStrength * 4) * scale);
  const outerAlpha = (0.12 + glowStrength * 0.36).toFixed(2);
  const innerAlpha = (0.08 + glowStrength * 0.18).toFixed(2);
  return [
    `inset 0 -2px 0 rgba(0, 0, 0, 0.22)`,
    `inset 0 1px 0 rgba(255, 255, 255, 0.16)`,
    `0 0 ${blur}px ${spread}px rgba(${piece.glowColor}, ${outerAlpha})`,
    `0 0 ${Math.round(blur * 0.55)}px rgba(${piece.glowColor}, ${innerAlpha})`,
  ].join(', ');
}

function makePiece(player = null) {
  const allShapes = getAllShapeDefs();
  const availableShapes = allShapes.filter((shape) => state.allowedShapeIds.has(shape.id));
  if (availableShapes.length === 0) return null;
  const shape = randomItem(availableShapes);
  return makePieceFromCells(shape.cells, {
    shapeId: shape.id,
    player,
    previewColor: player === null ? randomItem(COLORS) : getPlayerPreviewColor(player),
    glowColor: player === null ? null : getPlayerGlowColor(player),
    glowStrength: player === null ? 0.35 : getPlayerGlowLevel(player),
  });
}

function makeDesiredPiece(player, cells = defaultDesiredCells()) {
  return makePieceFromCells(cells, {
    shapeId: `desired-${player}`,
    idPrefix: `D${player}`,
    player,
    previewColor: getPlayerDesiredColor(player),
    glowColor: getPlayerGlowColor(player),
    glowStrength: getPlayerGlowLevel(player),
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
  state.skillTiles = new Map();
  state.ownedSkills = [null, null];
  state.activeSkillEffects = [null, null];
  state.timeLeft = state.prepDuration;
  state.gameActive = false;
  state.manualPauseActive = false;
  state.skillTileSpawnElapsedMs = 0;
  clearActiveDrags();
  if (state.timerHandle) clearInterval(state.timerHandle);
  if (state.pauseHandle) clearInterval(state.pauseHandle);
  if (state.skillUiHandle) clearInterval(state.skillUiHandle);
  if (state.scorePopupHandle) clearTimeout(state.scorePopupHandle);
  state.jamPenaltyPopupHandles.forEach((handle) => {
    if (handle) clearTimeout(handle);
  });
  state.computerMoveHandles.forEach((handle) => {
    if (handle) clearTimeout(handle);
  });
  state.timerHandle = null;
  state.pauseHandle = null;
  state.skillUiHandle = null;
  state.scorePopupHandle = null;
  state.jamPenaltyPopupHandles = [null, null];
  state.computerMoveHandles = [null, null];
  state.idlePenaltyEligibleSince = [null, null];
  state.idlePenaltyNextTickAt = [null, null];
  state.skillCooldownEndsAt = [0, 0];
  scorePopupLayerEl.innerHTML = '';
  scoreBoxEls.forEach((scoreBoxEl) => {
    scoreBoxEl?.querySelector('.jam-penalty-popup')?.remove();
  });
  updateTimer();
  updateScores();
  renderPauseButton();
}

function isComputerPlayer(player) {
  return Boolean(state.computerPlayers[player]);
}

function hasComputerPlayers() {
  return state.computerPlayers.some(Boolean);
}

function isSingleBottomHumanView() {
  return isComputerPlayer(0) && !isComputerPlayer(1);
}

function getPlayerDisplayName(player) {
  const roomDisplayName = getRoomDisplayPlayerName(player);
  if (roomDisplayName) return roomDisplayName;
  if (isComputerPlayer(player)) return `COMPUTER ${player + 1}`;
  return `PLAYER ${player + 1}`;
}

function getSkillLabel(player) {
  return isComputerPlayer(player) ? 'CPU Desired' : `P${player + 1} Desired`;
}

function getComputerDifficultyConfig(player) {
  const key = state.computerDifficulties[player];
  if (key === 'custom') return getCustomComputerDifficultyConfig(player);
  return COMPUTER_DIFFICULTIES[key] || COMPUTER_DIFFICULTIES.normal;
}

function getCustomComputerDifficultyConfig(player) {
  const customSettings = normalizeCustomComputerSettingsEntry(state.customComputerSettings[player] || {});
  const strategyConfig = COMPUTER_DIFFICULTIES[customSettings.strategyKey] || COMPUTER_DIFFICULTIES.normal;
  return {
    ...strategyConfig,
    key: 'custom',
    label: 'Custom',
    intervalMs: customSettings.intervalMs,
    allowDesiredSkill: customSettings.allowDesiredSkill,
    description: `Custom timing with ${strategyConfig.label.toLowerCase()} strategy.`,
  };
}

function getComputerDifficultyLabel(player) {
  return getComputerDifficultyConfig(player).label;
}

function getCommonShapeIds() {
  return SHAPES.map((shape) => shape.id);
}

function getCustomShapeIds() {
  return state.customShapes.map((shape) => shape.id);
}

function initAllowedShapes() {
  state.allowedShapeIds = new Set(getAllShapeDefs().map((shape) => shape.id));
}

function applyDefaultSettings() {
  state.customShapes = [];
  state.nextCustomShapeNumber = 1;
  state.playerColorThemeIndexes = [0, 1];
  state.playerCustomColors = [null, null];
  state.playerGlowLevels = [0, 0];
  state.prepDuration = DEFAULT_GAME_DURATION;
  state.prepSpecialSpawnChance = DEFAULT_SPECIAL_SPAWN_CHANCE;
  state.prepSkillTileSpawnIntervalMs = SKILL_TILE_SPAWN_INTERVAL_MS;
  state.prepMaxSkillTiles = DEFAULT_MAX_SKILL_TILES;
  state.prepStuckPenalty = DEFAULT_STUCK_PENALTY;
  state.prepNonStopMode = false;
  state.prepDesiredSkillCost = DEFAULT_DESIRED_SKILL_COST;
  state.prepDesiredSkillCooldownMs = DEFAULT_DESIRED_SKILL_COOLDOWN_MS;
  state.desiredSkillEnabled = true;
  state.computerPlayers = [false, false];
  state.computerDifficulties = ['normal', 'normal'];
  state.customComputerSettings = [0, 1].map(() => makeDefaultCustomComputerSettings());
  state.activeDifficultyPlayer = 0;
  initAllowedShapes();
  initDesiredPieces();
  if (!state.matchInProgress) {
    state.timeLeft = state.prepDuration;
  }
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
  const player = state.activeDifficultyPlayer;
  difficultyListEl.innerHTML = '';
  const difficultyEntries = [
    ...Object.entries(COMPUTER_DIFFICULTIES),
    ['custom', getCustomComputerDifficultyConfig(player)],
  ];
  difficultyEntries.forEach(([key, config]) => {
    const optionEl = document.createElement('div');
    optionEl.className = 'difficulty-option';
    optionEl.classList.toggle('active', key === state.computerDifficulties[player]);
    const selectBtnEl = document.createElement('button');
    selectBtnEl.type = 'button';
    selectBtnEl.className = 'difficulty-option-select';
    selectBtnEl.setAttribute('aria-pressed', String(key === state.computerDifficulties[player]));
    selectBtnEl.addEventListener('click', () => {
      applyComputerDifficulty(player, key);
      buildDifficultyList();
    });

    const titleEl = document.createElement('div');
    titleEl.className = 'difficulty-option-title';
    titleEl.textContent = config.label.toUpperCase();

    const metaEl = document.createElement('div');
    metaEl.className = 'difficulty-option-meta';
    metaEl.textContent = `${(config.intervalMs / 1000).toFixed(1)}s per move`;

    const copyEl = document.createElement('div');
    copyEl.className = 'difficulty-option-copy';
    copyEl.textContent = config.description;

    selectBtnEl.append(titleEl, metaEl, copyEl);
    optionEl.appendChild(selectBtnEl);
    if (key === 'custom') {
      const actionsEl = document.createElement('div');
      actionsEl.className = 'difficulty-option-actions';

      const editBtnEl = document.createElement('button');
      editBtnEl.type = 'button';
      editBtnEl.className = 'secondary-btn difficulty-option-edit-btn';
      editBtnEl.textContent = 'Edit';
      editBtnEl.addEventListener('click', () => {
        applyComputerDifficulty(player, 'custom');
        buildDifficultyList();
        openCustomComputerModal(player);
      });

      actionsEl.appendChild(editBtnEl);
      optionEl.appendChild(actionsEl);
    }
    difficultyListEl.appendChild(optionEl);
  });
}

function renderDifficultyCustomPanel() {
  const player = state.activeDifficultyPlayer;
  const customSettings = normalizeCustomComputerSettingsEntry(state.customComputerSettings[player] || {});
  state.customComputerSettings[player] = customSettings;
  const strategyConfig = COMPUTER_DIFFICULTIES[customSettings.strategyKey] || COMPUTER_DIFFICULTIES.normal;
  if (difficultyCustomIntervalEl) {
    difficultyCustomIntervalEl.value = (customSettings.intervalMs / 1000).toFixed(1);
  }
  if (difficultyCustomIntervalValueEl) {
    difficultyCustomIntervalValueEl.textContent = `${(customSettings.intervalMs / 1000).toFixed(1)}s`;
  }
  if (difficultyCustomDesiredToggleBtn) {
    difficultyCustomDesiredToggleBtn.textContent = `Desired Pieces: ${customSettings.allowDesiredSkill ? 'On' : 'Off'}`;
    difficultyCustomDesiredToggleBtn.classList.toggle('active', customSettings.allowDesiredSkill);
  }
  if (difficultyCustomStrategyEl) {
    difficultyCustomStrategyEl.value = customSettings.strategyKey;
  }
  if (difficultyCustomStrategyCopyEl) {
    difficultyCustomStrategyCopyEl.textContent = strategyConfig.description;
  }
}

function applyComputerDifficulty(player, key) {
  state.computerDifficulties[player] = key;
  renderModeUi();
  if (isComputerPlayer(player) && state.gameActive) {
    clearComputerMoveTimer(player);
    scheduleComputerMove(player);
  }
  persistSettingsToStorage();
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
    } else {
      cell.style.boxShadow = getPieceGlowStyle(piece, { scale: cellSize / 28 });
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

function buildBlockStyleOptions() {
  if (!blockStyleColorOptionsEl) return;
  blockStyleColorOptionsEl.innerHTML = '';
  PLAYER_COLOR_THEMES.forEach((theme, index) => {
    const optionEl = document.createElement('button');
    optionEl.type = 'button';
    optionEl.className = 'player-color-option';
    optionEl.dataset.themeIndex = String(index);
    optionEl.setAttribute('aria-label', `piece color ${theme.label}`);
    optionEl.setAttribute('title', theme.label);
    optionEl.style.setProperty('--swatch', theme.previewColor);
    blockStyleColorOptionsEl.appendChild(optionEl);
  });
}

function renderBlockStyleButtons() {
  blockStyleBtnEls.forEach((btn, player) => {
    if (!btn) return;
    btn.textContent = 'Block Style';
  });
}

function renderBlockStyleModal() {
  const player = state.blockStyleModalPlayer;
  if (player === null || player === undefined) return;
  const playerName = getPlayerDisplayName(player);
  const glowPercent = Math.round(getPlayerGlowLevel(player) * 100);
  if (blockStyleModalTitleEl) blockStyleModalTitleEl.textContent = `${playerName.toUpperCase()} BLOCK STYLE`;
  if (blockStyleModalCopyEl) blockStyleModalCopyEl.textContent = `Choose the color theme and glow strength for ${playerName.toLowerCase()}'s blocks.`;
  if (blockStyleGlowInputEl) blockStyleGlowInputEl.value = String(glowPercent);
  if (blockStyleGlowValueEl) blockStyleGlowValueEl.textContent = `Glow ${glowPercent}%`;
  if (blockStyleColorPickerEl) blockStyleColorPickerEl.value = getPlayerBaseHexColor(player);
  if (blockStyleColorCodeEl) blockStyleColorCodeEl.textContent = getPlayerBaseHexColor(player).toUpperCase();
  if (blockStyleColorOptionsEl) {
    Array.from(blockStyleColorOptionsEl.children).forEach((optionEl, index) => {
      const selected = !state.playerCustomColors[player] && index === state.playerColorThemeIndexes[player];
      optionEl.classList.toggle('active', selected);
      optionEl.setAttribute('aria-pressed', String(selected));
      optionEl.setAttribute('aria-label', `${playerName} color ${PLAYER_COLOR_THEMES[index].label}`);
    });
  }
  renderMiniPiece(blockStylePreviewEl, makePieceFromCells([[0, 0], [1, 0], [0, 1], [1, 1]], {
    shapeId: `preview-${player}`,
    player,
    previewColor: getPlayerPreviewColor(player),
    glowColor: getPlayerGlowColor(player),
    glowStrength: getPlayerGlowLevel(player),
  }), getRenderSlotSize(blockStylePreviewEl, 96), { forceEnabled: true });
}

function renderPiecePoolButton() {
  piecePoolBtn.textContent = `Piece Types (${state.allowedShapeIds.size}/${getAllShapeDefs().length})`;
}

function renderModeUi() {
  app.classList.toggle('vs-computer-mode', isSingleBottomHumanView());
  playerNameEls.forEach((el, player) => {
    el.textContent = getPlayerDisplayName(player);
  });
  prepPlayerLabelEls.forEach((el, player) => {
    if (el) el.textContent = getPlayerDisplayName(player);
  });
  desiredPieceBtnEls.forEach((btn, player) => {
    btn.textContent = isComputerPlayer(player) ? 'Computer Piece' : 'Desired Piece';
    btn.disabled = !canEditPreparationForPlayer(player);
  });
  blockStyleBtnEls.forEach((btn, player) => {
    if (!btn) return;
    btn.disabled = !canEditPreparationForPlayer(player);
  });
  computerModeBtnEls.forEach((btn, player) => {
    if (!btn) return;
    const enabled = isComputerPlayer(player);
    const editable = canEditPreparationForPlayer(player);
    btn.textContent = `Computer: ${enabled ? 'On' : 'Off'}`;
    btn.classList.toggle('active', enabled);
    btn.setAttribute('aria-pressed', String(enabled));
    btn.disabled = !editable;
  });
  computerDifficultyBtnEls.forEach((btn, player) => {
    if (!btn) return;
    const enabled = isComputerPlayer(player);
    const editable = canEditPreparationForPlayer(player);
    btn.classList.toggle('hidden', !enabled);
    btn.textContent = `Difficulty: ${getComputerDifficultyLabel(player)}`;
    btn.disabled = !editable;
  });
  renderBlockStyleButtons();
  renderBlockStyleModal();
}

function canUseFullscreen() {
  return Boolean(document.documentElement?.requestFullscreen && document.exitFullscreen);
}

function renderFullscreenButton() {
  if (!fullscreenBtn) return;
  if (!canUseFullscreen()) {
    fullscreenBtn.hidden = true;
    return;
  }
  fullscreenBtn.hidden = false;
  fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Full Screen' : 'Enter Full Screen';
}

async function toggleFullscreenMode() {
  if (!canUseFullscreen()) return;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Ignore fullscreen failures and keep the button state in sync with the browser.
  }
  renderFullscreenButton();
}

function renderPiecePoolList({ preserveFocus = false } = {}) {
  const scrollContainer = piecePoolListEl?.closest('.piece-pool-card');
  const scrollTop = scrollContainer?.scrollTop ?? 0;
  const activeShapeId = preserveFocus && document.activeElement instanceof HTMLElement
    ? document.activeElement.closest('.piece-pool-item')?.dataset.shapeId || null
    : null;
  buildPiecePoolList();
  const totalCount = getAllShapeDefs().length;
  const enabledCount = state.allowedShapeIds.size;
  piecePoolSummaryEl.textContent = enabledCount > 0
    ? `${enabledCount} of ${totalCount} enabled`
    : `0 of ${totalCount} enabled. Enable at least one piece to confirm.`;
  customPieceBtn.textContent = `Add Custom Piece (${state.customShapes.length}/${MAX_CUSTOM_PIECES})`;
  customPieceBtn.disabled = state.customShapes.length >= MAX_CUSTOM_PIECES;
  piecePoolCloseBtn.disabled = enabledCount === 0;
  const commonIds = getCommonShapeIds();
  const customIds = getCustomShapeIds();
  const commonEnabled = commonIds.filter((shapeId) => state.allowedShapeIds.has(shapeId)).length;
  const customEnabled = customIds.filter((shapeId) => state.allowedShapeIds.has(shapeId)).length;
  if (toggleCommonPiecesBtn) {
    const allCommonEnabled = commonIds.length > 0 && commonEnabled === commonIds.length;
    toggleCommonPiecesBtn.textContent = `Common Pieces: ${allCommonEnabled ? 'On' : 'Off'}`;
    toggleCommonPiecesBtn.classList.toggle('active', allCommonEnabled);
    toggleCommonPiecesBtn.disabled = commonIds.length === 0;
  }
  if (toggleCustomPiecesBtn) {
    const allCustomEnabled = customIds.length > 0 && customEnabled === customIds.length;
    toggleCustomPiecesBtn.textContent = `Custom Pieces: ${allCustomEnabled ? 'On' : 'Off'}`;
    toggleCustomPiecesBtn.classList.toggle('active', allCustomEnabled);
    toggleCustomPiecesBtn.disabled = customIds.length === 0;
  }
  if (scrollContainer) scrollContainer.scrollTop = scrollTop;
  if (activeShapeId) {
    const nextActiveEl = piecePoolListEl.querySelector(`.piece-pool-item[data-shape-id="${activeShapeId}"]`);
    if (nextActiveEl instanceof HTMLElement) nextActiveEl.focus({ preventScroll: true });
  }
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

function getOwnedSkillLabel(player) {
  const ownedSkillId = state.ownedSkills[player];
  return SKILL_TILE_TYPES.find((skill) => skill.id === ownedSkillId)?.label || 'None';
}

function getActiveSkillEffect(player) {
  return state.activeSkillEffects[player];
}

function getIncomingPieceBlockEffect(player) {
  return state.activeSkillEffects.find((effect) => effect?.skillId === 'blue' && effect.targetPlayer === player) || null;
}

function isRackSlotBlocked(player, slotIndex) {
  return Boolean(getIncomingPieceBlockEffect(player)) && slotIndex === MAX_RACK - 1;
}

function getOwnedSkillDisplay(player) {
  const effect = getActiveSkillEffect(player);
  if (effect?.skillId === 'red') {
    return {
      skillId: 'red',
      label: 'Score Boost',
      sublabel: `+${effect.accumulated}`,
      detail: `${Math.max(0, effect.remainingMs / 1000).toFixed(1)}s`,
      mode: 'active',
    };
  }
  if (effect?.skillId === 'blue') {
    return {
      skillId: 'blue',
      label: 'Piece Block',
      sublabel: null,
      detail: `${Math.max(0, effect.remainingMs / 1000).toFixed(1)}s`,
      mode: 'active',
    };
  }

  const ownedSkillId = state.ownedSkills[player];
  return {
    skillId: ownedSkillId,
    label: getOwnedSkillLabel(player),
    sublabel: null,
    detail: null,
    mode: 'owned',
  };
}

function createOwnedSkillHandle(player, ownedSkillId) {
  const handleEl = document.createElement('div');
  handleEl.className = `owned-skill-handle skill-${ownedSkillId}`;
  handleEl.textContent = 'Drag';
  handleEl.setAttribute('role', 'button');
  handleEl.setAttribute('aria-label', `${getOwnedSkillLabel(player)} skill handle`);
  handleEl.onpointerdown = (event) => {
    if (!state.gameActive) return;
    if (isComputerPlayer(player)) return;
    if (ownedSkillId !== 'green') return;
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    refreshLayoutMetrics();
    startAreaSkillDrag(event, handleEl, player, ownedSkillId);
  };
  return handleEl;
}

function createOwnedSkillAction(player, ownedSkillId) {
  const buttonEl = document.createElement('button');
  buttonEl.type = 'button';
  buttonEl.className = `owned-skill-action skill-${ownedSkillId}`;
  buttonEl.textContent = ownedSkillId === 'green' ? 'Use' : 'Activate';
  buttonEl.disabled = !state.gameActive || isComputerPlayer(player);
  buttonEl.addEventListener('click', () => {
    if (ownedSkillId === 'red') activateScoreBoostSkill(player);
    if (ownedSkillId === 'blue') activatePieceBlockSkill(player);
  });
  return buttonEl;
}

function renderOwnedSkills() {
  ownedSkillEls.forEach((el, player) => {
    if (!el) return;
    const boxEl = ownedSkillBoxEls[player];
    if (!boxEl) return;
    const display = getOwnedSkillDisplay(player);
    const { skillId, label, sublabel, detail, mode } = display;
    el.textContent = label;
    el.dataset.skill = skillId || 'none';
    boxEl.dataset.skill = skillId || 'none';
    boxEl.dataset.mode = mode;
    boxEl.querySelector('.owned-skill-handle')?.remove();
    boxEl.querySelector('.owned-skill-action')?.remove();
    boxEl.querySelector('.owned-skill-meta')?.remove();
    if (sublabel || detail) {
      const metaEl = document.createElement('div');
      metaEl.className = 'owned-skill-meta';
      metaEl.innerHTML = `
        ${sublabel ? `<span class="owned-skill-copy">${sublabel}</span>` : ''}
        ${detail ? `<span class="owned-skill-timer">${detail}</span>` : ''}
      `;
      boxEl.appendChild(metaEl);
    }
    if (skillId === 'green' && mode === 'owned') {
      boxEl.appendChild(createOwnedSkillHandle(player, skillId));
    }
    if ((skillId === 'red' || skillId === 'blue') && mode === 'owned') {
      boxEl.appendChild(createOwnedSkillAction(player, skillId));
    }
  });
}

function startSkillUiLoop() {
  if (state.skillUiHandle) clearInterval(state.skillUiHandle);
  state.skillUiHandle = setInterval(() => {
    renderSkillButtons();
    renderOwnedSkills();
  }, 100);
}

function renderRacks() {
  state.slotEls.forEach((slots, player) => {
    const computerControlled = isComputerPlayer(player);
    slots.forEach((slotEl, slotIndex) => {
      const canvas = slotEl.querySelector('.piece-canvas');
      const piece = state.racks[player][slotIndex] || null;
      const disabled = isPieceDisabled(piece);
      const incomingBlockEffect = getIncomingPieceBlockEffect(player);
      const blockedBySkill = isRackSlotBlocked(player, slotIndex);
      slotEl.dataset.pieceId = piece ? piece.id : '';
      slotEl.classList.toggle('computer-controlled', computerControlled);
      slotEl.classList.toggle('disabled', disabled || computerControlled || blockedBySkill);
      slotEl.classList.toggle('blocked-by-skill', Boolean(blockedBySkill));
      slotEl.querySelector('.piece-block-overlay')?.remove();
      if (blockedBySkill) {
        const overlayEl = document.createElement('div');
        overlayEl.className = 'piece-block-overlay';
        overlayEl.innerHTML = `
          <div class="piece-block-timer">${Math.max(0, incomingBlockEffect.remainingMs / 1000).toFixed(1)}s</div>
        `;
        slotEl.appendChild(overlayEl);
      }
      renderMiniPiece(canvas, piece, Math.min(slotEl.clientWidth, slotEl.clientHeight));
      if (piece && !disabled && !computerControlled && !blockedBySkill) {
        attachPiecePointer(slotEl, piece, { sourceType: 'rack', player, slotIndex });
      }
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
      const cellKey = `${x},${y}`;
      const skillTile = state.skillTiles.get(cellKey) || null;
      cellEl.classList.remove(
        'clearing',
        'ghost-valid',
        'ghost-invalid',
        'special-spawn',
        'skill-spawn',
        'special-tile',
        'skill-tile',
        'skill-red',
        'skill-blue',
        'skill-green',
      );
      cellEl.classList.toggle('special-tile', state.specialTiles.has(cellKey));
      if (skillTile) cellEl.classList.add('skill-tile', `skill-${skillTile.id}`);
      cellEl.innerHTML = '';
      const cellState = state.board[y][x];
      if (cellState) {
        const fill = document.createElement('div');
        fill.className = 'board-cell-fill';
        if (state.specialTiles.has(cellKey)) fill.classList.add('on-special-tile');
        if (skillTile) fill.classList.add('on-skill-tile');
        fill.style.background = cellState.previewColor;
        fill.style.boxShadow = getPieceGlowStyle(cellState, { scale: 0.8 });
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
  renderOwnedSkills();
  renderSkillButtons();
}

function addPoints(player, points, { copyable = true } = {}) {
  if (!Number.isFinite(points) || points === 0) return 0;
  state.scores[player] += points;
  const effect = getActiveSkillEffect(player);
  if (copyable && points > 0 && effect?.skillId === 'red') {
    effect.accumulated += points;
  }
  updateScores();
  return points;
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

function getSkillTileSpawnIntervalSeconds() {
  return Math.round(state.prepSkillTileSpawnIntervalMs / 1000);
}

function renderSkillTileSettings() {
  if (skillTileSettingsBtn) {
    skillTileSettingsBtn.textContent = `Skill Tiles: ${getSkillTileSpawnIntervalSeconds()}s · Max ${state.prepMaxSkillTiles}`;
  }
  if (skillTileIntervalInputEl) {
    skillTileIntervalInputEl.value = String(getSkillTileSpawnIntervalSeconds());
  }
  if (skillTileMaxInputEl) {
    skillTileMaxInputEl.value = String(state.prepMaxSkillTiles);
  }
  if (skillTileMaxValueEl) {
    skillTileMaxValueEl.textContent = String(state.prepMaxSkillTiles);
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

function setSettingsTransferStatus(message, tone = 'neutral') {
  if (!settingsTransferStatusEl) return;
  settingsTransferStatusEl.textContent = message;
  settingsTransferStatusEl.dataset.tone = tone;
}

function showSettingsCopyToast() {
  if (!settingsCopyToastEl) return;
  if (settingsCopyToastHandle) {
    clearTimeout(settingsCopyToastHandle);
    settingsCopyToastHandle = null;
  }
  settingsCopyToastEl.classList.remove('show');
  void settingsCopyToastEl.offsetWidth;
  settingsCopyToastEl.classList.add('show');
  settingsCopyToastHandle = setTimeout(() => {
    settingsCopyToastEl.classList.remove('show');
    settingsCopyToastHandle = null;
  }, 1400);
}

function persistSettingsToStorage() {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(getSettingsPayload()));
  } catch {
    // Ignore storage write failures and keep the in-memory settings usable.
  }
}

function loadSettingsFromStorage() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return false;
    applySettingsPayload(JSON.parse(raw), { persist: false });
    return true;
  } catch {
    return false;
  }
}

function resetAllSettings() {
  const confirmed = window.confirm('Reset all game settings to their defaults?');
  if (!confirmed) return;
  try {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch {
    // Ignore storage removal failures and continue restoring defaults in memory.
  }
  applyDefaultSettings();
  renderPreparationDuration();
  renderSpecialSpawnChance();
  renderSkillTileSettings();
  renderStuckPenalty();
  renderDesiredSkillSettings();
  renderModeUi();
  renderDesiredPiecePreviews();
  renderPiecePoolList();
  renderPiecePoolButton();
  renderSkillButtons();
  renderRacks();
  renderBoard();
  refreshSettingsTransferExport();
  persistSettingsToStorage();
}

function getSettingsPayload() {
  return {
    version: 1,
    prepDuration: state.prepDuration,
    prepSpecialSpawnChance: state.prepSpecialSpawnChance,
    prepSkillTileSpawnIntervalMs: state.prepSkillTileSpawnIntervalMs,
    prepMaxSkillTiles: state.prepMaxSkillTiles,
    prepStuckPenalty: state.prepStuckPenalty,
    prepNonStopMode: state.prepNonStopMode,
    prepDesiredSkillCost: state.prepDesiredSkillCost,
    prepDesiredSkillCooldownMs: state.prepDesiredSkillCooldownMs,
    desiredSkillEnabled: state.desiredSkillEnabled,
    computerPlayers: [...state.computerPlayers],
    computerDifficulties: [...state.computerDifficulties],
    customComputerSettings: state.customComputerSettings.map((settings) => ({
      intervalMs: settings.intervalMs,
      allowDesiredSkill: settings.allowDesiredSkill,
      strategyKey: settings.strategyKey,
    })),
    playerColorThemeIndexes: [...state.playerColorThemeIndexes],
    playerCustomColors: [...state.playerCustomColors],
    playerGlowLevels: [...state.playerGlowLevels],
    desiredPieces: state.desiredPieces.map((piece) => ({
      cells: cloneCells(piece.cells),
    })),
    customShapes: state.customShapes.map((shape) => ({
      id: shape.id,
      label: shape.label,
      cells: cloneCells(shape.cells),
    })),
    allowedShapeIds: Array.from(state.allowedShapeIds),
    nextCustomShapeNumber: state.nextCustomShapeNumber,
  };
}

function refreshSettingsTransferExport() {
  if (!settingsExportOutputEl) return;
  settingsExportOutputEl.value = JSON.stringify(getSettingsPayload(), null, 2);
}

function isValidCellList(cells, { maxBlocks = null } = {}) {
  if (!Array.isArray(cells) || cells.length === 0) return false;
  if (maxBlocks !== null && cells.length > maxBlocks) return false;
  return cells.every((cell) => (
    Array.isArray(cell)
    && cell.length === 2
    && Number.isInteger(cell[0])
    && Number.isInteger(cell[1])
  ));
}

function normalizeDesiredPieceCells(value) {
  if (!isValidCellList(value, { maxBlocks: DESIRED_MAX_BLOCKS })) return null;
  return dimsForCells(cloneCells(value)).cells;
}

function normalizeCustomShapes(value) {
  if (!Array.isArray(value)) return [];
  const seenIds = new Set();
  return value.flatMap((shape, index) => {
    if (!shape || typeof shape !== 'object') return [];
    if (!isValidCellList(shape.cells, { maxBlocks: DESIRED_MAX_BLOCKS })) return [];
    const id = typeof shape.id === 'string' && shape.id ? shape.id : `custom-${index + 1}`;
    if (seenIds.has(id)) return [];
    seenIds.add(id);
    return [{
      id,
      label: typeof shape.label === 'string' && shape.label ? shape.label : `Custom Piece ${index + 1}`,
      cells: dimsForCells(cloneCells(shape.cells)).cells,
    }];
  });
}

function getNormalizedAllowedShapeIds(rawAllowedIds, customShapes) {
  const allShapeIds = new Set([...SHAPES.map((shape) => shape.id), ...customShapes.map((shape) => shape.id)]);
  const normalized = Array.isArray(rawAllowedIds)
    ? rawAllowedIds.filter((shapeId) => typeof shapeId === 'string' && allShapeIds.has(shapeId))
    : [];
  return new Set(normalized);
}

function applySettingsPayload(payload, { persist = true } = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Settings JSON must be an object.');
  }
  const desiredPieces = Array.isArray(payload.desiredPieces) ? payload.desiredPieces : [];
  const normalizedDesiredPieces = [0, 1].map((player) => {
    const piece = desiredPieces[player];
    const cells = normalizeDesiredPieceCells(piece?.cells);
    return makeDesiredPiece(player, cells || defaultDesiredCells());
  });
  const customShapes = normalizeCustomShapes(payload.customShapes);
  const allowedShapeIds = getNormalizedAllowedShapeIds(payload.allowedShapeIds, customShapes);
  const nextCustomShapeNumberRaw = Number(payload.nextCustomShapeNumber);

  state.prepDuration = clampPreparationDuration(payload.prepDuration ?? DEFAULT_GAME_DURATION);
  state.prepSpecialSpawnChance = Math.max(0, Math.min(1, Number(payload.prepSpecialSpawnChance) || 0));
  state.prepSkillTileSpawnIntervalMs = Math.max(
    1000,
    Math.min(60000, Math.floor(Number(payload.prepSkillTileSpawnIntervalMs ?? SKILL_TILE_SPAWN_INTERVAL_MS) / 1000) * 1000),
  );
  state.prepMaxSkillTiles = Math.max(
    0,
    Math.min(64, Math.floor(Number(payload.prepMaxSkillTiles ?? DEFAULT_MAX_SKILL_TILES))),
  );
  state.prepStuckPenalty = Math.max(
    0,
    Math.min(1, Number(payload.prepStuckPenalty ?? DEFAULT_STUCK_PENALTY)),
  );
  state.prepNonStopMode = Boolean(payload.prepNonStopMode);
  state.prepDesiredSkillCost = Math.max(0, Math.min(100, Math.floor(Number(payload.prepDesiredSkillCost) || 0)));
  state.prepDesiredSkillCooldownMs = Math.max(0, Math.min(100000, Math.floor(Number(payload.prepDesiredSkillCooldownMs) || 0)));
  state.desiredSkillEnabled = Boolean(payload.desiredSkillEnabled);
  state.computerPlayers = [0, 1].map((player) => {
    if (Array.isArray(payload.computerPlayers)) return Boolean(payload.computerPlayers[player]);
    return player === 0 ? Boolean(payload.vsComputer) : false;
  });
  state.computerDifficulties = [0, 1].map((player) => {
    if (Array.isArray(payload.computerDifficulties)) {
      const key = payload.computerDifficulties[player];
      return key === 'custom' || COMPUTER_DIFFICULTIES[key] ? key : 'normal';
    }
    return COMPUTER_DIFFICULTIES[payload.computerDifficulty] ? payload.computerDifficulty : 'normal';
  });
  state.customComputerSettings = [0, 1].map((player) => (
    normalizeCustomComputerSettingsEntry(payload.customComputerSettings?.[player] || {})
  ));
  state.activeDifficultyPlayer = 0;
  state.playerColorThemeIndexes = [0, 1].map((player) => {
    const index = Number(payload.playerColorThemeIndexes?.[player]);
    return PLAYER_COLOR_THEMES[index] ? index : player;
  });
  state.playerCustomColors = [0, 1].map((player) => {
    const rgb = hexToRgb(payload.playerCustomColors?.[player]);
    return rgb ? rgbToHex(rgb) : null;
  });
  state.playerGlowLevels = [0, 1].map((player) => {
    const value = Number(payload.playerGlowLevels?.[player]);
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  });
  state.customShapes = customShapes;
  state.allowedShapeIds = allowedShapeIds;
  state.nextCustomShapeNumber = Number.isInteger(nextCustomShapeNumberRaw) && nextCustomShapeNumberRaw > 0
    ? nextCustomShapeNumberRaw
    : customShapes.length + 1;
  state.desiredPieces = normalizedDesiredPieces.map((piece, player) => makeDesiredPiece(player, piece.cells));

  if (!state.matchInProgress) {
    state.timeLeft = state.prepDuration;
  }
  renderPreparationDuration();
  renderSpecialSpawnChance();
  renderSkillTileSettings();
  renderStuckPenalty();
  renderDesiredSkillSettings();
  renderModeUi();
  renderDesiredPiecePreviews();
  renderPiecePoolList();
  renderSkillButtons();
  renderRacks();
  renderBoard();
  refreshSettingsTransferExport();
  if (persist) persistSettingsToStorage();
}

async function copySettingsJson() {
  refreshSettingsTransferExport();
  const json = settingsExportOutputEl?.value || '';
  if (!json) {
    setSettingsTransferStatus('Nothing to copy.', 'error');
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json);
    } else if (settingsExportOutputEl) {
      settingsExportOutputEl.focus();
      settingsExportOutputEl.select();
      document.execCommand('copy');
    }
    setSettingsTransferStatus('Settings JSON copied.', 'success');
    showSettingsCopyToast();
  } catch {
    setSettingsTransferStatus('Copy failed. Use the Save JSON button instead.', 'error');
  }
}

function saveSettingsJson() {
  refreshSettingsTransferExport();
  const json = settingsExportOutputEl?.value || '';
  if (!json) {
    setSettingsTransferStatus('Nothing to save.', 'error');
    return;
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blockblast-duel-settings.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setSettingsTransferStatus('Settings JSON saved.', 'success');
}

function loadSettingsJsonString(jsonText) {
  const trimmed = String(jsonText || '').trim();
  if (!trimmed) {
    setSettingsTransferStatus('Paste JSON first.', 'error');
    return;
  }
  try {
    applySettingsPayload(JSON.parse(trimmed));
    if (settingsImportInputEl) settingsImportInputEl.value = trimmed;
    setSettingsTransferStatus('Settings loaded.', 'success');
  } catch (error) {
    setSettingsTransferStatus(error instanceof Error ? error.message : 'Failed to load settings JSON.', 'error');
  }
}

function setPreparationDuration(value) {
  state.prepDuration = clampPreparationDuration(value);
  renderPreparationDuration();
  persistSettingsToStorage();
}

function getStuckPenaltyPercent() {
  return Math.round(state.prepStuckPenalty * 100);
}

function renderStuckPenalty() {
  if (stuckPenaltyBtn) {
    stuckPenaltyBtn.textContent = `Jam Penalty: ${getStuckPenaltyPercent()}%`;
  }
  if (stuckPenaltyInputEl) {
    stuckPenaltyInputEl.value = String(getStuckPenaltyPercent());
  }
  if (nonStopModeBtn) {
    nonStopModeBtn.textContent = `Non-Stop Mode: ${state.prepNonStopMode ? 'On' : 'Off'}`;
    nonStopModeBtn.classList.toggle('active', state.prepNonStopMode);
    nonStopModeBtn.setAttribute('aria-pressed', String(state.prepNonStopMode));
  }
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
  persistSettingsToStorage();
}

function commitSpecialSpawnChance() {
  if (!specialSpawnInputEl) return;
  if (!specialSpawnInputEl.value) {
    renderSpecialSpawnChance();
    return;
  }
  previewSpecialSpawnChance(specialSpawnInputEl.value);
}

function previewSkillTileSpawnInterval(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepSkillTileSpawnIntervalMs = Math.max(1000, Math.min(60000, Math.floor(parsed) * 1000));
  renderSkillTileSettings();
  persistSettingsToStorage();
}

function commitSkillTileSpawnInterval() {
  if (!skillTileIntervalInputEl) return;
  if (!skillTileIntervalInputEl.value) {
    renderSkillTileSettings();
    return;
  }
  previewSkillTileSpawnInterval(skillTileIntervalInputEl.value);
}

function previewMaxSkillTiles(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepMaxSkillTiles = Math.max(0, Math.min(64, Math.floor(parsed)));
  renderSkillTileSettings();
  persistSettingsToStorage();
}

function previewDesiredSkillCost(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepDesiredSkillCost = Math.max(0, Math.min(100, Math.floor(parsed)));
  renderDesiredSkillSettings();
  renderSkillButtons();
  persistSettingsToStorage();
}

function previewStuckPenalty(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  state.prepStuckPenalty = Math.max(0, Math.min(1, parsed / 100));
  renderStuckPenalty();
  persistSettingsToStorage();
}

function commitStuckPenalty() {
  if (!stuckPenaltyInputEl) return;
  if (!stuckPenaltyInputEl.value) {
    renderStuckPenalty();
    return;
  }
  previewStuckPenalty(stuckPenaltyInputEl.value);
}

function toggleNonStopMode() {
  state.prepNonStopMode = !state.prepNonStopMode;
  renderStuckPenalty();
  persistSettingsToStorage();
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
  persistSettingsToStorage();
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
  persistSettingsToStorage();
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
    cell.style.boxShadow = getPieceGlowStyle(piece, { scale: cellSize / 28 });
    dragEl.appendChild(cell);
  });

  document.body.appendChild(dragEl);
  return dragEl;
}

function createAreaSkillDragElement(cellSize) {
  const dragEl = document.createElement('div');
  dragEl.className = 'skill-drag-preview';
  dragEl.style.width = `${cellSize * 3}px`;
  dragEl.style.height = `${cellSize * 3}px`;

  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      const cellEl = document.createElement('div');
      cellEl.className = 'skill-drag-cell';
      cellEl.style.width = `${cellSize - 2}px`;
      cellEl.style.height = `${cellSize - 2}px`;
      cellEl.style.left = `${x * cellSize + 1}px`;
      cellEl.style.top = `${y * cellSize + 1}px`;
      dragEl.appendChild(cellEl);
    }
  }

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

function startAreaSkillDrag(event, originEl, player, skillId) {
  if (state.activeDrags.has(event.pointerId)) return;
  const cellSize = state.boardMetrics.cellSize;
  const dragEl = createAreaSkillDragElement(cellSize);

  originEl.classList.add('drag-origin');

  const drag = {
    pointerId: event.pointerId,
    kind: 'area-skill',
    player,
    skillId,
    originEl,
    dragEl,
    cellSize,
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
    cell.classList.remove('ghost-valid', 'ghost-invalid', 'skill-target-valid', 'skill-target-center');
  });
}

function markGhost(drag) {
  clearGhostMarks();
  if (!drag.candidate) return;
  if (drag.kind === 'area-skill') {
    getAreaClearCells(drag.candidate.x, drag.candidate.y).forEach(({ x, y }) => {
      state.boardCells[y][x].classList.add('skill-target-valid');
    });
    if (drag.valid) state.boardCells[drag.candidate.y][drag.candidate.x].classList.add('skill-target-center');
    return;
  }
  const className = drag.valid ? 'ghost-valid' : 'ghost-invalid';
  drag.piece.cells.forEach(([dx, dy]) => {
    const x = drag.candidate.x + dx;
    const y = drag.candidate.y + dy;
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      state.boardCells[y][x].classList.add(className);
    }
  });
}

function findNearbyPlacement(piece, x, y) {
  const offsets = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];

  for (const [offsetX, offsetY] of offsets) {
    const candidateX = x + offsetX;
    const candidateY = y + offsetY;
    if (canPlacePiece(piece, candidateX, candidateY)) {
      return { x: candidateX, y: candidateY };
    }
  }

  return null;
}

function updateDrag(event, drag) {
  if (drag.kind === 'area-skill') {
    const left = event.clientX - drag.cellSize * 1.5;
    const top = event.clientY - drag.cellSize * 1.5;
    drag.dragEl.style.left = `${left}px`;
    drag.dragEl.style.top = `${top}px`;

    const candidate = {
      x: Math.floor((event.clientX - state.boardMetrics.left) / drag.cellSize),
      y: Math.floor((event.clientY - state.boardMetrics.top) / drag.cellSize),
    };
    drag.candidate = candidate;
    drag.valid = (
      candidate.x >= 0
      && candidate.x < BOARD_SIZE
      && candidate.y >= 0
      && candidate.y < BOARD_SIZE
    );
    drag.dragEl.classList.toggle('valid', drag.valid);
    drag.dragEl.classList.toggle('invalid', !drag.valid);
    markGhost(drag);
    return;
  }

  const left = event.clientX - drag.pointerOffsetX;
  const top = event.clientY - drag.pointerOffsetY;
  drag.dragEl.style.left = `${left}px`;
  drag.dragEl.style.top = `${top}px`;

  const rawCandidate = {
    x: Math.round((left - state.boardMetrics.left) / drag.cellSize),
    y: Math.round((top - state.boardMetrics.top) / drag.cellSize),
  };
  const adjustedCandidate = findNearbyPlacement(drag.piece, rawCandidate.x, rawCandidate.y);
  drag.candidate = adjustedCandidate || rawCandidate;
  drag.valid = Boolean(adjustedCandidate);
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
  if (drag.kind === 'area-skill') {
    if (drag.valid && drag.candidate && drag.skillId === 'green') {
      activateAreaClearSkill(drag.player, drag.candidate.x, drag.candidate.y);
    } else {
      flashInvalid(drag.originEl);
    }
    return;
  }
  if (drag.valid && drag.candidate && canPlacePiece(drag.piece, drag.candidate.x, drag.candidate.y)) {
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

function playerHasPlayablePiece(player) {
  return state.racks[player].some((piece, slotIndex) => (
    piece && !isRackSlotBlocked(player, slotIndex) && anyPlacementForPiece(piece)
  ));
}

function syncIdlePenaltyTracking({ resetPlayers = [] } = {}) {
  const resetSet = new Set(resetPlayers);
  const now = Date.now();
  for (let player = 0; player < 2; player += 1) {
    if (!state.gameActive || !playerHasPlayablePiece(player)) {
      state.idlePenaltyEligibleSince[player] = null;
      state.idlePenaltyNextTickAt[player] = null;
      continue;
    }
    if (resetSet.has(player) || state.idlePenaltyEligibleSince[player] === null) {
      state.idlePenaltyEligibleSince[player] = now;
      state.idlePenaltyNextTickAt[player] = now + IDLE_PENALTY_GRACE_MS + IDLE_PENALTY_TICK_MS;
    }
  }
}

function applyIdlePenalties() {
  if (!state.gameActive) return;
  const now = Date.now();
  let scoreChanged = false;

  for (let player = 0; player < 2; player += 1) {
    if (!playerHasPlayablePiece(player)) {
      state.idlePenaltyEligibleSince[player] = null;
      state.idlePenaltyNextTickAt[player] = null;
      continue;
    }
    if (state.idlePenaltyEligibleSince[player] === null || state.idlePenaltyNextTickAt[player] === null) {
      state.idlePenaltyEligibleSince[player] = now;
      state.idlePenaltyNextTickAt[player] = now + IDLE_PENALTY_GRACE_MS + IDLE_PENALTY_TICK_MS;
      continue;
    }
    if (now < state.idlePenaltyNextTickAt[player]) continue;

    const elapsedTicks = 1 + Math.floor((now - state.idlePenaltyNextTickAt[player]) / IDLE_PENALTY_TICK_MS);
    const nextScore = Math.max(0, state.scores[player] - elapsedTicks);
    if (nextScore !== state.scores[player]) {
      state.scores[player] = nextScore;
      scoreChanged = true;
    }
    state.idlePenaltyNextTickAt[player] += elapsedTicks * IDLE_PENALTY_TICK_MS;
  }

  if (scoreChanged) updateScores();
}

function putPieceOnBoard(piece, x, y) {
  piece.cells.forEach(([dx, dy]) => {
    state.board[y + dy][x + dx] = {
      player: piece.player,
      previewColor: piece.previewColor,
      glowColor: piece.glowColor,
      glowStrength: piece.glowStrength,
    };
  });
}

function specialTileKey(x, y) {
  return `${x},${y}`;
}

function getAvailableSkillTileKeys() {
  const availableTiles = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const key = specialTileKey(x, y);
      if (state.specialTiles.has(key) || state.skillTiles.has(key)) continue;
      availableTiles.push(key);
    }
  }
  return availableTiles;
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
  const consumedSkillTiles = [];
  clearSet.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cell = state.board[y][x];
    if (!cell) return;
    baseScore += 1;
    if (state.specialTiles.has(key)) consumedSpecialTiles.push(key);
    const skillTile = state.skillTiles.get(key);
    if (skillTile) consumedSkillTiles.push({ key, skillId: skillTile.id });
  });
  const lineCount = rows.length + cols.length;
  const specialDoubled = consumedSpecialTiles.length > 0;
  return {
    points: baseScore * lineCount * (specialDoubled ? 2 : 1),
    lineCount,
    specialDoubled,
    consumedSpecialTiles,
    consumedSkillTiles,
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

function getComputerSkillGainValue(player, consumedSkillTiles = []) {
  if (state.activeSkillEffects[player] || !consumedSkillTiles.length) return 0;
  const latestSkill = consumedSkillTiles[consumedSkillTiles.length - 1];
  if (!latestSkill) return 0;
  const skillValues = {
    red: 3,
    blue: 3,
    green: 3,
  };
  return skillValues[latestSkill.skillId] || consumedSkillTiles.length;
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
  const consumedSkillTiles = [];
  clearSet.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cell = board[y][x];
    if (!cell) return;
    baseScore += 1;
    if (specialTiles.has(key)) consumedSpecialTiles.push(key);
    const skillTile = state.skillTiles.get(key);
    if (skillTile) consumedSkillTiles.push({ key, skillId: skillTile.id });
  });

  const lineCount = rows.length + cols.length;
  const specialDoubled = consumedSpecialTiles.length > 0;
  return {
    points: baseScore * lineCount * (specialDoubled ? 2 : 1),
    lineCount,
    specialDoubled,
    consumedSpecialTiles,
    consumedSkillTiles,
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
  rack = state.racks[piece.player] || [],
  specialTiles = state.specialTiles,
} = {}) {
  const simulatedBoard = cloneBoard();
  piece.cells.forEach(([dx, dy]) => {
    simulatedBoard[y + dy][x + dx] = {
      player: piece.player,
      previewColor: piece.previewColor,
      glowColor: piece.glowColor,
      glowStrength: piece.glowStrength,
    };
  });

  const clearInfo = getClearInfoForBoard(simulatedBoard);
  const scoreResult = (clearInfo.rows.length || clearInfo.cols.length)
    ? scoreForClearOnBoard(simulatedBoard, specialTiles, clearInfo.rows, clearInfo.cols)
    : {
      points: 0,
      lineCount: 0,
      specialDoubled: false,
      consumedSpecialTiles: [],
      consumedSkillTiles: [],
    };

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
    skillGainCount: state.activeSkillEffects[piece.player] ? 0 : scoreResult.consumedSkillTiles.length,
    skillGainValue: getComputerSkillGainValue(piece.player, scoreResult.consumedSkillTiles),
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
      || b.skillGainValue - a.skillGainValue
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
    || (config.selection === 'hard' ? b.skillGainValue - a.skillGainValue : 0)
    || b.futurePlacements - a.futurePlacements
    || b.specialCount - a.specialCount
    || b.skillGainCount - a.skillGainCount
    || a.occupiedCells - b.occupiedCells
    || b.piece.cells.length - a.piece.cells.length
    || a.y - b.y
    || a.x - b.x
  );
}

function pickBestComputerMoveForRack(rack, {
  useSkill = false,
  config = getComputerDifficultyConfig(0),
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

function getComputerMovePlan(player) {
  const config = getComputerDifficultyConfig(player);
  const currentRack = state.racks[player].map((piece, slotIndex) => (
    isRackSlotBlocked(player, slotIndex) ? null : piece
  ));
  const regularMove = pickBestComputerMoveForRack(currentRack, { config, useSkill: false });
  if (!config.allowDesiredSkill || !canUseDesiredSkill(player, { allowComputer: true })) {
    return regularMove;
  }

  const desiredSlotIndex = Math.floor(MAX_RACK / 2);
  const skillRack = currentRack.map((piece, index) => (
    index === desiredSlotIndex ? makeDesiredRackPiece(player) : piece
  ));
  const skillMove = pickBestComputerMoveForRack(skillRack, { config, useSkill: true });
  if (!skillMove) return regularMove;
  if (!regularMove) return skillMove;
  return compareComputerMoves(skillMove, regularMove, config) < 0 ? skillMove : regularMove;
}

function findBestAreaClearTarget(player) {
  let bestTarget = null;
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const removedBlocks = getAreaClearCells(x, y).reduce((total, cell) => (
        state.board[cell.y][cell.x] ? total + 1 : total
      ), 0);
      if (!bestTarget || removedBlocks > bestTarget.removedBlocks) {
        bestTarget = { x, y, removedBlocks };
      }
    }
  }
  return bestTarget;
}

function maybeUseComputerOwnedSkill(player) {
  const ownedSkillId = state.ownedSkills[player];
  if (!ownedSkillId) return false;
  if (!state.gameActive || !isComputerPlayer(player)) return false;

  const config = getComputerDifficultyConfig(player);
  if (ownedSkillId === 'red') {
    return activateScoreBoostSkill(player, { allowComputer: true });
  }
  if (ownedSkillId === 'blue') {
    const targetPlayer = player === 0 ? 1 : 0;
    if (isRackSlotBlocked(targetPlayer, MAX_RACK - 1)) return false;
    if (!state.racks[targetPlayer][MAX_RACK - 1]) return false;
    return activatePieceBlockSkill(player, { allowComputer: true });
  }
  if (ownedSkillId === 'green') {
    const bestTarget = findBestAreaClearTarget(player);
    if (!bestTarget) return false;
    const thresholdByDifficulty = {
      easy: 4,
      normal: 3,
      hard: 2,
      insane: 1,
    };
    const threshold = thresholdByDifficulty[config.selection] ?? 3;
    if (bestTarget.removedBlocks < threshold) return false;
    return activateAreaClearSkill(player, bestTarget.x, bestTarget.y, { allowComputer: true });
  }
  return false;
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
  if (player === 0 && !isSingleBottomHumanView()) popupEl.classList.add('player-top-clear');

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

function showAreaClearPopup(points, anchorCell, player = null) {
  if (!state.boardMetrics) refreshLayoutMetrics();

  const popupEl = document.createElement('div');
  popupEl.className = 'score-popup area-clear-popup';
  if (player === 0 && !isSingleBottomHumanView()) popupEl.classList.add('player-top-clear');

  const linesEl = document.createElement('div');
  linesEl.className = 'score-popup-lines';
  linesEl.textContent = 'Area Clear';
  popupEl.appendChild(linesEl);

  const pointsEl = document.createElement('div');
  pointsEl.className = 'score-popup-points';
  pointsEl.textContent = `+${points}`;
  popupEl.appendChild(pointsEl);

  const detailEl = document.createElement('div');
  detailEl.className = 'score-popup-bonus';
  detailEl.textContent = 'blocks removed';
  popupEl.appendChild(detailEl);

  const cellSize = state.boardMetrics.cellSize;
  const left = Math.min(state.boardMetrics.width - 20, Math.max(20, (anchorCell.x + 0.5) * cellSize));
  const top = Math.min(state.boardMetrics.height - 20, Math.max(24, (anchorCell.y + 0.5) * cellSize));

  popupEl.style.left = `${left}px`;
  popupEl.style.top = `${top}px`;
  scorePopupLayerEl.appendChild(popupEl);

  setTimeout(() => {
    popupEl.remove();
  }, 3000);
}

function showJamPenaltyPopup(player, percentLost, pointsLost) {
  const scoreBoxEl = scoreBoxEls[player];
  if (!scoreBoxEl) return;

  scoreBoxEl.querySelector('.jam-penalty-popup')?.remove();
  const existingHandle = state.jamPenaltyPopupHandles[player];
  if (existingHandle) clearTimeout(existingHandle);

  const popupEl = document.createElement('div');
  popupEl.className = 'jam-penalty-popup';
  if (player === 0 && !app.classList.contains('vs-computer-mode')) {
    popupEl.classList.add('player-top-penalty');
  }

  const percentEl = document.createElement('div');
  percentEl.className = 'jam-penalty-percent';
  percentEl.textContent = `-${percentLost}%`;

  const pointsEl = document.createElement('div');
  pointsEl.className = 'jam-penalty-points';
  pointsEl.textContent = `-${pointsLost}`;

  const labelEl = document.createElement('div');
  labelEl.className = 'jam-penalty-label';
  labelEl.textContent = 'Jam penalty';

  popupEl.append(percentEl, pointsEl, labelEl);
  scoreBoxEl.appendChild(popupEl);

  state.jamPenaltyPopupHandles[player] = setTimeout(() => {
    popupEl.remove();
    state.jamPenaltyPopupHandles[player] = null;
  }, 3000);
}

function showScoreBoostPayoutPopup(player, points) {
  const scoreBoxEl = scoreBoxEls[player];
  if (!scoreBoxEl || points <= 0) return;

  scoreBoxEl.querySelector('.score-boost-popup')?.remove();
  const popupEl = document.createElement('div');
  popupEl.className = 'score-boost-popup';
  if (player === 0 && !app.classList.contains('vs-computer-mode')) {
    popupEl.classList.add('player-top-penalty');
  }

  const pointsEl = document.createElement('div');
  pointsEl.className = 'score-boost-points';
  pointsEl.textContent = `+${points}`;

  const labelEl = document.createElement('div');
  labelEl.className = 'score-boost-label';
  labelEl.textContent = 'Score Boost';

  popupEl.append(pointsEl, labelEl);
  scoreBoxEl.appendChild(popupEl);

  setTimeout(() => {
    popupEl.remove();
  }, 1800);
}

function getAreaClearCells(centerX, centerY) {
  const cells = [];
  for (let y = centerY - 1; y <= centerY + 1; y += 1) {
    for (let x = centerX - 1; x <= centerX + 1; x += 1) {
      if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) continue;
      cells.push({ x, y });
    }
  }
  return cells;
}

function activateAreaClearSkill(player, centerX, centerY, { allowComputer = false } = {}) {
  if (!state.gameActive) return false;
  if (!allowComputer && isComputerPlayer(player)) return false;
  if (state.ownedSkills[player] !== 'green') return false;

  const affectedCells = getAreaClearCells(centerX, centerY);
  let removedBlocks = 0;
  affectedCells.forEach(({ x, y }) => {
    if (state.board[y][x]) {
      state.board[y][x] = null;
      removedBlocks += 1;
    }
  });

  state.ownedSkills[player] = null;
  if (removedBlocks > 0) {
    addPoints(player, removedBlocks);
    publishGameplayAction(multiplayerApi.GAME_ACTIONS?.GAIN_SCORE || 'gain_score', {
      player,
      points: removedBlocks,
      reason: 'area_clear_skill',
    });
  }

  renderBoard();
  renderRacks();
  syncIdlePenaltyTracking({ resetPlayers: [player] });
  showAreaClearPopup(removedBlocks, { x: centerX, y: centerY }, player);
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.USE_SKILL || 'use_skill', {
    player,
    skillId: 'green',
    centerX,
    centerY,
    removedBlocks,
  }, { includeSnapshot: true });
  return true;
}

function activateScoreBoostSkill(player, { allowComputer = false } = {}) {
  if (!state.gameActive) return false;
  if (!allowComputer && isComputerPlayer(player)) return false;
  if (state.ownedSkills[player] !== 'red') return false;
  if (state.activeSkillEffects[player]) return false;

  state.ownedSkills[player] = null;
  state.activeSkillEffects[player] = {
    skillId: 'red',
    accumulated: 0,
    remainingMs: SCORE_BOOST_DURATION_MS,
  };
  renderOwnedSkills();
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.USE_SKILL || 'use_skill', {
    player,
    skillId: 'red',
  });
  return true;
}

function activatePieceBlockSkill(player, { allowComputer = false } = {}) {
  if (!state.gameActive) return false;
  if (!allowComputer && isComputerPlayer(player)) return false;
  if (state.ownedSkills[player] !== 'blue') return false;
  if (state.activeSkillEffects[player]) return false;

  state.ownedSkills[player] = null;
  state.activeSkillEffects[player] = {
    skillId: 'blue',
    targetPlayer: player === 0 ? 1 : 0,
    remainingMs: SCORE_BOOST_DURATION_MS,
  };
  renderOwnedSkills();
  renderRacks();
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.USE_SKILL || 'use_skill', {
    player,
    skillId: 'blue',
    targetPlayer: player === 0 ? 1 : 0,
  });
  return true;
}

function updateActiveSkillEffects(elapsedMs) {
  let blueEffectChanged = false;
  for (let player = 0; player < state.activeSkillEffects.length; player += 1) {
    const effect = state.activeSkillEffects[player];
    if (!effect) continue;
    effect.remainingMs = Math.max(0, effect.remainingMs - elapsedMs);
    if (effect.skillId === 'blue') blueEffectChanged = true;
    if (effect.remainingMs > 0) continue;

    const payout = effect.accumulated;
    state.activeSkillEffects[player] = null;
    if (effect.skillId === 'red' && payout > 0) {
      addPoints(player, payout, { copyable: false });
      showScoreBoostPayoutPopup(player, payout);
    } else {
      renderOwnedSkills();
    }
    if (effect.skillId === 'blue') blueEffectChanged = true;
  }
  if (blueEffectChanged) renderRacks();
}

function awardOwnedSkill(player, consumedSkillTiles = []) {
  if (!consumedSkillTiles.length) return;
  if (state.activeSkillEffects[player]) return;
  const latestSkill = consumedSkillTiles[consumedSkillTiles.length - 1];
  state.ownedSkills[player] = latestSkill.skillId;
}

function animateAndClear(rows, cols, consumedSpecialTiles = [], consumedSkillTiles = []) {
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

  // Clear the logical board immediately so overlapping turns cannot rescore
  // the same completed lines while the clear animation is still visible.
  rows.forEach((y) => {
    for (let x = 0; x < BOARD_SIZE; x += 1) state.board[y][x] = null;
  });
  cols.forEach((x) => {
    for (let y = 0; y < BOARD_SIZE; y += 1) state.board[y][x] = null;
  });
  consumedSpecialTiles.forEach((key) => state.specialTiles.delete(key));
  consumedSkillTiles.forEach(({ key }) => state.skillTiles.delete(key));

  setTimeout(() => {
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

function animateSkillTileSpawn(tileKeys) {
  tileKeys.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const cellEl = state.boardCells?.[y]?.[x];
    if (!cellEl) return;
    cellEl.classList.remove('skill-spawn');
    void cellEl.offsetWidth;
    cellEl.classList.add('skill-spawn');
    setTimeout(() => cellEl.classList.remove('skill-spawn'), 720);
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
      if (!state.specialTiles.has(key) && !state.skillTiles.has(key)) availableTiles.push(key);
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

function spawnSkillTiles() {
  const remainingCapacity = Math.max(0, state.prepMaxSkillTiles - state.skillTiles.size);
  if (remainingCapacity <= 0) return;
  const availableTiles = getAvailableSkillTileKeys();
  if (!availableTiles.length) return;

  const spawnCount = Math.min(
    SKILL_TILE_SPAWN_COUNT,
    remainingCapacity,
    availableTiles.length,
    SKILL_TILE_TYPES.length,
  );
  if (!spawnCount) return;

  const availableSkills = [...SKILL_TILE_TYPES];
  const spawnedTiles = [];
  for (let i = 0; i < spawnCount; i += 1) {
    const skillIndex = Math.floor(Math.random() * availableSkills.length);
    const [skill] = availableSkills.splice(skillIndex, 1);
    const tileIndex = Math.floor(Math.random() * availableTiles.length);
    const [tileKey] = availableTiles.splice(tileIndex, 1);
    state.skillTiles.set(tileKey, skill);
    spawnedTiles.push(tileKey);
  }

  renderBoard();
  animateSkillTileSpawn(spawnedTiles);
}

function updateSkillTileSpawns(elapsedMs) {
  state.skillTileSpawnElapsedMs += elapsedMs;
  while (state.skillTileSpawnElapsedMs >= state.prepSkillTileSpawnIntervalMs) {
    state.skillTileSpawnElapsedMs -= state.prepSkillTileSpawnIntervalMs;
    spawnSkillTiles();
  }
}

function refillSource(source) {
  state.racks[source.player][source.slotIndex] = makePiece(source.player);
  renderRacks();
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.NEXT_PIECE_STATE || 'next_piece_state', {
    player: source.player,
    slotIndex: source.slotIndex,
    piece: serializePieceForSync(state.racks[source.player][source.slotIndex]),
  });
}

function clearComputerMoveTimer(player = null) {
  const players = player === null ? [0, 1] : [player];
  players.forEach((targetPlayer) => {
    const handle = state.computerMoveHandles[targetPlayer];
    if (!handle) return;
    clearTimeout(handle);
    state.computerMoveHandles[targetPlayer] = null;
  });
}

function scheduleComputerMove(player = null) {
  const players = player === null ? [0, 1] : [player];
  players.forEach((targetPlayer) => {
    if (!state.gameActive || !isComputerPlayer(targetPlayer)) return;
    if (state.computerMoveHandles[targetPlayer]) return;
    const { intervalMs } = getComputerDifficultyConfig(targetPlayer);
    state.computerMoveHandles[targetPlayer] = setTimeout(() => {
      state.computerMoveHandles[targetPlayer] = null;
      if (!state.gameActive || !isComputerPlayer(targetPlayer)) return;
      runComputerTurn(targetPlayer);
      scheduleComputerMove(targetPlayer);
    }, intervalMs);
  });
}

function runComputerTurn(player) {
  if (!state.gameActive || !isComputerPlayer(player)) return;
  maybeUseComputerOwnedSkill(player);
  const move = getComputerMovePlan(player);
  if (!move) return;

  if (move.useSkill) {
    const activated = activateDesiredSkill(player, { allowComputer: true });
    if (!activated) return;
  }

  const slotIndex = move.slotIndex;
  if (slotIndex < 0) return;
  const originEl = state.slotEls[player][slotIndex];
  if (!originEl) return;
  const piece = state.racks[player][slotIndex];
  if (!piece || !canPlacePiece(piece, move.x, move.y)) return;

  placeDraggedPiece({
    piece,
    candidate: { x: move.x, y: move.y },
    source: { sourceType: 'rack', player, slotIndex },
    originEl,
  });
}

function placeDraggedPiece(drag) {
  const { x, y } = drag.candidate;
  const scoringPlayer = drag.source.player;
  putPieceOnBoard(drag.piece, x, y);
  addPoints(scoringPlayer, 1);
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.PLACE_PIECE || 'place_piece', {
    player: scoringPlayer,
    x,
    y,
    source: drag.source,
    piece: serializePieceForSync(drag.piece),
  });
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.GAIN_SCORE || 'gain_score', {
    player: scoringPlayer,
    points: 1,
    reason: 'piece_placement',
  });
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  flashSuccess(drag.originEl);

  const clearInfo = getClearInfo();
  if (clearInfo.rows.length || clearInfo.cols.length) {
    const scoreResult = scoreForClear(clearInfo.rows, clearInfo.cols);
    awardOwnedSkill(scoringPlayer, scoreResult.consumedSkillTiles);
    addPoints(scoringPlayer, scoreResult.points);
    publishGameplayAction(multiplayerApi.GAME_ACTIONS?.CLEAR_LINES || 'clear_lines', {
      player: scoringPlayer,
      rows: [...clearInfo.rows],
      cols: [...clearInfo.cols],
      scoreResult,
    }, { includeSnapshot: true });
    publishGameplayAction(multiplayerApi.GAME_ACTIONS?.GAIN_SCORE || 'gain_score', {
      player: scoringPlayer,
      points: scoreResult.points,
      reason: 'line_clear',
    });
    showScorePopup(scoreResult, getPopupAnchorCell(drag.piece, x, y), scoringPlayer);
    animateAndClear(
      clearInfo.rows,
      clearInfo.cols,
      scoreResult.consumedSpecialTiles,
      scoreResult.consumedSkillTiles,
    );
    maybeSpawnSpecialTiles();
  }

  refillSource(drag.source);
  syncIdlePenaltyTracking({ resetPlayers: [scoringPlayer] });
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
    syncIdlePenaltyTracking({ resetPlayers: [0, 1] });
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
  state.skillTiles = new Map();
  state.skillTileSpawnElapsedMs = 0;
  fillAllRacks();
  renderBoard();
  renderRacks();
  renderSpecialSlot();
  syncIdlePenaltyTracking({ resetPlayers: [0, 1] });
}

function handleStuck(triggerPlayer) {
  const previousScore = Math.floor(state.scores[triggerPlayer]);
  const keptRatio = Math.max(0, 1 - state.prepStuckPenalty);
  state.scores[triggerPlayer] = Math.floor(state.scores[triggerPlayer] * keptRatio);
  const nextScore = Math.floor(state.scores[triggerPlayer]);
  const pointsLost = Math.max(0, previousScore - nextScore);
  updateScores();
  showJamPenaltyPopup(triggerPlayer, getStuckPenaltyPercent(), pointsLost);
  if (state.prepNonStopMode) {
    clearComputerMoveTimer();
    clearBoardAndRefreshPieces();
    scheduleComputerMove();
    return;
  }
  state.gameActive = false;
  clearComputerMoveTimer();
  showPauseOverlay(`${getPlayerDisplayName(triggerPlayer)} caused a jam. Score reduced by ${getStuckPenaltyPercent()}%!`);
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
    syncIdlePenaltyTracking({ resetPlayers: [0, 1] });
    renderSkillButtons();
    renderPauseButton();
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
    applyIdlePenalties();
    updateActiveSkillEffects(1000);
    updateSkillTileSpawns(1000);
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
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.END_ROUND || 'end_round', {
    scores: [...state.scores],
    winner: a === b ? null : (a > b ? 0 : 1),
  }, { includeSnapshot: true });
}

function toggleComputerMode(player) {
  if (!canEditPreparationForPlayer(player)) return;
  state.computerPlayers[player] = !state.computerPlayers[player];
  closeDifficultyModal();
  closeCustomComputerModal();
  if (!state.computerPlayers[player]) clearComputerMoveTimer(player);
  else if (state.gameActive) scheduleComputerMove(player);
  renderModeUi();
  renderDesiredPiecePreviews();
  renderSkillButtons();
  renderRacks();
  persistSettingsToStorage();
}

function openDifficultyModal(player) {
  if (!canEditPreparationForPlayer(player)) return;
  if (!isComputerPlayer(player)) return;
  state.activeDifficultyPlayer = player;
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeSpecialSpawnModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  closeCustomComputerModal();
  if (difficultyModalTitleEl) difficultyModalTitleEl.textContent = `${getPlayerDisplayName(player)} DIFFICULTY`;
  difficultyModalEl.classList.remove('hidden');
  buildDifficultyList();
}

function closeDifficultyModal() {
  difficultyModalEl.classList.add('hidden');
}

function openCustomComputerModal(player = state.activeDifficultyPlayer) {
  state.activeDifficultyPlayer = player;
  applyComputerDifficulty(player, 'custom');
  if (difficultyCustomModalTitleEl) {
    difficultyCustomModalTitleEl.textContent = `${getPlayerDisplayName(player)} CUSTOM COMPUTER`;
  }
  renderDifficultyCustomPanel();
  difficultyCustomModalEl.classList.remove('hidden');
}

function closeCustomComputerModal() {
  difficultyCustomModalEl.classList.add('hidden');
}

function updateCustomComputerSettings(player, updates) {
  state.customComputerSettings[player] = normalizeCustomComputerSettingsEntry({
    ...(state.customComputerSettings[player] || makeDefaultCustomComputerSettings()),
    ...updates,
  });
  renderModeUi();
  if (!difficultyCustomModalEl.classList.contains('hidden')) renderDifficultyCustomPanel();
  if (!difficultyModalEl.classList.contains('hidden')) buildDifficultyList();
  if (isComputerPlayer(player) && state.computerDifficulties[player] === 'custom' && state.gameActive) {
    clearComputerMoveTimer(player);
    scheduleComputerMove(player);
  }
  persistSettingsToStorage();
}

function openSpecialSpawnModal() {
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  renderSpecialSpawnChance();
  specialSpawnModalEl.classList.remove('hidden');
}

function closeSpecialSpawnModal() {
  specialSpawnModalEl.classList.add('hidden');
}

function openSkillTileSettingsModal() {
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  renderSkillTileSettings();
  skillTileSettingsModalEl.classList.remove('hidden');
}

function closeSkillTileSettingsModal() {
  skillTileSettingsModalEl.classList.add('hidden');
}

function openStuckPenaltyModal() {
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  renderStuckPenalty();
  stuckPenaltyModalEl.classList.remove('hidden');
}

function closeStuckPenaltyModal() {
  stuckPenaltyModalEl.classList.add('hidden');
}

function openDesiredSkillSettingsModal() {
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  renderDesiredSkillSettings();
  desiredSkillSettingsModalEl.classList.remove('hidden');
}

function closeDesiredSkillSettingsModal() {
  desiredSkillSettingsModalEl.classList.add('hidden');
}

function openSettingsTransferModal() {
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  closeBlockStyleModal();
  refreshSettingsTransferExport();
  if (settingsImportInputEl) settingsImportInputEl.value = '';
  if (settingsUploadInputEl) settingsUploadInputEl.value = '';
  setSettingsTransferStatus('');
  settingsTransferModalEl.classList.remove('hidden');
}

function closeSettingsTransferModal() {
  settingsTransferModalEl.classList.add('hidden');
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
  if (!canEditPreparationForPlayer(player)) return;
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
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
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
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
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeGameDescriptionModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  closeDesiredPieceModal();
  piecePoolModalEl.classList.remove('hidden');
  renderPiecePoolList();
}

function closePiecePoolModal() {
  piecePoolModalEl.classList.add('hidden');
}

function openGameDescriptionModal() {
  closeSettingsTransferModal();
  closeBlockStyleModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  gameDescriptionModalEl.classList.remove('hidden');
}

function closeGameDescriptionModal() {
  gameDescriptionModalEl.classList.add('hidden');
}

function openBlockStyleModal(player) {
  if (!canEditPreparationForPlayer(player)) return;
  closeSettingsTransferModal();
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeStuckPenaltyModal();
  closeDesiredSkillSettingsModal();
  state.blockStyleModalPlayer = player;
  blockStyleModalEl.classList.remove('hidden');
  renderBlockStyleModal();
}

function closeBlockStyleModal() {
  state.blockStyleModalPlayer = null;
  blockStyleModalEl.classList.add('hidden');
}

function toggleAllowedShape(shapeId) {
  if (state.allowedShapeIds.has(shapeId)) {
    state.allowedShapeIds.delete(shapeId);
  } else {
    state.allowedShapeIds.add(shapeId);
  }
  renderPiecePoolList({ preserveFocus: true });
  persistSettingsToStorage();
}

function toggleShapeGroup(shapeIds) {
  const validShapeIds = shapeIds.filter((shapeId) => state.allowedShapeIds.has(shapeId) || getAllShapeDefs().some((shape) => shape.id === shapeId));
  if (validShapeIds.length === 0) return;
  const enabledCount = validShapeIds.filter((shapeId) => state.allowedShapeIds.has(shapeId)).length;
  const shouldEnableAll = enabledCount !== validShapeIds.length;
  if (shouldEnableAll) {
    validShapeIds.forEach((shapeId) => state.allowedShapeIds.add(shapeId));
  } else {
    validShapeIds.forEach((shapeId) => state.allowedShapeIds.delete(shapeId));
  }
  renderPiecePoolList();
  persistSettingsToStorage();
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
    persistSettingsToStorage();
    return;
  }
  state.desiredPieces[state.pieceEditorDraft.player] = makeDesiredPiece(state.pieceEditorDraft.player, cells);
  renderDesiredPiecePreviews();
  closeDesiredPieceModal();
  persistSettingsToStorage();
}

function setPlayerColorTheme(player, themeIndex) {
  if (!Number.isInteger(themeIndex)) return;
  if (!PLAYER_COLOR_THEMES[themeIndex]) return;
  state.playerColorThemeIndexes[player] = themeIndex;
  state.playerCustomColors[player] = null;
  state.desiredPieces[player] = makeDesiredPiece(player, state.desiredPieces[player].cells);
  state.racks[player] = state.racks[player].map((piece) => {
    if (!piece) return piece;
    if (piece.shapeId === `desired-${player}`) return makeDesiredRackPiece(player);
    return {
      ...piece,
      player,
      previewColor: getPlayerPreviewColor(player),
      glowColor: getPlayerGlowColor(player),
      glowStrength: getPlayerGlowLevel(player),
    };
  });
  renderModeUi();
  renderDesiredPiecePreviews();
  renderRacks();
  renderBoard();
  persistSettingsToStorage();
}

function setPlayerCustomColor(player, colorHex) {
  const rgb = hexToRgb(colorHex);
  if (!rgb) return;
  const normalized = rgbToHex(rgb);
  state.playerCustomColors[player] = normalized;
  state.desiredPieces[player] = makeDesiredPiece(player, state.desiredPieces[player].cells);
  state.racks[player] = state.racks[player].map((piece) => {
    if (!piece) return piece;
    if (piece.shapeId === `desired-${player}`) return makeDesiredRackPiece(player);
    return {
      ...piece,
      player,
      previewColor: getPlayerPreviewColor(player),
      glowColor: getPlayerGlowColor(player),
      glowStrength: getPlayerGlowLevel(player),
    };
  });
  renderModeUi();
  renderDesiredPiecePreviews();
  renderRacks();
  renderBoard();
  persistSettingsToStorage();
}

function setPlayerGlowLevel(player, rawValue) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return;
  state.playerGlowLevels[player] = Math.max(0, Math.min(1, parsed));
  state.desiredPieces[player] = makeDesiredPiece(player, state.desiredPieces[player].cells);
  state.racks[player] = state.racks[player].map((piece) => {
    if (!piece) return piece;
    if (piece.shapeId === `desired-${player}`) return makeDesiredRackPiece(player);
    return {
      ...piece,
      player,
      previewColor: getPlayerPreviewColor(player),
      glowColor: getPlayerGlowColor(player),
      glowStrength: getPlayerGlowLevel(player),
    };
  });
  renderModeUi();
  renderDesiredPiecePreviews();
  renderRacks();
  renderBoard();
  persistSettingsToStorage();
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
  persistSettingsToStorage();
}

function activateDesiredSkill(player, { allowComputer = false } = {}) {
  if (!canUseDesiredSkill(player, { allowComputer })) return false;
  state.scores[player] -= state.prepDesiredSkillCost;
  state.skillCooldownEndsAt[player] = Date.now() + state.prepDesiredSkillCooldownMs;
  state.racks[player][Math.floor(MAX_RACK / 2)] = makeDesiredRackPiece(player);
  updateScores();
  renderRacks();
  syncIdlePenaltyTracking();
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.USE_SKILL || 'use_skill', {
    player,
    skillId: 'desired_piece',
    cost: state.prepDesiredSkillCost,
  });
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.NEXT_PIECE_STATE || 'next_piece_state', {
    player,
    slotIndex: Math.floor(MAX_RACK / 2),
    piece: serializePieceForSync(state.racks[player][Math.floor(MAX_RACK / 2)]),
  });
  return true;
}

function initDesiredPieces() {
  state.desiredPieces = [makeDesiredPiece(0), makeDesiredPiece(1)];
  renderDesiredPiecePreviews();
}

function beginGameFlow({ roomStartPayload = null } = {}) {
  if (roomStartPayload?.config) applyPreparationConfigSnapshot(roomStartPayload.config);
  commitPreparationDuration();
  commitSpecialSpawnChance();
  commitSkillTileSpawnInterval();
  commitStuckPenalty();
  commitDesiredSkillCost();
  commitDesiredSkillCooldown();
  endOverlayEl.classList.add('hidden');
  overlayEl.classList.add('hidden');
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeDesiredSkillSettingsModal();
  closeBlockStyleModal();
  closeSettingsTransferModal();
  closeRoomStatusModal();
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
  publishGameplayAction(multiplayerApi.GAME_ACTIONS?.READY_FOR_ROUND || 'ready_for_round', {
    playerId: getSession().clientId,
    startedBy: roomStartPayload?.startedBy || getSession().clientId,
    mode: getSession().mode,
  }, { includeSnapshot: true });
  startVisibleCountdown('START', 3, () => {
    state.gameActive = true;
    syncIdlePenaltyTracking({ resetPlayers: [0, 1] });
    startSkillUiLoop();
    renderSkillButtons();
    renderPauseButton();
    startTimerLoop();
    scheduleComputerMove();
  });
}

function startGameFlow() {
  if (isRoomSessionActive()) {
    if (!getSession().isHost || !state.roomClient) {
      renderSessionUi();
      return;
    }
    const roomUi = getRoomUiModel();
    if (!roomUi.canStart) {
      state.roomWarning = 'Waiting for the opponent to join before starting.';
      renderSessionUi();
      return;
    }
    state.roomClient.startGame(createPreparationConfigSnapshot(), createGameplaySyncSnapshot());
    renderSessionUi();
    return;
  }

  beginGameFlow();
}

function returnToPreparation() {
  endOverlayEl.classList.add('hidden');
  closeGameDescriptionModal();
  closeDesiredPieceModal();
  closePiecePoolModal();
  closeDifficultyModal();
  closeCustomComputerModal();
  closeSpecialSpawnModal();
  closeSkillTileSettingsModal();
  closeDesiredSkillSettingsModal();
  closeBlockStyleModal();
  closeSettingsTransferModal();
  closeRoomStatusModal();
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
  renderSkillTileSettings();
  renderStuckPenalty();
  renderDesiredSkillSettings();
  overlayEl.classList.remove('hidden');
  refreshLayoutMetrics();
  renderPauseButton();
  renderSessionUi();
}

function init() {
  buildBoard();
  buildRacks();
  buildDesiredPieceGrid();
  buildBlockStyleOptions();
  initAllowedShapes();
  initDesiredPieces();
  const loadedStoredSettings = loadSettingsFromStorage();
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
  renderSkillTileSettings();
  renderStuckPenalty();
  renderDesiredSkillSettings();
  renderFullscreenButton();
  refreshSettingsTransferExport();
  if (!loadedStoredSettings) persistSettingsToStorage();
  refreshLayoutMetrics();
  renderPauseButton();
  state.sessionFallbackActive = !state.session.isValid && state.session.requestedMode !== 'local';
  if (state.sessionFallbackActive) state.session = getFallbackLocalSession();
  state.room = multiplayerApi.createInitialRoomState
    ? multiplayerApi.createInitialRoomState(state.session)
    : state.room;
  renderSessionUi();
  if (isRoomSessionActive()) connectRoomSession();
}

desiredPieceBtnEls.forEach((btn, player) => {
  btn.addEventListener('click', () => openDesiredPieceModal(player));
});
blockStyleBtnEls.forEach((btn, player) => {
  btn?.addEventListener('click', () => openBlockStyleModal(player));
});
blockStyleColorOptionsEl?.addEventListener('click', (event) => {
  const optionEl = event.target.closest('.player-color-option');
  if (!optionEl || state.blockStyleModalPlayer === null) return;
  setPlayerColorTheme(state.blockStyleModalPlayer, Number(optionEl.dataset.themeIndex));
});
blockStyleColorPickerEl?.addEventListener('input', (event) => {
  if (state.blockStyleModalPlayer === null) return;
  setPlayerCustomColor(state.blockStyleModalPlayer, event.target.value);
});
blockStyleGlowInputEl?.addEventListener('input', (event) => {
  if (state.blockStyleModalPlayer === null) return;
  setPlayerGlowLevel(state.blockStyleModalPlayer, Number(event.target.value) / 100);
});
piecePoolBtn.addEventListener('click', openPiecePoolModal);
settingsTransferBtn.addEventListener('click', openSettingsTransferModal);
roomStatusBtn?.addEventListener('click', openRoomStatusModal);
fullscreenBtn?.addEventListener('click', () => {
  toggleFullscreenMode();
});
resetSettingsBtn.addEventListener('click', resetAllSettings);
specialSpawnBtn.addEventListener('click', openSpecialSpawnModal);
skillTileSettingsBtn.addEventListener('click', openSkillTileSettingsModal);
stuckPenaltyBtn.addEventListener('click', openStuckPenaltyModal);
desiredSkillSettingsBtn.addEventListener('click', openDesiredSkillSettingsModal);
gameDescriptionBtn.addEventListener('click', openGameDescriptionModal);
computerModeBtnEls.forEach((btn, player) => {
  btn?.addEventListener('click', () => toggleComputerMode(player));
});
computerDifficultyBtnEls.forEach((btn, player) => {
  btn?.addEventListener('click', () => openDifficultyModal(player));
});
customPieceBtn.addEventListener('click', openCustomPieceModal);
toggleCommonPiecesBtn?.addEventListener('click', () => {
  toggleShapeGroup(getCommonShapeIds());
});
toggleCustomPiecesBtn?.addEventListener('click', () => {
  toggleShapeGroup(getCustomShapeIds());
});
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
skillTileIntervalInputEl?.addEventListener('input', (event) => {
  const digitsOnly = event.target.value.replace(/[^\d]/g, '');
  event.target.value = digitsOnly;
  if (digitsOnly) previewSkillTileSpawnInterval(digitsOnly);
});
skillTileIntervalInputEl?.addEventListener('blur', () => {
  commitSkillTileSpawnInterval();
});
skillTileMaxInputEl?.addEventListener('input', (event) => {
  previewMaxSkillTiles(event.target.value);
});
stuckPenaltyInputEl?.addEventListener('input', (event) => {
  const digitsOnly = event.target.value.replace(/[^\d]/g, '');
  event.target.value = digitsOnly;
  if (digitsOnly) previewStuckPenalty(digitsOnly);
});
stuckPenaltyInputEl?.addEventListener('blur', () => {
  commitStuckPenalty();
});
nonStopModeBtn?.addEventListener('click', toggleNonStopMode);
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
difficultyCustomCloseBtn?.addEventListener('click', closeCustomComputerModal);
difficultyCustomIntervalEl?.addEventListener('input', (event) => {
  updateCustomComputerSettings(state.activeDifficultyPlayer, {
    intervalMs: Math.round(Number(event.target.value) * 1000),
  });
});
difficultyCustomDesiredToggleBtn?.addEventListener('click', () => {
  const player = state.activeDifficultyPlayer;
  const current = normalizeCustomComputerSettingsEntry(state.customComputerSettings[player] || {});
  updateCustomComputerSettings(player, { allowDesiredSkill: !current.allowDesiredSkill });
});
difficultyCustomStrategyEl?.addEventListener('change', (event) => {
  updateCustomComputerSettings(state.activeDifficultyPlayer, { strategyKey: event.target.value });
});
blockStyleCloseBtn.addEventListener('click', closeBlockStyleModal);
settingsTransferCloseBtn.addEventListener('click', closeSettingsTransferModal);
settingsCopyBtn.addEventListener('click', () => {
  copySettingsJson();
});
settingsSaveBtn.addEventListener('click', saveSettingsJson);
settingsLoadBtn.addEventListener('click', () => {
  loadSettingsJsonString(settingsImportInputEl?.value || '');
});
settingsUploadBtn.addEventListener('click', () => {
  settingsUploadInputEl?.click();
});
settingsUploadInputEl?.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    if (settingsImportInputEl) settingsImportInputEl.value = text;
    loadSettingsJsonString(text);
  } catch {
    setSettingsTransferStatus('Failed to read the uploaded JSON file.', 'error');
  } finally {
    event.target.value = '';
  }
});
specialSpawnCloseBtn.addEventListener('click', () => {
  commitSpecialSpawnChance();
  closeSpecialSpawnModal();
});
skillTileSettingsCloseBtn.addEventListener('click', () => {
  commitSkillTileSpawnInterval();
  closeSkillTileSettingsModal();
});
stuckPenaltyCloseBtn.addEventListener('click', () => {
  commitStuckPenalty();
  closeStuckPenaltyModal();
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
blockStyleModalEl.addEventListener('click', (event) => {
  if (event.target === blockStyleModalEl) closeBlockStyleModal();
});
settingsTransferModalEl.addEventListener('click', (event) => {
  if (event.target === settingsTransferModalEl) closeSettingsTransferModal();
});
roomStatusModalEl?.addEventListener('click', (event) => {
  if (event.target === roomStatusModalEl) closeRoomStatusModal();
});
difficultyModalEl.addEventListener('click', (event) => {
  if (event.target === difficultyModalEl) closeDifficultyModal();
});
difficultyCustomModalEl?.addEventListener('click', (event) => {
  if (event.target === difficultyCustomModalEl) closeCustomComputerModal();
});
stuckPenaltyModalEl.addEventListener('click', (event) => {
  if (event.target === stuckPenaltyModalEl) {
    commitStuckPenalty();
    closeStuckPenaltyModal();
  }
});
specialSpawnModalEl.addEventListener('click', (event) => {
  if (event.target === specialSpawnModalEl) {
    commitSpecialSpawnChance();
    closeSpecialSpawnModal();
  }
});
skillTileSettingsModalEl.addEventListener('click', (event) => {
  if (event.target === skillTileSettingsModalEl) {
    commitSkillTileSpawnInterval();
    closeSkillTileSettingsModal();
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
roomRetryBtn?.addEventListener('click', () => {
  state.roomWarning = '';
  renderSessionUi();
  connectRoomSession();
});
roomStatusCloseBtn?.addEventListener('click', closeRoomStatusModal);
continueLocalBtn?.addEventListener('click', () => {
  continueInLocalMode();
});
restartBtn.addEventListener('click', returnToPreparation);
window.addEventListener('resize', () => {
  refreshLayoutMetrics();
  renderRacks();
  renderSpecialSlot();
  renderDesiredPiecePreviews();
  renderFullscreenButton();
  if (!blockStyleModalEl.classList.contains('hidden')) renderBlockStyleModal();
  if (!settingsTransferModalEl.classList.contains('hidden')) refreshSettingsTransferExport();
  if (state.pieceEditorDraft) updateDesiredPieceModal();
  if (!piecePoolModalEl.classList.contains('hidden')) renderPiecePoolList();
});

document.addEventListener('fullscreenchange', () => {
  renderFullscreenButton();
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

function isTouchRangeControl(target) {
  return target instanceof Element && Boolean(target.closest('input[type="range"]'));
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !desiredPieceModalEl.classList.contains('hidden')) {
    closeDesiredPieceModal({ reopenPiecePool: Boolean(state.pieceEditorDraft?.returnToPiecePool) });
  } else if (event.key === 'Escape' && !blockStyleModalEl.classList.contains('hidden')) {
    closeBlockStyleModal();
  } else if (event.key === 'Escape' && !settingsTransferModalEl.classList.contains('hidden')) {
    closeSettingsTransferModal();
  } else if (event.key === 'Escape' && !roomStatusModalEl.classList.contains('hidden')) {
    closeRoomStatusModal();
  } else if (event.key === 'Escape' && !difficultyCustomModalEl.classList.contains('hidden')) {
    closeCustomComputerModal();
  } else if (event.key === 'Escape' && !difficultyModalEl.classList.contains('hidden')) {
    closeDifficultyModal();
  } else if (event.key === 'Escape' && !stuckPenaltyModalEl.classList.contains('hidden')) {
    commitStuckPenalty();
    closeStuckPenaltyModal();
  } else if (event.key === 'Escape' && !specialSpawnModalEl.classList.contains('hidden')) {
    commitSpecialSpawnChance();
    closeSpecialSpawnModal();
  } else if (event.key === 'Escape' && !skillTileSettingsModalEl.classList.contains('hidden')) {
    commitSkillTileSpawnInterval();
    closeSkillTileSettingsModal();
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
  if (isTouchRangeControl(event.target)) return;
  if (hasScrollableParent(event.target)) return;
  event.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', (event) => {
  event.preventDefault();
});

window.addEventListener('beforeunload', () => {
  if (state.roomClient) state.roomClient.disconnect().catch(() => {});
});

init();
