export interface WebSocketConfig {
    enabled: boolean;
    port: number;
  }
  
  export interface InstrumentOptions {
    logFetch?: boolean;
    logConsole?: boolean;
    logErrors?: boolean;
    websocket?: WebSocketConfig;
    fetchGroupInterval?: number;
  }
  
  export interface WebSocketWrapper {
    wsServer?: import('ws').WebSocketServer;
  }
  