# next-http-server-inspector

🔭 **Next Http Server Inspector** — Development-only toolkit that captures logs, requests, errors and metrics in real-time during development with a modern React-based UI.

## ✨ Features

- **🔭 Real-time Network Monitoring**: Track all HTTP requests with detailed information
- **⚡ React-based UI**: Modern, responsive interface built with React
- **🌙 Dark/Light Theme**: Toggle between themes with persistent preferences
- **📊 Live Statistics**: Real-time metrics including success rates and response times
- **🔍 Request Filtering**: Filter requests by method (GET, POST, PUT, DELETE) or errors
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🔌 WebSocket Integration**: Real-time data streaming for instant updates
- **📑 Tabbed Interface**: Organized request details with separate tabs for headers and response body
- **🌳 Interactive JSON Viewer**: Expandable/collapsible JSON with syntax highlighting
- **🔄 Smart Reconnection**: Automatic WebSocket reconnection with manual retry option
- **⚡ Optimized Performance**: No duplicate requests, efficient data handling

## 🚀 Installation

> ⚠️ **Development Only**: This package is designed exclusively for development environments. Do not install in production.

```bash
npm install --save-dev next-http-server-inspector
```

## 📖 Usage

### Para Next.js

1. **Crear archivo de instrumentación** (`instrumentation.ts` en la raíz del proyecto):

```typescript
import { setupNextInstrument } from 'next-http-server-inspector';

export async function register() {
  setupNextInstrument({
    logFetch: true,        // Los fetchs se muestran en la UI web
    logConsole: true,      // Los console.log se muestran en consola
    logErrors: true,       // Los errores se muestran en consola
    websocket: { 
      enabled: true, 
      port: 8080 
    },
    ui: {
      enabled: true,
      port: 3001,
      path: '/ui'
    }
  });
  
  console.log('🚀 Next Http Server Inspector iniciado!');
  console.log('📊 UI disponible en: http://localhost:3001/ui');
}
```

2. **Habilitar instrumentación** en `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
```

3. **Ejecutar Next.js**:

```bash
npm run dev
```

### Para otros proyectos

```javascript
import { setupNextInstrument } from 'next-http-server-inspector';

const { wsServer, uiServer } = setupNextInstrument({
  logFetch: true,        // Los fetchs se muestran en la UI web
  logConsole: true,      // Los console.log se muestran en consola
  logErrors: true,       // Los errores se muestran en consola
  websocket: {
    enabled: true,
    port: 8080
  },
  ui: {
    enabled: true,
    port: 3001,
    path: '/ui'
  }
});

console.log('🚀 Next Http Server Inspector iniciado!');
console.log('📊 UI disponible en: http://localhost:3001/ui');
```

## ✨ Features

### 🖥️ Web UI Dashboard
- **URL**: `http://localhost:3001/ui` (configurable)
- **Network Monitoring**: Chrome DevTools-style network monitoring
- **Complete Capture**: Headers, URL params, request/response body
- **Chronological Order**: Requests displayed from first to last
- **Timing Analysis**: Start/end timestamps for parallel execution analysis
- **Filters**: By HTTP method (GET, POST, PUT, DELETE) and errors
- **Live Statistics**: Total requests, success rate, average duration
- **Theme Toggle**: Switch between light and dark modes
- **Clear All**: Button to clear all request data
- **Tabbed Interface**: 
  - **Details Tab**: URL breakdown, request headers, response headers, timing info
  - **Response Body Tab**: Interactive JSON viewer with expand/collapse
- **Interactive JSON Viewer**:
  - **Syntax Highlighting**: Different colors for strings, numbers, booleans, null
  - **Expandable Objects**: Click to expand/collapse JSON objects and arrays
  - **Smart Defaults**: First 2 levels expanded by default
  - **Visual Indicators**: Clear brackets, commas, and indentation
- **Smart Connection Management**:
  - **Auto Reconnection**: Automatic retry with exponential backoff
  - **Manual Retry**: Button to manually reconnect when connection fails
  - **Connection Status**: Visual indicators (🟢 connected, 🟡 reconnecting, 🔴 disconnected)
- **Responsive Design**: Works on desktop and mobile

### 📝 Console Logging
- `console.log()` messages appear in terminal console
- Fetch requests **DO NOT** appear in console (only in web UI)
- Errors are displayed in console

### 🔌 WebSocket Server
- WebSocket server on port 8080 (configurable)
- Real-time communication between application and UI

## ⚙️ Configuration

```typescript
interface InstrumentOptions {
  logFetch?: boolean;           // Mostrar fetchs en UI web
  logConsole?: boolean;         // Mostrar console.log en terminal
  logErrors?: boolean;          // Mostrar errores en terminal
  websocket?: {
    enabled: boolean;
    port: number;
  };
  ui?: {
    enabled: boolean;
    port: number;
    path: string;
  };
  fetchGroupInterval?: number;  // Intervalo para agrupar logs (ms)
}
```

## 🎯 Default Configuration

```javascript
{
  logFetch: true,
  logConsole: true,
  logErrors: true,
  websocket: { enabled: true, port: 8080 },
  ui: { enabled: true, port: 3001, path: '/ui' },
  fetchGroupInterval: 20000
}
```

## 🔧 Development

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar ejemplo
node example.js
```

## ⚠️ Production Considerations

- **Development Only**: This package is designed exclusively for development environments
- **Automatic Detection**: The package automatically detects production environments and skips initialization
- **No Production Impact**: When `NODE_ENV=production`, the package returns empty objects without starting servers
- **Security**: Never install this package in production builds
- **Performance**: Zero performance impact in production environments

## 📊 UI Features

- **Real-time Updates**: Requests appear instantly
- **Complete Capture**: 
  - Request and response headers
  - URL parameters breakdown
  - Request and response body
  - Parsed URL (protocol, host, path, query, hash)
  - Timing information (start/end timestamps)
- **Smart Filters**: Filter by HTTP method or errors
- **Live Statistics**: Real-time updated counters
- **Adaptive Theme**: Switch between light and dark modes
- **Data Management**: Clear all requests button
- **Expandable Details**: Complete information for each request
- **Chrome DevTools Style**: Professional interface with smooth transitions
- **Responsive**: Adapts to any screen size
- **Persistence**: Theme preference saved in localStorage
- **Chronological Order**: Requests displayed from first to last
- **Parallel Analysis**: Start/end timestamps for analyzing concurrent requests

## 🔧 Troubleshooting

### Requests don't appear in the UI

1. **Check port configuration**:
   - WebSocket should be on port 8080 (default)
   - UI should be on port 3001 (default)
   - Make sure ports are not in use

2. **Verify instrumentation**:
   - `instrumentation.ts` file must be in project root
   - `next.config.js` must have `instrumentationHook: true`
   - Restart Next.js development server

3. **Check WebSocket connection**:
   - Open browser developer tools
   - Go to Console tab
   - Should see "Connected to WebSocket on port 8080"

4. **Verify requests are being made**:
   - Requests only appear when they are executed
   - Make sure your application is making HTTP requests

### UI doesn't load

1. **Check UI port**:
   - Make sure port 3001 is available
   - Change port if needed: `ui: { port: 3002 }`

2. **Verify configuration**:
   - UI must be enabled: `ui: { enabled: true }`
   - Path must be correct: `ui: { path: '/ui' }`