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
    const canStart = Boolean(session.isHost && phase === ROOM_PHASES.READY && remotePlayer);

    let statusCopy = 'Local single-device play is ready.';
    if (session.isHost) statusCopy = remotePlayer ? 'Opponent joined. Start when ready.' : 'Waiting for opponent...';
    if (session.isGuest) statusCopy = remotePlayer ? 'Connected. Waiting for the host to start.' : 'Joining room...';
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
      opponentConnected: Boolean(remotePlayer),
      localReady: Boolean(localPlayer?.ready),
      canStart,
      statusCopy,
      showContinueLocal: Boolean(session.isRoomPlay),
      showRetry: Boolean(session.isRoomPlay),
    };
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    buildRoomUiModel,
  };
}(window));
