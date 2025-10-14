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
  websocket = { enabled: true, port: 8000 },
  ui = { enabled: true, port: 3001, path: '/ui' },
  fetchGroupInterval = 20000,
}: InstrumentOptions = {}): WebSocketWrapper {
  let wsServer;
  let uiServer;

  // 1️⃣ Inicializar WebSocket
  if (websocket.enabled) {
    wsServer = createWebSocketServer(websocket.port);
  }

  // 2️⃣ Inicializar servidor UI
  if (ui.enabled) {
    uiServer = createUIServer(ui.port, ui.path);
  }

  // 3️⃣ Configurar interceptores
  if (logFetch) interceptFetch(wsServer, fetchGroupInterval);
  if (logConsole) interceptConsole(wsServer);
  if (logErrors) interceptErrors(wsServer);

  return { wsServer, uiServer };
}
