export function createLogger() {
    const wsClients: any[] = [];
  
    // Guardamos las funciones originales antes de cualquier interceptor
    const safeLog = global.console.log;
    const safeError = global.console.error;
  
    return {
      log(type: string, payload: any) {
        const data = { type, payload, timestamp: new Date().toISOString() };
        safeLog(`[${type}]`, payload); // usa la versión original, no interceptada
        wsClients.forEach((c) => c.send(JSON.stringify(data)));
      },
      error(type: string, payload: any) {
        const data = { type, payload, level: 'error', timestamp: new Date().toISOString() };
        safeError(`[${type}]`, payload); // usa la versión original
        wsClients.forEach((c) => c.send(JSON.stringify(data)));
      },
      attachClient(client: any) {
        wsClients.push(client);
      },
    };
  }
  