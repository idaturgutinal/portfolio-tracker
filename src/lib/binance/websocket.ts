"use client";

import type { WebSocketMessage, KlineInterval } from "./types";

type MessageHandler = (data: WebSocketMessage) => void;

export class BinanceWebSocket {
  private readonly baseUrl = "wss://stream.binance.com:9443";
  private ws: WebSocket | null = null;
  private streams: string[] = [];
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 3000;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  // ── Connect ──────────────────────────────────────────────────────────────

  connect(streams: string[]): void {
    this.streams = streams;
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    this.createConnection();
  }

  private createConnection(): void {
    if (this.ws) {
      this.cleanupConnection();
    }

    const streamPath = this.streams.join("/");
    const url = `${this.baseUrl}/stream?streams=${streamPath}`;

    console.log(`[BinanceWS] Connecting to ${url}`);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[BinanceWS] Connected");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const wrapper = JSON.parse(event.data as string) as {
          stream: string;
          data: WebSocketMessage;
        };
        this.emit(wrapper.stream, wrapper.data);
        this.emit("*", wrapper.data);
      } catch (err) {
        console.error("[BinanceWS] Parse error:", err);
      }
    };

    this.ws.onclose = () => {
      console.log("[BinanceWS] Disconnected");
      this.stopHeartbeat();

      if (!this.intentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `[BinanceWS] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`,
        );
        this.reconnectTimer = setTimeout(() => {
          this.createConnection();
        }, this.reconnectDelay);
      }
    };

    this.ws.onerror = (event: Event) => {
      console.error("[BinanceWS] Error:", event);
    };
  }

  // ── Heartbeat ────────────────────────────────────────────────────────────

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: "ping" }));
      }
    }, 30_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ── Event system ─────────────────────────────────────────────────────────

  onMessage(stream: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(stream)) {
      this.handlers.set(stream, new Set());
    }
    this.handlers.get(stream)!.add(handler);

    return () => {
      this.handlers.get(stream)?.delete(handler);
    };
  }

  private emit(stream: string, data: WebSocketMessage): void {
    this.handlers.get(stream)?.forEach((handler) => handler(data));
  }

  // ── Disconnect ───────────────────────────────────────────────────────────

  disconnect(): void {
    this.intentionalClose = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.handlers.clear();
    console.log("[BinanceWS] Disconnected (intentional)");
  }

  private cleanupConnection(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  // ── Stream subscription helpers ──────────────────────────────────────────

  subscribeToTicker(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@ticker`;
    this.addStream(stream);
  }

  subscribeToKline(symbol: string, interval: KlineInterval): void {
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    this.addStream(stream);
  }

  subscribeToDepth(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@depth20@100ms`;
    this.addStream(stream);
  }

  subscribeToTrades(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@trade`;
    this.addStream(stream);
  }

  subscribeToUserData(listenKey: string): void {
    this.addStream(listenKey);
  }

  private addStream(stream: string): void {
    if (!this.streams.includes(stream)) {
      this.streams.push(stream);

      // If already connected, reconnect with updated streams
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.createConnection();
      }
    }
  }

  // ── Status ───────────────────────────────────────────────────────────────

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get activeStreams(): string[] {
    return [...this.streams];
  }
}
