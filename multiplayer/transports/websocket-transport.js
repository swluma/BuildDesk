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
    }

    connect() {
      return new Promise((resolve, reject) => {
        if (!this.options.wsUrl) {
          reject(new Error('A WebSocket URL is required for the WebSocket transport.'));
          return;
        }
        this.socket = new WebSocket(this.options.wsUrl);
        this.socket.addEventListener('open', () => resolve());
        this.socket.addEventListener('error', () => reject(new Error('WebSocket connection failed.')));
        this.socket.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data?.eventName) return;
            this.emitter.emit(data.eventName, data.payload);
          } catch {
            // Ignore malformed server messages.
          }
        });
      });
    }

    disconnect() {
      if (this.socket && this.socket.readyState <= 1) this.socket.close();
      this.socket = null;
      return Promise.resolve();
    }

    send(eventName, payload) {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
      this.socket.send(JSON.stringify({ eventName, payload }));
    }

    on(eventName, handler) {
      this.emitter.on(eventName, handler);
    }

    off(eventName, handler) {
      this.emitter.off(eventName, handler);
    }
  }

  globalScope.BlockblastMultiplayer = {
    ...existing,
    WebSocketRoomTransport,
  };
}(window));
