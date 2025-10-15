import { sendWS } from '../wsServer';
import type { WebSocketServer } from 'ws';

export function interceptErrors(wsServer: WebSocketServer | undefined) {
  const origError = console.error;

  console.error = (...args) => {
    // Evitar loops infinitos - no interceptar nuestros propios logs de error
    if (args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('[')) {
      origError(...args);
      return;
    }
    
    sendWS(wsServer, { type: 'error', payload: args });
    origError('[CONSOLE_ERROR]', ...args);
  };
}
