(function attachWebSocketTransport(globalScope) {
  const existing = globalScope.BlockblastMultiplayer || {};

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

  class WebSocketRoomTransport {
    constructor(options) {
      this.options = options;
      this.socket = null;
      this.emitter = createEmitter();
      this.connectReject = null;
      this.connectionSettled = false;
      this.connectTimeoutHandle = null;
      this.handleOpen = this.handleOpen.bind(this);
      this.handleError = this.handleError.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleMessage = this.handleMessage.bind(this);
    }

    connect() {
      return new Promise((resolve, reject) => {
        if (!this.options.wsUrl) {
          reject(new Error('A WebSocket URL is required for the WebSocket transport.'));
          return;
        }
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }
        this.disconnect();
        this.connectionSettled = false;
        this.connectReject = reject;
        this.socket = new WebSocket(this.options.wsUrl);
        this.socket.addEventListener('open', this.handleOpen);
        this.socket.addEventListener('error', this.handleError);
        this.socket.addEventListener('close', this.handleClose);
        this.socket.addEventListener('message', this.handleMessage);
        this.connectTimeoutHandle = globalScope.setTimeout(() => {
          if (this.connectionSettled) return;
          this.connectionSettled = true;
          this.disconnect();
          reject(new Error('WebSocket connection timed out.'));
        }, 8000);
        this.resolveConnect = () => {
          if (this.connectionSettled) return;
          this.connectionSettled = true;
          this.clearConnectTimeout();
          resolve();
        };
      });
    }

    disconnect() {
      this.clearConnectTimeout();
      this.connectionSettled = true;
      this.connectReject = null;
      if (this.socket) {
        this.socket.removeEventListener('open', this.handleOpen);
        this.socket.removeEventListener('error', this.handleError);
        this.socket.removeEventListener('close', this.handleClose);
        this.socket.removeEventListener('message', this.handleMessage);
      }
      if (this.socket && this.socket.readyState <= 1) this.socket.close();
      this.socket = null;
      return Promise.resolve();
    }

    send(eventName, payload) {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
      const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
      this.socket.send(JSON.stringify({
        type: eventName,
        payload: normalizedPayload,
      }));
    }

    on(eventName, handler) {
      this.emitter.on(eventName, handler);
    }

    off(eventName, handler) {
      this.emitter.off(eventName, handler);
    }

    clearConnectTimeout() {
      if (this.connectTimeoutHandle) globalScope.clearTimeout(this.connectTimeoutHandle);
      this.connectTimeoutHandle = null;
    }

    handleOpen() {
      if (typeof this.resolveConnect === 'function') this.resolveConnect();
      this.emitter.emit('transport_open', {
        wsUrl: this.options.wsUrl,
      });
    }

    handleError() {
      if (!this.connectionSettled && this.connectReject) {
        this.connectionSettled = true;
        this.clearConnectTimeout();
        this.connectReject(new Error('WebSocket connection failed.'));
      }
      this.emitter.emit('transport_error', {
        message: 'WebSocket connection failed.',
      });
    }

    handleClose(event) {
      const reason = event?.reason || 'The WebSocket connection closed.';
      if (!this.connectionSettled && this.connectReject) {
        this.connectionSettled = true;
        this.clearConnectTimeout();
        this.connectReject(new Error(reason));
      }
      this.emitter.emit('transport_disconnected', {
        code: event?.code || 1000,
        reason,
        wasClean: Boolean(event?.wasClean),
      });
      this.socket = null;
    }

    handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        const eventName = data?.eventName || data?.event || data?.type;
        if (!eventName) return;
        const payload = data?.payload ?? data?.data ?? data;
        this.emitter.emit(eventName, payload);
      } catch {
        // Ignore malformed server messages.
      }
    }
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    WebSocketRoomTransport,
  };
}(window));
