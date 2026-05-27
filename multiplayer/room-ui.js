(function attachRoomUi(globalScope) {
  const existing = globalScope.BlockblastMultiplayer || {};
  const ROOM_PHASES = existing.ROOM_PHASES || {};
  const CONNECTION_STATUSES = existing.CONNECTION_STATUSES || {};

  function buildRoomUiModel(session, roomState) {
    const players = roomState?.players || [];
    const localPlayer = players.find((player) => player.id === session.clientId) || null;
    const remotePlayer = players.find((player) => player.id !== session.clientId) || null;
    const phase = roomState?.phase || (session.isRoomPlay ? ROOM_PHASES.CONNECTING : ROOM_PHASES.IDLE);
    const connectionStatus = roomState?.connectionStatus || (session.isRoomPlay ? CONNECTION_STATUSES.CONNECTING : CONNECTION_STATUSES.OFFLINE);
    const localReady = Boolean(localPlayer?.ready);
    const remoteReady = Boolean(remotePlayer?.ready);
    const remoteConnected = remotePlayer?.connected !== false;
    const canStart = Boolean(session.isHost && remotePlayer && remoteConnected && remoteReady);

    let statusCopy = 'Local single-device play is ready.';
    if (session.isRoomPlay && session.usingLocalDevRoomTransport) {
      statusCopy = 'Local dev room mode is active.';
    }
    if (session.isHost) statusCopy = remotePlayer
      ? (remoteReady ? 'Guest is ready. Start when ready.' : 'Guest joined. Waiting for readiness.')
      : 'Waiting for opponent...';
    if (session.isGuest) statusCopy = remotePlayer
      ? (localReady ? 'You are ready. Waiting for the host to start.' : 'Toggle ready when you are set.')
      : 'Joining room...';
    if (connectionStatus === CONNECTION_STATUSES.CONNECTING) statusCopy = session.isHost
      ? 'Connecting to room server...'
      : 'Joining room...';
    if (connectionStatus === CONNECTION_STATUSES.DISCONNECTED) statusCopy = 'Disconnected from the room. Retry or continue locally.';
    if (connectionStatus === CONNECTION_STATUSES.ERROR) statusCopy = 'Room connection failed. Retry or continue locally.';
    if (roomState?.error?.message) statusCopy = roomState.error.message;
    if (!session.isRoomPlay && !session.isValid && session.validationErrors.length) {
      statusCopy = `${session.validationErrors.join(' ')} Running in local mode instead.`;
    }

    return {
      modeLabel: session.isRoomPlay ? `${session.mode.toUpperCase()} MODE` : 'LOCAL MODE',
      phaseLabel: String(phase || ROOM_PHASES.IDLE).toUpperCase(),
      connectionLabel: String(connectionStatus || CONNECTION_STATUSES.OFFLINE).toUpperCase(),
      playerName: session.playerName || 'Local Player',
      roomCode: session.roomCode || 'LOCAL',
      opponentName: remotePlayer?.name || 'Waiting...',
      opponentConnected: Boolean(remotePlayer && remoteConnected),
      localReady,
      remoteReady,
      canStart,
      statusCopy,
      showContinueLocal: false,
      showRetry: false,
    };
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    buildRoomUiModel,
  };
}(window));
