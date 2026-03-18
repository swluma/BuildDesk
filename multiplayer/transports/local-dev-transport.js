(function attachLocalDevTransport(globalScope) {
  const existing = globalScope.BlockblastMultiplayer || {};
  const CLIENT_EVENTS = existing.CLIENT_EVENTS;
  const SERVER_EVENTS = existing.SERVER_EVENTS;
  const ROOM_PHASES = existing.ROOM_PHASES;

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
      clear() {
        listeners.clear();
      },
    };
  }

  function createEmptyRoomRecord({ gameId, roomCode }) {
    return {
      version: 1,
      gameId,
      roomCode,
      hostId: null,
      phase: ROOM_PHASES.IDLE,
      players: [],
      maxPlayers: 2,
      closed: false,
      lastGameAction: null,
      lastSyncSnapshot: null,
      startedAt: null,
      updatedAt: Date.now(),
    };
  }

  class LocalDevRoomTransport {
    constructor(options) {
      this.options = options;
      this.emitter = createEmitter();
      this.channel = null;
      this.connected = false;
      this.storageKey = `blockblast_duel_dev_room_${options.gameId}_${options.roomCode}`;
      this.channelName = `blockblast_duel_dev_room_${options.gameId}_${options.roomCode}`;
      this.handleBroadcastMessage = this.handleBroadcastMessage.bind(this);
      this.handleStorageEvent = this.handleStorageEvent.bind(this);
    }

    connect() {
      if (this.connected) return Promise.resolve();
      if (!globalScope.localStorage) {
        return Promise.reject(new Error('Local dev transport requires localStorage.'));
      }
      if (globalScope.BroadcastChannel) {
        this.channel = new globalScope.BroadcastChannel(this.channelName);
        this.channel.addEventListener('message', this.handleBroadcastMessage);
      }
      globalScope.addEventListener('storage', this.handleStorageEvent);
      this.connected = true;
      return Promise.resolve();
    }

    disconnect() {
      if (!this.connected) return Promise.resolve();
      this.connected = false;
      globalScope.removeEventListener('storage', this.handleStorageEvent);
      if (this.channel) {
        this.channel.removeEventListener('message', this.handleBroadcastMessage);
        this.channel.close();
      }
      this.channel = null;
      this.emitter.clear();
      return Promise.resolve();
    }

    send(eventName, payload) {
      const resultEvents = this.reduceClientEvent(eventName, payload || {});
      resultEvents.forEach((serverEvent) => this.dispatchServerEvent(serverEvent, { includeLocal: true }));
    }

    on(eventName, handler) {
      this.emitter.on(eventName, handler);
    }

    off(eventName, handler) {
      this.emitter.off(eventName, handler);
    }

    emit(eventName, payload) {
      this.emitter.emit(eventName, payload);
    }

    handleBroadcastMessage(event) {
      const message = event.data;
      if (!message || message.transport !== 'local-dev-room') return;
      if (message.sourceClientId === this.options.clientId) return;
      this.processServerMessage(message);
    }

    handleStorageEvent(event) {
      if (event.key !== this.storageKey || !event.newValue) return;
      try {
        const record = JSON.parse(event.newValue);
        this.emit(SERVER_EVENTS.ROOM_STATE, { room: this.toRoomState(record) });
      } catch {
        // Ignore malformed external room updates.
      }
    }

    processServerMessage(message) {
      if (message.targetId && message.targetId !== this.options.clientId) return;
      this.emit(message.eventName, message.payload);
    }

    dispatchServerEvent(serverEvent, { includeLocal = false } = {}) {
      const message = {
        transport: 'local-dev-room',
        sourceClientId: this.options.clientId,
        eventName: serverEvent.eventName,
        payload: serverEvent.payload,
        targetId: serverEvent.targetId || null,
      };
      if (includeLocal && (!message.targetId || message.targetId === this.options.clientId)) {
        this.emit(serverEvent.eventName, serverEvent.payload);
      }
      this.channel?.postMessage(message);
    }

    loadRoomRecord() {
      try {
        const stored = globalScope.localStorage.getItem(this.storageKey);
        if (!stored) return null;
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }

    saveRoomRecord(record) {
      record.updatedAt = Date.now();
      globalScope.localStorage.setItem(this.storageKey, JSON.stringify(record));
    }

    clearRoomRecord() {
      globalScope.localStorage.removeItem(this.storageKey);
    }

    toRoomState(record) {
      return {
        roomCode: record.roomCode,
        phase: record.phase,
        players: record.players.map((player) => ({ ...player })),
        hostId: record.hostId,
        maxPlayers: record.maxPlayers,
        startedAt: record.startedAt,
        lastGameAction: record.lastGameAction,
        lastSyncSnapshot: record.lastSyncSnapshot,
        closed: Boolean(record.closed),
      };
    }

    reduceClientEvent(eventName, payload) {
      const roomCode = this.options.roomCode;
      const gameId = this.options.gameId;
      const currentClientId = this.options.clientId;
      const events = [];
      let record = this.loadRoomRecord() || createEmptyRoomRecord({ gameId, roomCode });

      const emitRoomState = () => {
        events.push({
          eventName: SERVER_EVENTS.ROOM_STATE,
          payload: { room: this.toRoomState(record) },
        });
      };

      const emitError = (code, message, targetId) => {
        events.push({
          eventName: SERVER_EVENTS.ERROR,
          targetId,
          payload: { code, message, roomCode },
        });
      };

      const findPlayerIndex = () => record.players.findIndex((player) => player.id === payload.playerId);

      if (eventName === CLIENT_EVENTS.JOIN_ROOM) {
        if (record.gameId && record.gameId !== payload.gameId) {
          emitError('wrong_game_type', 'This room belongs to a different game.', currentClientId);
          return events;
        }

        const existingPlayerIndex = findPlayerIndex();
        if (payload.mode === 'host') {
          if (record.hostId && record.hostId !== payload.playerId && record.players.length > 0) {
            emitError('room_in_use', 'A host is already using this room.', currentClientId);
            return events;
          }
          record.hostId = payload.playerId;
        } else if (!record.hostId) {
          emitError('room_not_found', 'The room is not available yet. Open the host URL first.', currentClientId);
          return events;
        }

        if (existingPlayerIndex === -1 && record.players.length >= (payload.maxPlayers || 2)) {
          emitError('room_full', 'This room already has the maximum number of players.', currentClientId);
          return events;
        }

        const nextPlayer = {
          id: payload.playerId,
          name: payload.playerName,
          isHost: payload.mode === 'host',
          ready: payload.mode === 'host',
          connected: true,
          joinedAt: Date.now(),
          lastSeenAt: Date.now(),
        };

        if (existingPlayerIndex >= 0) record.players[existingPlayerIndex] = nextPlayer;
        else record.players.push(nextPlayer);

        record.phase = record.players.length >= 2 ? ROOM_PHASES.READY : ROOM_PHASES.WAITING;
        record.closed = false;
        this.saveRoomRecord(record);

        events.push({
          eventName: SERVER_EVENTS.ROOM_JOINED,
          targetId: currentClientId,
          payload: {
            room: this.toRoomState(record),
            playerId: payload.playerId,
          },
        });
        if (existingPlayerIndex === -1) {
          events.push({
            eventName: SERVER_EVENTS.PLAYER_JOINED,
            payload: {
              player: nextPlayer,
              room: this.toRoomState(record),
            },
          });
        }
        emitRoomState();
        return events;
      }

      if (!record.players.length && eventName !== CLIENT_EVENTS.LEAVE_ROOM) {
        emitError('room_closed', 'The room is no longer available.', currentClientId);
        return events;
      }

      if (eventName === CLIENT_EVENTS.LEAVE_ROOM) {
        const previousPlayers = record.players;
        record.players = record.players.filter((player) => player.id !== payload.playerId);
        const leftPlayer = previousPlayers.find((player) => player.id === payload.playerId);
        if (!record.players.length || payload.playerId === record.hostId) {
          const closedSnapshot = this.toRoomState(record);
          this.clearRoomRecord();
          events.push({
            eventName: SERVER_EVENTS.ROOM_CLOSED,
            payload: {
              reason: payload.playerId === record.hostId ? 'host_left' : 'room_empty',
              room: closedSnapshot,
            },
          });
          return events;
        }
        record.phase = ROOM_PHASES.WAITING;
        this.saveRoomRecord(record);
        if (leftPlayer) {
          events.push({
            eventName: SERVER_EVENTS.PLAYER_LEFT,
            payload: {
              player: leftPlayer,
              room: this.toRoomState(record),
            },
          });
        }
        emitRoomState();
        return events;
      }

      if (eventName === CLIENT_EVENTS.PLAYER_READY) {
        const playerIndex = findPlayerIndex();
        if (playerIndex === -1) {
          emitError('unknown_player', 'The player is not part of this room.', currentClientId);
          return events;
        }
        record.players[playerIndex].ready = Boolean(payload.ready);
        record.players[playerIndex].lastSeenAt = Date.now();
        const everyoneReady = record.players.length === record.maxPlayers && record.players.every((player) => player.ready);
        record.phase = everyoneReady ? ROOM_PHASES.READY : ROOM_PHASES.WAITING;
        this.saveRoomRecord(record);
        events.push({
          eventName: SERVER_EVENTS.PLAYER_READY,
          payload: {
            player: { ...record.players[playerIndex] },
            room: this.toRoomState(record),
          },
        });
        emitRoomState();
        return events;
      }

      if (eventName === CLIENT_EVENTS.START_GAME) {
        if (payload.playerId !== record.hostId) {
          emitError('not_host', 'Only the host can start the game.', currentClientId);
          return events;
        }
        if (record.players.length < record.maxPlayers) {
          emitError('waiting_for_players', 'Waiting for the opponent to join.', currentClientId);
          return events;
        }
        record.phase = ROOM_PHASES.PLAYING;
        record.startedAt = Date.now();
        record.lastSyncSnapshot = payload.syncSnapshot || null;
        this.saveRoomRecord(record);
        events.push({
          eventName: SERVER_EVENTS.GAME_STARTED,
          payload: {
            room: this.toRoomState(record),
            startedBy: payload.playerId,
            config: payload.config || null,
            syncSnapshot: payload.syncSnapshot || null,
          },
        });
        emitRoomState();
        return events;
      }

      if (eventName === CLIENT_EVENTS.GAME_ACTION) {
        record.lastGameAction = payload.action || null;
        if (payload.action?.type === existing.GAME_ACTIONS?.SYNC_SNAPSHOT) {
          record.lastSyncSnapshot = payload.action.payload || null;
        }
        this.saveRoomRecord(record);
        events.push({
          eventName: SERVER_EVENTS.GAME_ACTION,
          payload: {
            roomCode,
            playerId: payload.playerId,
            action: payload.action,
          },
        });
        return events;
      }

      if (eventName === CLIENT_EVENTS.SYNC_REQUEST) {
        events.push({
          eventName: SERVER_EVENTS.SYNC_STATE,
          targetId: currentClientId,
          payload: {
            room: this.toRoomState(record),
            snapshot: record.lastSyncSnapshot,
            lastGameAction: record.lastGameAction,
          },
        });
        return events;
      }

      if (eventName === CLIENT_EVENTS.HEARTBEAT) {
        const playerIndex = findPlayerIndex();
        if (playerIndex >= 0) {
          record.players[playerIndex].connected = true;
          record.players[playerIndex].lastSeenAt = Date.now();
          this.saveRoomRecord(record);
          emitRoomState();
        }
        return events;
      }

      emitError('unsupported_mode', `Unsupported event: ${eventName}`, currentClientId);
      return events;
    }
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    LocalDevRoomTransport,
  };
}(window));
