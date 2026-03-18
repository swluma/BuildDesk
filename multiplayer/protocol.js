(function attachBlockblastProtocol(globalScope) {
  const existing = globalScope.BlockblastMultiplayer || {};

  const GAME_ID = 'blockblast-duel';
  const CLIENT_EVENTS = Object.freeze({
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    PLAYER_READY: 'player_ready',
    START_GAME: 'start_game',
    GAME_ACTION: 'game_action',
    SYNC_REQUEST: 'sync_request',
    HEARTBEAT: 'heartbeat',
  });

  const SERVER_EVENTS = Object.freeze({
    ROOM_JOINED: 'room_joined',
    ROOM_STATE: 'room_state',
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left',
    PLAYER_READY: 'player_ready',
    GAME_STARTED: 'game_started',
    GAME_ACTION: 'game_action',
    SYNC_STATE: 'sync_state',
    ERROR: 'error',
    ROOM_CLOSED: 'room_closed',
  });

  const ROOM_PHASES = Object.freeze({
    IDLE: 'idle',
    CONNECTING: 'connecting',
    WAITING: 'waiting',
    READY: 'ready',
    PLAYING: 'playing',
    ENDED: 'ended',
  });

  const CONNECTION_STATUSES = Object.freeze({
    OFFLINE: 'offline',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    WAITING: 'waiting',
    READY: 'ready',
    PLAYING: 'playing',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
  });

  const GAME_ACTIONS = Object.freeze({
    PLACE_PIECE: 'place_piece',
    LOCK_PIECE: 'lock_piece',
    CLEAR_LINES: 'clear_lines',
    GAIN_SCORE: 'gain_score',
    USE_SKILL: 'use_skill',
    APPLY_ATTACK: 'apply_attack',
    APPLY_GARBAGE: 'apply_garbage',
    NEXT_PIECE_STATE: 'next_piece_state',
    READY_FOR_ROUND: 'ready_for_round',
    END_ROUND: 'end_round',
    SYNC_SNAPSHOT: 'sync_snapshot',
  });

  function createSerializableAction(type, payload) {
    return {
      type,
      payload: payload || {},
      timestamp: Date.now(),
    };
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    GAME_ID,
    CLIENT_EVENTS,
    SERVER_EVENTS,
    ROOM_PHASES,
    CONNECTION_STATUSES,
    GAME_ACTIONS,
    createSerializableAction,
  };
}(window));
