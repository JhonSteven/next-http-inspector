// Only import Node.js modules when running in Node.js environment
let WebSocket: any;
let http: any;

// Check if we're running in Node.js environment
const isNodeEnvironment = typeof process !== 'undefined' && process.versions && process.versions.node;

if (isNodeEnvironment) {
  try {
    // Import WebSocket library directly
    WebSocket = require('ws').WebSocket;
    console.log('✅ Using WebSocket library for external server connection');
  } catch (error) {
    console.warn('⚠️ WebSocket library not available:', error instanceof Error ? error.message : String(error));
  }
  
  try {
    // Import HTTP library for fallback
    http = require('http');
    console.log('✅ Using HTTP library for fallback connection');
  } catch (error) {
    console.warn('⚠️ HTTP library not available:', error instanceof Error ? error.message : String(error));
  }
} else {
  // In browser environment, provide a mock WebSocket to prevent errors
  console.log('🌐 Running in browser environment - WebSocket functionality disabled');
}

import { interceptFetch, getInterceptorStatus, resetFetchInterceptor } from './interceptors/fetchInterceptor';
import { interceptConsole } from './interceptors/consoleInterceptor';
import { interceptErrors } from './interceptors/errorInterceptor';
import type { InstrumentOptions, WebSocketWrapper } from './types';

// Type declaration for debugging functions
declare global {
  var __nextHttpInspectorDebug: {
    getInterceptorStatus: () => { isInstalled: boolean; hasOriginalFetch: boolean; currentFetchType: string };
    resetFetchInterceptor: () => void;
    getHotReloadCount: () => number;
    getWsConnection: () => any;
    getWsConfig: () => { host: string; port: number } | null;
    getHttpConfig: () => { host: string; port: number; endpoint: string } | null;
  } | undefined;
}

// Variables globales para manejar el estado
let isInitialized = false;
let hotReloadCount = 0;
let lastInitializationTime = 0;
let connectionMonitorInterval: NodeJS.Timeout | null = null;
let wsConnection: any = null;
let wsConfig: { host: string; port: number } | null = null;
let httpConfig: { host: string; port: number; endpoint: string } | null = null;
let lastHttpErrorTime = 0;
let httpErrorCount = 0;

// Función para enviar datos por HTTP como fallback
function sendViaHttp(data: any) {
  if (!http || !httpConfig) {
    console.log('⚠️ [HTTP] HTTP fallback not available:', data.type);
    return;
  }

  const postData = JSON.stringify(data);
  const options = {
    hostname: httpConfig.host,
    port: httpConfig.port,
    path: httpConfig.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res: any) => {
    console.log(`📡 [HTTP] Response status: ${res.statusCode}`);
    res.on('data', (chunk: any) => {
      console.log(`📡 [HTTP] Response: ${chunk}`);
    });
    
    // Reset error count on successful request
    httpErrorCount = 0;
    lastHttpErrorTime = 0;
  });

  req.on('error', (error: any) => {
    const currentTime = Date.now();
    const timeSinceLastError = currentTime - lastHttpErrorTime;
    
    // Only log error if it's been more than 5 seconds since last error, or if it's the first few errors
    if (timeSinceLastError > 5000 || httpErrorCount < 3) {
      console.log(`❌ [HTTP] Request error:`, error.message);
      lastHttpErrorTime = currentTime;
      httpErrorCount++;
    }
    
    // If we've had many errors, log a summary every 30 seconds
    if (httpErrorCount > 0 && httpErrorCount % 10 === 0 && timeSinceLastError > 30000) {
      console.log(`⚠️ [HTTP] Multiple connection errors (${httpErrorCount} total). Server may be down.`);
    }
  });

  req.write(postData);
  req.end();
}

// Función para enviar datos al servidor externo (WebSocket con fallback HTTP)
function sendToExternalServer(data: any) {
  // Check if we're in browser environment
  if (!isNodeEnvironment) {
    console.log('🌐 [BROWSER] WebSocket functionality not available in browser environment:', data.type);
    return;
  }
  
  // Intentar WebSocket primero si está disponible y configurado
  if (WebSocket && wsConfig) {
    // Crear conexión si no existe
    if (!wsConnection) {
      try {
        wsConnection = new WebSocket(`ws://${wsConfig.host}:${wsConfig.port}`);
        
        wsConnection.on('open', () => {
          console.log(`📡 [WEBSOCKET] Connected to external server at ws://${wsConfig!.host}:${wsConfig!.port}`);
          // Enviar el dato pendiente
          wsConnection.send(JSON.stringify(data));
        });
        
        wsConnection.on('error', (error: any) => {
          console.log(`❌ [WEBSOCKET] Connection error, falling back to HTTP:`, error.message);
          sendViaHttp(data);
        });
        
        wsConnection.on('close', () => {
          console.log('🔌 [WEBSOCKET] Connection closed');
          wsConnection = null;
        });
        
      } catch (error) {
        console.log('❌ [WEBSOCKET] Failed to create connection, falling back to HTTP:', error);
        sendViaHttp(data);
      }
    } else if (wsConnection.readyState === WebSocket.OPEN) {
      // Enviar dato directamente si la conexión está abierta
      try {
        wsConnection.send(JSON.stringify(data));
      } catch (error) {
        console.log('❌ [WEBSOCKET] Failed to send data, falling back to HTTP:', error);
        sendViaHttp(data);
      }
    } else if (wsConnection.readyState === WebSocket.CONNECTING) {
      // Esperar a que la conexión se abra
      console.log('⏳ [WEBSOCKET] Connection in progress, queuing data...');
      wsConnection.once('open', () => {
        wsConnection.send(JSON.stringify(data));
      });
    } else {
      // Reconectar si la conexión está cerrada
      console.log('🔄 [WEBSOCKET] Connection closed, reconnecting...');
      wsConnection = null;
      sendToExternalServer(data);
    }
  } else {
    // WebSocket no disponible, usar HTTP directamente
    console.log('⚠️ [WEBSOCKET] WebSocket not available, using HTTP fallback:', data.type);
    sendViaHttp(data);
  }
}

// Función para monitorear el estado de las conexiones WebSocket
function startConnectionMonitor() {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
  }
  
  connectionMonitorInterval = setInterval(() => {
    if (wsConnection && wsConfig) {
      const isConnected = wsConnection.readyState === WebSocket.OPEN;
      
      console.log(`📊 [CONNECTION_MONITOR] External WebSocket status - Connected: ${isConnected}, Server: ws://${wsConfig.host}:${wsConfig.port}`);
      
      if (!isConnected) {
        console.log('⚠️ [CONNECTION_MONITOR] Not connected to external WebSocket server - will reconnect on next data send');
      }
    } else {
      console.log('❌ [CONNECTION_MONITOR] No WebSocket connection configured');
    }
  }, 10000); // Check every 10 seconds
}

// Función para detener el monitor de conexiones
function stopConnectionMonitor() {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
    connectionMonitorInterval = null;
    console.log('🛑 [CONNECTION_MONITOR] Stopped connection monitoring');
  }
}

export function setupNextInstrument({
  logFetch = true,
  logConsole = true,
  logErrors = true,
  websocket = { enabled: true, port: 8080 },
  http = { enabled: true, host: 'localhost', port: 3001, endpoint: '/api/logs' },
  fetchGroupInterval = 20000,
}: InstrumentOptions = {}): void {
  // Check if we're in a browser environment first
  if (!isNodeEnvironment) {
    console.warn('⚠️ Next Http Server Inspector requires Node.js environment. Skipping initialization in browser.');
    return;
  }

  // Check if Node.js modules are available
  if (!WebSocket) {
    console.warn('⚠️ WebSocket library not available. Skipping initialization.');
    return;
  }

  // ⚠️ Development environment check (only in Node.js)
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';
  const isDevelopment = !isProduction; // Default to development unless explicitly production

  console.log(`🔍 [ENV] NODE_ENV: ${nodeEnv}, isProduction: ${isProduction}, isDevelopment: ${isDevelopment}`);

  if (!isDevelopment) {
    console.warn('⚠️ Next Http Server Inspector is designed for development only. Skipping initialization in production.');
    return;
  }

  const currentTime = Date.now();
  const timeSinceLastInit = currentTime - lastInitializationTime;
  
  // Detectar hot reload si se llama muy pronto después de la última inicialización
  if (isInitialized && timeSinceLastInit < 5000) {
    hotReloadCount++;
    console.log(`🔥 [HOT_RELOAD] Detected hot reload #${hotReloadCount} (${timeSinceLastInit}ms since last init)`);
  }

  // Si ya está inicializado, no hacer nada
  if (isInitialized) {
    console.log('🔄 [INIT] Next Http Server Inspector already initialized, skipping...');
    return;
  }

  console.log('🚀 Initializing Next Http Server Inspector (Interceptors Only)...');
  
  // Configurar conexión WebSocket externa
  if (websocket.enabled) {
    wsConfig = {
      host: 'localhost',
      port: websocket.port
    };
    console.log(`📡 [INIT] WebSocket connection configured for ws://${wsConfig.host}:${wsConfig.port}`);
  } else {
    console.log('📡 [INIT] WebSocket disabled by configuration');
  }

  // Configurar conexión HTTP como fallback
  if (http.enabled) {
    httpConfig = {
      host: http.host,
      port: http.port,
      endpoint: http.endpoint
    };
    console.log(`📡 [INIT] HTTP fallback configured for http://${httpConfig.host}:${httpConfig.port}${httpConfig.endpoint}`);
  } else {
    console.log('📡 [INIT] HTTP fallback disabled by configuration');
  }

  // Configurar interceptores
  if (logFetch) {
    console.log('🔧 [INIT] Setting up fetch interceptor');
    interceptFetch(sendToExternalServer, fetchGroupInterval, httpConfig);
    console.log('✅ Fetch interceptor enabled');
  }
  
  if (logConsole) {
    interceptConsole(sendToExternalServer);
    console.log('✅ Console interceptor enabled');
  }
  
  if (logErrors) {
    interceptErrors(sendToExternalServer);
    console.log('✅ Error interceptor enabled');
  }

  isInitialized = true;
  lastInitializationTime = currentTime;
  
  // Iniciar el monitor de conexiones
  startConnectionMonitor();
  
  console.log('🎉 [INIT] Next Http Server Inspector initialized successfully!');
  console.log(`🎉 [INIT] Hot reload count: ${hotReloadCount}`);
  console.log('💡 [INIT] Note: Make sure external WebSocket server is running on the configured port');
  
  // Expose debugging functions to global scope for browser console access
  if (typeof globalThis !== 'undefined') {
    globalThis.__nextHttpInspectorDebug = {
      getInterceptorStatus,
      resetFetchInterceptor,
      getHotReloadCount: () => hotReloadCount,
      getWsConnection: () => wsConnection,
      getWsConfig: () => wsConfig,
      getHttpConfig: () => httpConfig
    };
  }
}

// Export debugging functions
export { getInterceptorStatus, resetFetchInterceptor };

// Función para reinicializar en caso de hot reload
export function reinitializeInstrument(options: InstrumentOptions = {}) {
  // Check if we're in a browser environment
  if (!isNodeEnvironment) {
    console.warn('⚠️ Next Http Server Inspector requires Node.js environment. Skipping reinitialization in browser.');
    return;
  }

  // Check if Node.js modules are available
  if (!WebSocket) {
    console.warn('⚠️ WebSocket library not available. Skipping reinitialization.');
    return;
  }

  hotReloadCount++;
  console.log(`🔄 [REINIT] Reinitializing Next Http Server Inspector due to hot reload #${hotReloadCount}...`);
  console.log(`🔄 [REINIT] Current state - Init: ${isInitialized}`);
  
  // Detener el monitor de conexiones
  stopConnectionMonitor();
  
  // Cerrar conexión WebSocket existente
  if (wsConnection) {
    console.log('🔄 [REINIT] Closing existing WebSocket connection...');
    wsConnection.close();
    wsConnection = null;
  }
  
  // Resetear estado
  isInitialized = false;
  wsConfig = null;
  httpConfig = null;
  
  console.log('🔄 [REINIT] State reset, reinitializing...');
  
  // Reinicializar con las mismas opciones
  setupNextInstrument(options);
}
