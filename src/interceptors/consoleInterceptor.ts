import { sendWS } from '../wsServer';
import type { WebSocketServer } from 'ws';

export function interceptConsole(wsServer: WebSocketServer | undefined) {
  const origLog = console.log;

  console.log = (...args) => {
    sendWS(wsServer, { type: 'console', payload: args });
    origLog('[CONSOLE_LOG]', args);
  };
}
