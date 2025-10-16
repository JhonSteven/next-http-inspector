// Only import Node.js modules when running in Node.js environment
let WebSocket: any;

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
  } | undefined;
}

// Variables globales para manejar el estado
let isInitialized = false;
let hotReloadCount = 0;
let lastInitializationTime = 0;
let connectionMonitorInterval: NodeJS.Timeout | null = null;
let wsConnection: any = null;
let wsConfig: { host: string; port: number } | null = null;

// Función para enviar datos al servidor WebSocket externo
function sendToExternalServer(data: any) {
  if (!WebSocket || !wsConfig) {
    console.log('⚠️ Mock sendWS called - no WebSocket connection available:', data.type);
    return;
  }

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
        console.log(`❌ [WEBSOCKET] Connection error:`, error.message);
      });
      
      wsConnection.on('close', () => {
        console.log('🔌 [WEBSOCKET] Connection closed');
        wsConnection = null;
      });
      
    } catch (error) {
      console.log('❌ [WEBSOCKET] Failed to create connection:', error);
      wsConnection = null;
    }
  } else if (wsConnection.readyState === WebSocket.OPEN) {
    // Enviar dato directamente si la conexión está abierta
    try {
      wsConnection.send(JSON.stringify(data));
    } catch (error) {
      console.log('❌ [WEBSOCKET] Failed to send data:', error);
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
  console.log(`📡 [INIT] Will send data to WebSocket server on port ${websocket.port}`);

  // Configurar conexión WebSocket externa
  if (websocket.enabled) {
    wsConfig = {
      host: 'localhost',
      port: websocket.port
    };
    console.log(`📡 [INIT] WebSocket connection configured for ws://${wsConfig.host}:${wsConfig.port}`);
  }

  // Configurar interceptores
  if (logFetch) {
    console.log('🔧 [INIT] Setting up fetch interceptor');
    interceptFetch(sendToExternalServer, fetchGroupInterval);
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
      getWsConfig: () => wsConfig
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
  
  console.log('🔄 [REINIT] State reset, reinitializing...');
  
  // Reinicializar con las mismas opciones
  setupNextInstrument(options);
}
