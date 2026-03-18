(function attachRoomClient(globalScope) {
  const existing = globalScope.BlockblastMultiplayer || {};
  const CLIENT_EVENTS = existing.CLIENT_EVENTS;
  const SERVER_EVENTS = existing.SERVER_EVENTS;
  const ROOM_PHASES = existing.ROOM_PHASES;
  const CONNECTION_STATUSES = existing.CONNECTION_STATUSES;
  const LocalDevRoomTransport = existing.LocalDevRoomTransport;
  const WebSocketRoomTransport = existing.WebSocketRoomTransport;

  function createEmitter() {
    const listeners = new Map();
    return {
      emit(eventName, payload) {
        const handlers = listeners.get(eventName);
        if (!handlers) return;
        handlers.forEach((handler) => handler(payload));
      },
      on(eventName, handler) {
        if (!listeners.has(eventName)) listeners.set(eventName, new Set());
        listeners.get(eventName).add(handler);
      },
      off(eventName, handler) {
        listeners.get(eventName)?.delete(handler);
      },
    };
  }

  function createInitialRoomState(session) {
    return {
      roomCode: session.roomCode,
      phase: session.isRoomPlay ? ROOM_PHASES.CONNECTING : ROOM_PHASES.IDLE,
      connectionStatus: session.isRoomPlay ? CONNECTION_STATUSES.CONNECTING : CONNECTION_STATUSES.OFFLINE,
      players: [],
      hostId: null,
      error: null,
      lastGameAction: null,
      lastSyncSnapshot: null,
      transportKind: session.transportKind || 'local-dev',
    };
  }

  function pickConnectionStatus(roomState) {
    if (roomState.error) return CONNECTION_STATUSES.ERROR;
    if (roomState.phase === ROOM_PHASES.PLAYING) return CONNECTION_STATUSES.PLAYING;
    if (roomState.phase === ROOM_PHASES.READY) return CONNECTION_STATUSES.READY;
    if (roomState.phase === ROOM_PHASES.WAITING) return CONNECTION_STATUSES.WAITING;
    if (roomState.phase === ROOM_PHASES.CONNECTING) return CONNECTION_STATUSES.CONNECTING;
    return CONNECTION_STATUSES.CONNECTED;
  }

  class RoomClient {
    constructor(session) {
      this.session = session;
      this.emitter = createEmitter();
      this.roomState = createInitialRoomState(session);
      this.heartbeatHandle = null;
      this.hasRequestedSync = false;
      this.transport = this.createTransport(session.transportKind);
    }

    createTransport(transportKind) {
      if (transportKind === 'websocket' && this.session.wsUrl) {
        return new WebSocketRoomTransport(this.session);
      }
      return new LocalDevRoomTransport(this.session);
    }

    async connect() {
      this.setRoomState({
        ...this.roomState,
        connectionStatus: CONNECTION_STATUSES.CONNECTING,
        phase: ROOM_PHASES.CONNECTING,
        error: null,
      });
      this.bindTransportEvents(this.transport);
      try {
        await this.transport.connect();
      } catch (error) {
        if (this.session.transportKind === 'websocket' && this.session.supportsLocalDevFallback) {
          this.transport = this.createTransport('local-dev');
          this.bindTransportEvents(this.transport);
          await this.transport.connect();
          this.session.transportKind = 'local-dev';
          this.emitter.emit('transportfallback', {
            transportKind: 'local-dev',
            reason: error?.message || 'WebSocket connection failed.',
          });
        } else {
          throw error;
        }
      }
      this.transport.send(CLIENT_EVENTS.JOIN_ROOM, {
        gameId: this.session.gameId,
        roomCode: this.session.roomCode,
        playerId: this.session.clientId,
        playerName: this.session.playerName,
        mode: this.session.mode,
        maxPlayers: this.session.maxPlayers,
      });
      this.startHeartbeat();
    }

    async disconnect({ notifyServer = true } = {}) {
      if (notifyServer && this.session.isRoomPlay) {
        this.transport.send(CLIENT_EVENTS.LEAVE_ROOM, {
          roomCode: this.session.roomCode,
          playerId: this.session.clientId,
        });
      }
      this.stopHeartbeat();
      await this.transport.disconnect();
      this.setRoomState({
        ...this.roomState,
        connectionStatus: CONNECTION_STATUSES.DISCONNECTED,
      });
    }

    on(eventName, handler) {
      this.emitter.on(eventName, handler);
    }

    off(eventName, handler) {
      this.emitter.off(eventName, handler);
    }

    getRoomState() {
      return {
        ...this.roomState,
        players: this.roomState.players.map((player) => ({ ...player })),
      };
    }

    setReady(ready) {
      this.transport.send(CLIENT_EVENTS.PLAYER_READY, {
        roomCode: this.session.roomCode,
        playerId: this.session.clientId,
        ready: Boolean(ready),
      });
    }

    startGame(config, syncSnapshot) {
      this.transport.send(CLIENT_EVENTS.START_GAME, {
        roomCode: this.session.roomCode,
        playerId: this.session.clientId,
        config,
        syncSnapshot,
      });
    }

    sendGameAction(action) {
      this.transport.send(CLIENT_EVENTS.GAME_ACTION, {
        roomCode: this.session.roomCode,
        playerId: this.session.clientId,
        action,
      });
    }

    requestSync() {
      this.transport.send(CLIENT_EVENTS.SYNC_REQUEST, {
        roomCode: this.session.roomCode,
        playerId: this.session.clientId,
      });
    }

    bindTransportEvents(transport) {
      transport.on('transport_open', () => {
        this.setRoomState({
          ...this.roomState,
          error: null,
          connectionStatus: CONNECTION_STATUSES.CONNECTED,
        });
      });
      transport.on('transport_disconnected', (payload) => {
        this.setRoomState({
          ...this.roomState,
          connectionStatus: CONNECTION_STATUSES.DISCONNECTED,
          phase: this.roomState.phase === ROOM_PHASES.PLAYING ? ROOM_PHASES.PLAYING : ROOM_PHASES.WAITING,
          error: payload?.reason
            ? { code: 'transport_disconnected', message: payload.reason }
            : null,
        });
        this.emitter.emit('transport_disconnected', payload);
      });
      transport.on('transport_error', (payload) => {
        this.setRoomState({
          ...this.roomState,
          connectionStatus: CONNECTION_STATUSES.ERROR,
          error: {
            code: 'transport_error',
            message: payload?.message || 'Room connection failed.',
          },
        });
        this.emitter.emit('transport_error', payload);
      });
      transport.on(SERVER_EVENTS.ROOM_JOINED, (payload) => {
        this.setRoomSnapshot(payload.room);
        this.maybeRequestSync(payload.room);
        this.emitter.emit(SERVER_EVENTS.ROOM_JOINED, payload);
      });
      transport.on(SERVER_EVENTS.ROOM_STATE, (payload) => {
        this.setRoomSnapshot(payload.room);
        this.maybeRequestSync(payload.room);
        this.emitter.emit(SERVER_EVENTS.ROOM_STATE, payload);
      });
      transport.on(SERVER_EVENTS.PLAYER_JOINED, (payload) => {
        this.setRoomSnapshot(payload.room);
        this.emitter.emit(SERVER_EVENTS.PLAYER_JOINED, payload);
      });
      transport.on(SERVER_EVENTS.PLAYER_LEFT, (payload) => {
        this.setRoomSnapshot(payload.room);
        this.emitter.emit(SERVER_EVENTS.PLAYER_LEFT, payload);
      });
      transport.on(SERVER_EVENTS.PLAYER_READY, (payload) => {
        this.setRoomSnapshot(payload.room);
        this.emitter.emit(SERVER_EVENTS.PLAYER_READY, payload);
      });
      transport.on(SERVER_EVENTS.GAME_STARTED, (payload) => {
        this.setRoomSnapshot(payload.room);
        this.hasRequestedSync = false;
        this.emitter.emit(SERVER_EVENTS.GAME_STARTED, payload);
      });
      transport.on(SERVER_EVENTS.GAME_ACTION, (payload) => {
        this.setRoomState({
          ...this.roomState,
          lastGameAction: payload.action,
        });
        this.emitter.emit(SERVER_EVENTS.GAME_ACTION, payload);
      });
      transport.on(SERVER_EVENTS.SYNC_STATE, (payload) => {
        this.setRoomSnapshot(payload.room);
        this.setRoomState({
          ...this.roomState,
          lastSyncSnapshot: payload.snapshot,
          lastGameAction: payload.lastGameAction || this.roomState.lastGameAction,
        });
        this.hasRequestedSync = false;
        this.emitter.emit(SERVER_EVENTS.SYNC_STATE, payload);
      });
      transport.on(SERVER_EVENTS.ERROR, (payload) => {
        this.setRoomState({
          ...this.roomState,
          error: payload,
          connectionStatus: CONNECTION_STATUSES.ERROR,
        });
        this.emitter.emit(SERVER_EVENTS.ERROR, payload);
      });
      transport.on(SERVER_EVENTS.ROOM_CLOSED, (payload) => {
        this.setRoomState({
          ...this.roomState,
          phase: ROOM_PHASES.ENDED,
          error: {
            code: payload.reason || 'room_closed',
            message: 'The room was closed.',
          },
          connectionStatus: CONNECTION_STATUSES.DISCONNECTED,
        });
        this.emitter.emit(SERVER_EVENTS.ROOM_CLOSED, payload);
      });
    }

    maybeRequestSync(room) {
      if (!this.session.isGuest) return;
      if (this.hasRequestedSync) return;
      if (room?.phase !== ROOM_PHASES.PLAYING) return;
      this.hasRequestedSync = true;
      this.requestSync();
    }

    setRoomSnapshot(room) {
      this.setRoomState({
        ...this.roomState,
        ...room,
        error: null,
        connectionStatus: pickConnectionStatus({
          ...this.roomState,
          ...room,
          error: null,
        }),
      });
    }

    setRoomState(nextState) {
      this.roomState = nextState;
      this.emitter.emit('statechange', this.getRoomState());
    }

    startHeartbeat() {
      this.stopHeartbeat();
      this.heartbeatHandle = globalScope.setInterval(() => {
        this.transport.send(CLIENT_EVENTS.HEARTBEAT, {
          roomCode: this.session.roomCode,
          playerId: this.session.clientId,
        });
      }, 4000);
    }

    stopHeartbeat() {
      if (this.heartbeatHandle) globalScope.clearInterval(this.heartbeatHandle);
      this.heartbeatHandle = null;
    }
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    RoomClient,
    createInitialRoomState,
  };
}(window));
