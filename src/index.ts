import { createWebSocketServer, getGlobalWsServer, closeWebSocketServer } from './wsServer';
import { createUIServer } from './uiServer';
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
    getGlobalWsServer: () => any;
  } | undefined;
}

// Variables globales para manejar el estado
let globalWsServer: any = null;
let globalUiServer: any = null;
let isInitialized = false;
let hotReloadCount = 0;
let lastInitializationTime = 0;
let connectionMonitorInterval: NodeJS.Timeout | null = null;

// Función para monitorear el estado de las conexiones WebSocket
function startConnectionMonitor() {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
  }
  
  connectionMonitorInterval = setInterval(() => {
    if (globalWsServer) {
      const clientCount = globalWsServer.clients.size;
      const activeClients = Array.from(globalWsServer.clients).filter((ws: any) => ws.readyState === 1).length;
      
      console.log(`📊 [CONNECTION_MONITOR] WebSocket status - Total clients: ${clientCount}, Active: ${activeClients}`);
      
      if (clientCount === 0) {
        console.log('⚠️ [CONNECTION_MONITOR] No WebSocket clients connected - this might indicate a hot reload issue');
      }
    } else {
      console.log('❌ [CONNECTION_MONITOR] No WebSocket server available');
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
  ui = { enabled: true, port: 3001, path: '/ui' },
  fetchGroupInterval = 20000,
}: InstrumentOptions = {}): WebSocketWrapper {
  // ⚠️ Development environment check
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV === 'dev' || 
                       process.env.NODE_ENV === undefined; // Default to dev if not set

  if (!isDevelopment) {
    console.warn('⚠️ Next Http Server Inspector is designed for development only. Skipping initialization in production.');
    return { wsServer: undefined, uiServer: undefined };
  }

  const currentTime = Date.now();
  const timeSinceLastInit = currentTime - lastInitializationTime;
  
  // Detectar hot reload si se llama muy pronto después de la última inicialización
  if (isInitialized && timeSinceLastInit < 5000) {
    hotReloadCount++;
    console.log(`🔥 [HOT_RELOAD] Detected hot reload #${hotReloadCount} (${timeSinceLastInit}ms since last init)`);
    console.log('🔥 [HOT_RELOAD] This might be causing WebSocket connection issues');
  }

  // Si ya está inicializado, reutilizar las instancias existentes
  if (isInitialized) {
    console.log('🔄 [INIT] Next Http Server Inspector already initialized, reusing existing instances...');
    console.log(`🔄 [INIT] Current WebSocket server: ${!!globalWsServer}`);
    console.log(`🔄 [INIT] Current UI server: ${!!globalUiServer}`);
    return { wsServer: globalWsServer, uiServer: globalUiServer };
  }

  console.log('🚀 Initializing Next Http Server Inspector...');

  // Validar puertos
  if (websocket.enabled && ui.enabled && websocket.port === ui.port) {
    console.error('❌ WebSocket and UI cannot use the same port');
    throw new Error('WebSocket and UI ports must be different');
  }

  // 1️⃣ Inicializar WebSocket
  if (websocket.enabled) {
    try {
      globalWsServer = createWebSocketServer(websocket.port);
      console.log(`✅ WebSocket server started on port ${websocket.port}`);
    } catch (error) {
      console.error('❌ Failed to start WebSocket server:', error);
      throw error;
    }
  }

  // 2️⃣ Inicializar servidor UI
  if (ui.enabled) {
    try {
      globalUiServer = createUIServer(ui.port, ui.path, websocket?.port || 8080);
      console.log(`✅ UI server started on port ${ui.port}`);
    } catch (error) {
      console.error('❌ Failed to start UI server:', error);
      throw error;
    }
  }

  // 3️⃣ Configurar interceptores
  if (logFetch) {
    console.log('🔧 [INIT] Before setting up fetch interceptor');
    console.log('🔧 [INIT] Interceptor status:', getInterceptorStatus());
    interceptFetch(globalWsServer, fetchGroupInterval);
    console.log('🔧 [INIT] After setting up fetch interceptor');
    console.log('🔧 [INIT] Interceptor status:', getInterceptorStatus());
    console.log('✅ Fetch interceptor enabled');
  }
  
  if (logConsole) {
    interceptConsole(globalWsServer);
    console.log('✅ Console interceptor enabled');
  }
  
  if (logErrors) {
    interceptErrors(globalWsServer);
    console.log('✅ Error interceptor enabled');
  }

  isInitialized = true;
  lastInitializationTime = currentTime;
  
  // Iniciar el monitor de conexiones
  startConnectionMonitor();
  
  console.log('🎉 [INIT] Next Http Server Inspector initialized successfully!');
  console.log(`🎉 [INIT] Hot reload count: ${hotReloadCount}`);
  console.log(`🎉 [INIT] WebSocket server: ${!!globalWsServer}`);
  console.log(`🎉 [INIT] UI server: ${!!globalUiServer}`);
  
  // Expose debugging functions to global scope for browser console access
  if (typeof globalThis !== 'undefined') {
    globalThis.__nextHttpInspectorDebug = {
      getInterceptorStatus,
      resetFetchInterceptor,
      getHotReloadCount: () => hotReloadCount,
      getGlobalWsServer: () => globalWsServer
    };
  }
  
  return { wsServer: globalWsServer, uiServer: globalUiServer };
}

// Export debugging functions
export { getInterceptorStatus, resetFetchInterceptor };

// Función para reinicializar en caso de hot reload
export function reinitializeInstrument(options: InstrumentOptions = {}) {
  hotReloadCount++;
  console.log(`🔄 [REINIT] Reinitializing Next Http Server Inspector due to hot reload #${hotReloadCount}...`);
  console.log(`🔄 [REINIT] Current state - WS: ${!!globalWsServer}, UI: ${!!globalUiServer}, Init: ${isInitialized}`);
  
  // Detener el monitor de conexiones
  stopConnectionMonitor();
  
  // Cerrar servidores existentes
  if (globalWsServer) {
    console.log('🔄 [REINIT] Closing existing WebSocket server...');
    closeWebSocketServer();
  }
  
  if (globalUiServer) {
    console.log('🔄 [REINIT] Closing existing UI server...');
    globalUiServer.close();
  }
  
  // Resetear estado
  globalWsServer = null;
  globalUiServer = null;
  isInitialized = false;
  
  console.log('🔄 [REINIT] State reset, reinitializing...');
  
  // Reinicializar con las mismas opciones
  return setupNextInstrument(options);
}
