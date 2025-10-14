import WebSocket, { WebSocketServer } from 'ws';

export function createWebSocketServer(port: number) {
  const wsServer = new WebSocketServer({ port });

  console.log(`🧩 next-instrument WebSocket server running on ws://localhost:${port}`);

  wsServer.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'info', message: 'Connected to next-instrument' }));
  });

  return wsServer;
}

export function sendWS(wsServer: WebSocketServer | undefined, data: any) {
  if (!wsServer) return;
  const payload = JSON.stringify(data);
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}