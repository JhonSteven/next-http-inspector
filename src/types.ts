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
    logFetch?: boolean;
    logConsole?: boolean;
    logErrors?: boolean;
    websocket?: WebSocketConfig;
    http?: HttpConfig;
    fetchGroupInterval?: number;
  }
  
  export interface WebSocketWrapper {
    wsServer?: import('ws').WebSocketServer;
  }
  