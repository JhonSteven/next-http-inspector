import { createWebSocketServer } from './wsServer';
import { createUIServer } from './uiServer';
import { interceptFetch } from './interceptors/fetchInterceptor';
import { interceptConsole } from './interceptors/consoleInterceptor';
import { interceptErrors } from './interceptors/errorInterceptor';
import type { InstrumentOptions, WebSocketWrapper } from './types';

export function setupNextInstrument({
  logFetch = true,
  logConsole = true,
  logErrors = true,
  websocket = { enabled: true, port: 8080 },
  ui = { enabled: true, port: 3001, path: '/ui' },
  fetchGroupInterval = 20000,
}: InstrumentOptions = {}): WebSocketWrapper {
  let wsServer;
  let uiServer;

  console.log('🚀 Initializing Next Telescope...');

  // Validar puertos
  if (websocket.enabled && ui.enabled && websocket.port === ui.port) {
    console.error('❌ WebSocket and UI cannot use the same port');
    throw new Error('WebSocket and UI ports must be different');
  }

  // 1️⃣ Inicializar WebSocket
  if (websocket.enabled) {
    try {
      wsServer = createWebSocketServer(websocket.port);
      console.log(`✅ WebSocket server started on port ${websocket.port}`);
    } catch (error) {
      console.error('❌ Failed to start WebSocket server:', error);
      throw error;
    }
  }

  // 2️⃣ Inicializar servidor UI
  if (ui.enabled) {
    try {
      uiServer = createUIServer(ui.port, ui.path, websocket?.port || 8080);
      console.log(`✅ UI server started on port ${ui.port}`);
    } catch (error) {
      console.error('❌ Failed to start UI server:', error);
      throw error;
    }
  }

  // 3️⃣ Configurar interceptores
  if (logFetch) {
    interceptFetch(wsServer, fetchGroupInterval);
    console.log('✅ Fetch interceptor enabled');
  }
  
  if (logConsole) {
    interceptConsole(wsServer);
    console.log('✅ Console interceptor enabled');
  }
  
  if (logErrors) {
    interceptErrors(wsServer);
    console.log('✅ Error interceptor enabled');
  }

  console.log('🎉 Next Telescope initialized successfully!');
  return { wsServer, uiServer };
}
