// Only import Node.js modules when running in Node.js environment
let WebSocket: any;
let http: any;

// Check if we're running in Node.js environment
const isNodeEnvironment = typeof process !== 'undefined' && process.versions && process.versions.node;

if (isNodeEnvironment) {
  try {
    WebSocket = require('ws').WebSocket;
  } catch (error) {
    console.warn('⚠️ WebSocket library not available:', error instanceof Error ? error.message : String(error));
  }
  
  try {
    http = require('http');
  } catch (error) {
    console.warn('⚠️ HTTP library not available:', error instanceof Error ? error.message : String(error));
  }
}

import { interceptFetch } from './interceptors/fetchInterceptor';
import type { InstrumentOptions } from './types';

// Variable para indicar si ya fue inicializado
let isInitialized = false;

// Variables globales para manejar el estado
let wsConnection: any = null;
let wsConfig: { host: string; port: number } | null = null;
let httpConfig: { host: string; port: number; endpoint: string } | null = null;
let messageQueue: any[] = [];

// Función para enviar datos por HTTP como fallback
function sendViaHttp(data: any) {
  if (!http || !httpConfig) {
    return;
  }

  const postData = JSON.stringify(data);
  const options = {
    hostname: httpConfig.host,
    port: httpConfig.port,
    path: httpConfig.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, () => {
    // Request sent successfully
  });

  req.on('error', () => {
    // Silently handle errors
  });

  req.write(postData);
  req.end();
}

// Función para procesar la cola de mensajes pendientes
function processMessageQueue() {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN && messageQueue.length > 0) {
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      try {
        wsConnection.send(JSON.stringify(message));
      } catch (error) {
        sendViaHttp(message);
      }
    }
  }
}

// Función para enviar datos al servidor externo (WebSocket con fallback HTTP)
function sendToExternalServer(data: any) {
  // Check if we're in browser environment
  if (!isNodeEnvironment) {
    return;
  }
  
  // Intentar WebSocket primero si está disponible y configurado
  if (WebSocket && wsConfig) {
    // Crear conexión si no existe
    if (!wsConnection) {
      try {
        messageQueue.push(data);
        
        wsConnection = new WebSocket(`ws://${wsConfig.host}:${wsConfig.port}`);
        
        wsConnection.on('open', () => {
          processMessageQueue();
        });
        
        wsConnection.on('error', () => {
          // Enviar todos los mensajes en cola por HTTP
          while (messageQueue.length > 0) {
            const message = messageQueue.shift();
            sendViaHttp(message);
          }
        });
        
        wsConnection.on('close', () => {
          wsConnection = null;
          messageQueue = [];
        });
        
      } catch (error) {
        sendViaHttp(data);
      }
    } else if (wsConnection.readyState === WebSocket.OPEN) {
      // Enviar dato directamente si la conexión está abierta
      try {
        wsConnection.send(JSON.stringify(data));
      } catch (error) {
        sendViaHttp(data);
      }
    } else if (wsConnection.readyState === WebSocket.CONNECTING) {
      // Agregar a la cola mientras se conecta
      messageQueue.push(data);
    } else {
      // Reconectar si la conexión está cerrada
      wsConnection = null;
      sendToExternalServer(data);
    }
  } else {
    // WebSocket no disponible, usar HTTP directamente
    sendViaHttp(data);
  }
}

export function initFetchServerInterceptor(options: InstrumentOptions = {}): void {
  // Si ya fue inicializado, no hacer nada
  if (isInitialized) {
    return;
  }

  // Check if we're in a browser environment first
  if (!isNodeEnvironment) {
    console.warn('⚠️ Next Http Server Inspector requires Node.js environment. Skipping initialization in browser.');
    return;
  }

  // Check if Node.js modules are available
  if (!WebSocket) {
    console.warn('⚠️ WebSocket library not available. Skipping initialization.');
    return;
  }

  // ⚠️ Development environment check (only in Node.js)
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';
  const isDevelopment = !isProduction;

  if (!isDevelopment) {
    console.warn('⚠️ Next Http Server Inspector is designed for development only. Skipping initialization in production.');
    return;
  }

  console.log('🚀 Initializing Fetch Server Interceptor...');
  
  // Configurar conexión WebSocket externa
  const websocket = options.websocket || { enabled: true, port: 8080 };
  if (websocket.enabled) {
    wsConfig = {
      host: 'localhost',
      port: websocket.port
    };
  }

  // Configurar conexión HTTP como fallback
  const httpOptions = options.http || { enabled: true, host: 'localhost', port: 3001, endpoint: '/api/logs' };
  if (httpOptions.enabled) {
    httpConfig = {
      host: httpOptions.host,
      port: httpOptions.port,
      endpoint: httpOptions.endpoint
    };
  }

  // Configurar interceptor de fetch
  const fetchToUse = options.fetch || globalThis.fetch;
  interceptFetch(sendToExternalServer, httpConfig, fetchToUse);

  isInitialized = true;
  console.log('✅ Fetch Server Interceptor initialized successfully!');
}
