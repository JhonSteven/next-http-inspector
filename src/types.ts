export interface WebSocketConfig {
    enabled: boolean;
    port: number;
  }
  
  export interface UIConfig {
    enabled: boolean;
    port: number;
    path: string;
  }
  
  export interface InstrumentOptions {
    logFetch?: boolean;
    logConsole?: boolean;
    logErrors?: boolean;
    websocket?: WebSocketConfig;
    ui?: UIConfig;
    fetchGroupInterval?: number;
  }
  
  export interface WebSocketWrapper {
    wsServer?: import('ws').WebSocketServer;
    uiServer?: import('http').Server;
  }
  