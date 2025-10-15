import { sendWS, getGlobalWsServer } from '../wsServer';
import type { WebSocketServer } from 'ws';

export function interceptConsole(wsServer: WebSocketServer | undefined) {
  const origLog = console.log;
  
  // Logs de inicialización usando la función original directamente
  origLog('🔧 [CONSOLE_INTERCEPTOR] Setting up console interceptor');
  origLog('🔧 [CONSOLE_INTERCEPTOR] WebSocket server available:', !!wsServer);

  console.log = (...args) => {
    // Evitar loops infinitos - no interceptar nuestros propios logs del sistema
    if (args.length > 0 && typeof args[0] === 'string' && 
        (args[0].startsWith('[') || 
         args[0].includes('[CONSOLE_INTERCEPTOR]') || 
         args[0].includes('[CONSOLE_LOG]') ||
         args[0].includes('[WEBSOCKET]') ||
         args[0].includes('[FETCH_INTERCEPTOR]') ||
         args[0].includes('[ERROR_INTERCEPTOR]') ||
         args[0].includes('[INIT]') ||
         args[0].includes('[REINIT]') ||
         args[0].includes('[CONNECTION_MONITOR]') ||
         args[0].includes('[HOT_RELOAD]'))) {
      origLog(...args);
      return;
    }
    
    // Usar el servidor WebSocket global si está disponible
    const currentWsServer = wsServer || getGlobalWsServer() || undefined;
    sendWS(currentWsServer, { type: 'console', payload: args });
    origLog('[CONSOLE_LOG]', ...args);
  };
}
