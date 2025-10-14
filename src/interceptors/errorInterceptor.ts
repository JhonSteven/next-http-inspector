import { sendWS } from '../wsServer';
import type { WebSocketServer } from 'ws';

export function interceptErrors(wsServer: WebSocketServer | undefined) {
  const origError = console.error;

  console.error = (...args) => {
    sendWS(wsServer, { type: 'error', payload: args });
    origError('[CONSOLE_ERROR]', args);
  };
}
