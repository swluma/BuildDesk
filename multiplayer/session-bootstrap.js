(function attachBlockblastSession(globalScope) {
  const existing = globalScope.BlockblastMultiplayer || {};
  const GAME_ID = existing.GAME_ID || 'blockblast-duel';
  const ROOM_CODE_PATTERN = /[^A-Z0-9]/g;
  const NAME_SANITIZE_PATTERN = /[^\p{L}\p{N}\s._-]/gu;

  function sanitizeRoomCode(roomCode) {
    return String(roomCode || '')
      .toUpperCase()
      .replace(ROOM_CODE_PATTERN, '')
      .slice(0, 12);
  }

  function sanitizePlayerName(playerName) {
    return String(playerName || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(NAME_SANITIZE_PATTERN, '')
      .slice(0, 24);
  }

  function normalizeMode(rawMode) {
    const normalized = String(rawMode || 'local').trim().toLowerCase();
    return ['local', 'host', 'join'].includes(normalized) ? normalized : null;
  }

  function normalizeTransport(rawTransport) {
    const normalized = String(rawTransport || '').trim().toLowerCase();
    if (normalized === 'ws' || normalized === 'websocket') return 'websocket';
    if (normalized === 'local' || normalized === 'local-dev' || normalized === 'dev') return 'local-dev';
    return null;
  }

  function getStableClientId(mode, roomCode) {
    const storageKey = `blockblast_duel_client_${GAME_ID}_${mode}_${roomCode || 'local'}`;
    try {
      const existingClientId = globalScope.sessionStorage?.getItem(storageKey);
      if (existingClientId) return existingClientId;
      const nextClientId = `${mode}_${Math.random().toString(36).slice(2, 10)}`;
      globalScope.sessionStorage?.setItem(storageKey, nextClientId);
      return nextClientId;
    } catch {
      return `${mode}_${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  function createSession(overrides) {
    return {
      source: 'direct',
      gameId: GAME_ID,
      requestedMode: 'local',
      mode: 'local',
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
      clientId: getStableClientId('local', null),
      ...overrides,
    };
  }

  function resolveSession(search) {
    const params = new URLSearchParams(search || globalScope.location?.search || '');
    const source = params.get('hub') === '1' ? 'hub' : 'direct';
    const requestedMode = String(params.get('mode') || 'local').trim().toLowerCase();
    const normalizedMode = normalizeMode(requestedMode);
    const requestedTransport = normalizeTransport(params.get('transport'));
    const validationErrors = [];
    const playerName = sanitizePlayerName(params.get('name') || '');
    const roomCode = sanitizeRoomCode(params.get('room') || '');
    const wsUrl = String(params.get('ws') || '').trim() || null;

    if (!normalizedMode) validationErrors.push(`Unsupported mode "${requestedMode || '(empty)'}".`);
    if ((normalizedMode === 'host' || normalizedMode === 'join') && !roomCode) {
      validationErrors.push('Room code is required for host/join mode.');
    }
    if ((normalizedMode === 'host' || normalizedMode === 'join') && !playerName) {
      validationErrors.push('Player name is required for host/join mode.');
    }

    const effectiveMode = validationErrors.length > 0 ? 'local' : (normalizedMode || 'local');
    const isRoomPlay = effectiveMode === 'host' || effectiveMode === 'join';
    const clientId = getStableClientId(effectiveMode, roomCode || null);
    const transportKind = requestedTransport || 'local-dev';

    return createSession({
      source,
      requestedMode: normalizedMode || requestedMode || 'local',
      requestedTransport,
      mode: effectiveMode,
      playerName,
      roomCode: roomCode || null,
      wsUrl,
      isRoomPlay,
      isLocalPlay: !isRoomPlay,
      isHost: effectiveMode === 'host',
      isGuest: effectiveMode === 'join',
      isValid: validationErrors.length === 0,
      validationErrors,
      transportKind,
      supportsLocalDevFallback: true,
      clientId,
    });
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    createSession,
    resolveSession,
    sanitizeRoomCode,
    sanitizePlayerName,
  };
}(window));
