export interface WebSocketConfig {
  enabled: boolean;
  port: number;
}

export interface HttpConfig {
  enabled: boolean;
  host: string;
  port: number;
  endpoint: string;
}

export interface InstrumentOptions {
  websocket?: WebSocketConfig;
  http?: HttpConfig;
  fetch?: typeof global.fetch | null;
}
