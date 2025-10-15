import WebSocket, { WebSocketServer } from 'ws';

// Extender el tipo WebSocket para incluir la propiedad isAlive y clientId
interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  clientId?: string;
}

let globalWsServer: WebSocketServer | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export function createWebSocketServer(port: number) {
  try {
    // Si ya existe un servidor, cerrarlo primero
    if (globalWsServer) {
      console.log('🔄 [WEBSOCKET] Closing existing WebSocket server...');
      globalWsServer.close();
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    }

    const wsServer = new WebSocketServer({ port });

    console.log(`🧩 [WEBSOCKET] Server created and running on ws://localhost:${port}`);
    console.log(`🔍 [WEBSOCKET] Server instance:`, wsServer);

    wsServer.on('connection', (ws) => {
      const clientId = Date.now() + Math.random().toString(36).substr(2, 9);
      console.log(`📡 [WEBSOCKET] New client connected - ID: ${clientId}`);
      console.log(`📡 [WEBSOCKET] Client readyState: ${ws.readyState}`);
      console.log(`📡 [WEBSOCKET] Total clients: ${wsServer.clients.size}`);
      
      ws.send(JSON.stringify({ type: 'info', message: 'Connected to next-instrument', clientId }));
      
      // Configurar ping/pong para mantener la conexión viva
      (ws as ExtendedWebSocket).isAlive = true;
      (ws as ExtendedWebSocket).clientId = clientId;
      
      ws.on('pong', () => {
        console.log(`📡 [WEBSOCKET] Pong received from client ${clientId}`);
        (ws as ExtendedWebSocket).isAlive = true;
      });
      
      ws.on('close', (code, reason) => {
        console.log(`📡 [WEBSOCKET] Client ${clientId} disconnected - Code: ${code}, Reason: ${reason}`);
        console.log(`📡 [WEBSOCKET] Remaining clients: ${wsServer.clients.size}`);
      });
      
      ws.on('error', (error) => {
        console.error(`📡 [WEBSOCKET] Client ${clientId} error:`, error);
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log(`📡 [WEBSOCKET] Message from client ${clientId}:`, message.type);
        } catch (e) {
          console.log(`📡 [WEBSOCKET] Raw message from client ${clientId}:`, data.toString());
        }
      });
    });

    wsServer.on('error', (error) => {
      console.error('❌ [WEBSOCKET] Server error:', error);
    });

    // Configurar heartbeat para mantener conexiones vivas
    heartbeatInterval = setInterval(() => {
      if (wsServer) {
        const clientCount = wsServer.clients.size;
        console.log(`💓 [WEBSOCKET] Heartbeat check - ${clientCount} clients`);
        
        wsServer.clients.forEach((ws) => {
          const extendedWs = ws as ExtendedWebSocket;
          const clientId = extendedWs.clientId || 'unknown';
          
          if (extendedWs.isAlive === false) {
            console.log(`📡 [WEBSOCKET] Terminating inactive client ${clientId}`);
            return ws.terminate();
          }
          
          console.log(`💓 [WEBSOCKET] Sending ping to client ${clientId}`);
          extendedWs.isAlive = false;
          ws.ping();
        });
      } else {
        console.log('⚠️ [WEBSOCKET] Heartbeat: No server instance available');
      }
    }, 30000); // Ping cada 30 segundos

    globalWsServer = wsServer;
    return wsServer;
  } catch (error) {
    console.error('❌ Failed to create WebSocket server:', error);
    throw error;
  }
}

export function sendWS(wsServer: WebSocketServer | undefined, data: any) {
  if (!wsServer) {
    console.log('❌ [WEBSOCKET] No WebSocket server available for sending message');
    return;
  }
  
  try {
    const payload = JSON.stringify(data);
    let sentCount = 0;
    let totalClients = wsServer.clients.size;
    
    console.log(`📤 [WEBSOCKET] Attempting to send message to ${totalClients} clients`);
    console.log(`📤 [WEBSOCKET] Message type: ${data.type}`);
    
    wsServer.clients.forEach((client) => {
      const clientId = (client as ExtendedWebSocket).clientId || 'unknown';
      console.log(`📤 [WEBSOCKET] Client ${clientId} readyState: ${client.readyState}`);
      
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
          sentCount++;
          console.log(`✅ [WEBSOCKET] Message sent to client ${clientId}`);
        } catch (error) {
          console.error(`❌ [WEBSOCKET] Failed to send message to client ${clientId}:`, error);
        }
      } else {
        console.log(`⚠️ [WEBSOCKET] Client ${clientId} not ready (state: ${client.readyState})`);
      }
    });
    
    console.log(`📊 [WEBSOCKET] Message delivery: ${sentCount}/${totalClients} clients`);
    
    if (sentCount === 0) {
      console.warn('⚠️ [WEBSOCKET] No active WebSocket clients to send message to');
      console.warn('⚠️ [WEBSOCKET] This might indicate a connection issue or hot reload problem');
    }
  } catch (error) {
    console.error('❌ [WEBSOCKET] Failed to serialize WebSocket message:', error);
  }
}

export function getGlobalWsServer(): WebSocketServer | null {
  return globalWsServer;
}

export function closeWebSocketServer() {
  if (globalWsServer) {
    console.log('🔄 [WEBSOCKET] Closing WebSocket server...');
    console.log(`🔄 [WEBSOCKET] Active clients before close: ${globalWsServer.clients.size}`);
    
    // Notify all clients before closing
    globalWsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify({ type: 'info', message: 'Server shutting down' }));
        } catch (e) {
          console.log('⚠️ [WEBSOCKET] Could not notify client of shutdown');
        }
      }
    });
    
    globalWsServer.close();
    globalWsServer = null;
    console.log('✅ [WEBSOCKET] WebSocket server closed');
  } else {
    console.log('ℹ️ [WEBSOCKET] No WebSocket server to close');
  }
  
  if (heartbeatInterval) {
    console.log('🔄 [WEBSOCKET] Clearing heartbeat interval');
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}