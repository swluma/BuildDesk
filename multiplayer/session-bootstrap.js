(function attachBlockblastSession(globalScope) {
  const existing = globalScope.BlockblastMultiplayer || {};
  const GAME_ID = existing.GAME_ID || 'blockblast-duel';
  const ROOM_CODE_PATTERN = /[^A-Z0-9]/g;
  const NAME_SANITIZE_PATTERN = /[^\p{L}\p{N}\s._-]/gu;
  const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

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

  function normalizeWsUrl(rawWsUrl) {
    const trimmed = String(rawWsUrl || '').trim();
    if (!trimmed) return { value: null, error: null };
    try {
      const normalized = new URL(trimmed, globalScope.location?.href || undefined);
      if (normalized.protocol !== 'ws:' && normalized.protocol !== 'wss:') {
        return { value: null, error: 'WebSocket URL must use ws:// or wss://.' };
      }
      return { value: normalized.toString(), error: null };
    } catch {
      return { value: null, error: 'WebSocket URL is invalid.' };
    }
  }

  function isLocalDevHost() {
    const hostname = String(globalScope.location?.hostname || '').trim().toLowerCase();
    return LOCAL_HOSTNAMES.has(hostname);
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
      requestedTransport: null,
      supportsLocalDevFallback: false,
      usingLocalDevRoomTransport: false,
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
    const wsResult = normalizeWsUrl(params.get('ws') || '');
    const wsUrl = wsResult.value;
    const rawWsParam = String(params.get('ws') || '').trim();
    const wantsRoomMode = normalizedMode === 'host' || normalizedMode === 'join';
    const explicitLocalDev = requestedTransport === 'local-dev';
    const implicitLocalDev = wantsRoomMode && !rawWsParam && !requestedTransport && isLocalDevHost();

    if (!normalizedMode) validationErrors.push(`Unsupported mode "${requestedMode || '(empty)'}".`);
    if (wantsRoomMode && !roomCode) {
      validationErrors.push('Room code is required for host/join mode.');
    }
    if (wantsRoomMode && !playerName) {
      validationErrors.push('Player name is required for host/join mode.');
    }
    if (wantsRoomMode && wsResult.error) {
      validationErrors.push(wsResult.error);
    }

    let transportKind = 'local-dev';
    if (wantsRoomMode) {
      if (explicitLocalDev || implicitLocalDev) {
        transportKind = 'local-dev';
      } else if (wsUrl) {
        transportKind = 'websocket';
      } else {
        validationErrors.push('WebSocket URL is required for host/join room mode.');
      }
    }

    const effectiveMode = validationErrors.length > 0 ? 'local' : (normalizedMode || 'local');
    const isRoomPlay = effectiveMode === 'host' || effectiveMode === 'join';
    const clientId = getStableClientId(effectiveMode, roomCode || null);

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
      supportsLocalDevFallback: Boolean(implicitLocalDev || explicitLocalDev),
      usingLocalDevRoomTransport: isRoomPlay && transportKind === 'local-dev',
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
