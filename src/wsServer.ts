import WebSocket, { WebSocketServer } from 'ws';

export function createWebSocketServer(port: number) {
  try {
    const wsServer = new WebSocketServer({ port });

    console.log(`🧩 next-instrument WebSocket server running on ws://localhost:${port}`);

    wsServer.on('connection', (ws) => {
      console.log('📡 New WebSocket client connected');
      ws.send(JSON.stringify({ type: 'info', message: 'Connected to next-instrument' }));
      
      ws.on('close', () => {
        console.log('📡 WebSocket client disconnected');
      });
      
      ws.on('error', (error) => {
        console.error('📡 WebSocket client error:', error);
      });
    });

    wsServer.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });

    return wsServer;
  } catch (error) {
    console.error('❌ Failed to create WebSocket server:', error);
    throw error;
  }
}

export function sendWS(wsServer: WebSocketServer | undefined, data: any) {
  if (!wsServer) return;
  
  try {
    const payload = JSON.stringify(data);
    let sentCount = 0;
    
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
          sentCount++;
        } catch (error) {
          console.error('❌ Failed to send message to WebSocket client:', error);
        }
      }
    });
    
    if (sentCount === 0) {
      console.warn('⚠️ No active WebSocket clients to send message to');
    }
  } catch (error) {
    console.error('❌ Failed to serialize WebSocket message:', error);
  }
}