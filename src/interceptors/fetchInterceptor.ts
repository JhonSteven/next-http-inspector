import { sendWS } from './../wsServer';
import type { WebSocketServer } from 'ws';

export function interceptFetch(
  wsServer: WebSocketServer | undefined,
  fetchGroupInterval: number = 20000
) {
  if (typeof global.fetch !== 'function') return;

  const originalFetch = global.fetch;
  const fetchLogs: any[] = [];

  global.fetch = async (...args) => {
    const start = performance.now();
    try {
      const res = await originalFetch(...args);
      const duration = performance.now() - start;

      const info = {
        url: args[0],
        method: args[1]?.method || 'GET',
        status: res.status,
        duration: `${duration.toFixed(2)} ms`,
        timestamp: new Date().toISOString(),
      };

      fetchLogs.push(info);
      sendWS(wsServer, { type: 'fetch', payload: info });

      return res;
    } catch (error: any) {
      const errInfo = {
        url: args[0],
        method: args[1]?.method || 'GET',
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      fetchLogs.push(errInfo);
      sendWS(wsServer, { type: 'fetch_error', payload: errInfo });
      throw error;
    }
  };

  // Los fetchs se muestran solo en la UI web, no en consola
}
