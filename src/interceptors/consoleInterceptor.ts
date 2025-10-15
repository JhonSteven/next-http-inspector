import { sendWS } from '../wsServer';
import type { WebSocketServer } from 'ws';

export function interceptConsole(wsServer: WebSocketServer | undefined) {
  const origLog = console.log;

  console.log = (...args) => {
    // Evitar loops infinitos - no interceptar nuestros propios logs
    if (args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('[')) {
      origLog(...args);
      return;
    }
    
    sendWS(wsServer, { type: 'console', payload: args });
    origLog('[CONSOLE_LOG]', ...args);
  };
}
