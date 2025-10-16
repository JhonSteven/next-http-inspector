# Next Http Inspector

**Interceptors for Next.js** that connect directly to external WebSocket servers (dev-only).

This package provides interceptors that capture HTTP requests, console logs, and errors, connecting directly to external WebSocket servers for real-time monitoring.

## 🎯 Focus

This package **connects directly** to external WebSocket servers using only the `ws` library. It does not require any external packages and creates its own WebSocket client connections.

## ✨ Features

- 🔍 **Fetch Interceptor**: Captures all HTTP requests and responses
- 📝 **Console Interceptor**: Captures console.log calls
- ❌ **Error Interceptor**: Captures console.error calls
- 📡 **Direct WebSocket Connection**: Connects directly to external servers
- 🔄 **Hot Reload Support**: Handles Next.js hot reloads gracefully
- 🛡️ **Development Only**: Automatically disabled in production
- 🚀 **Zero External Dependencies**: Only requires `ws` library

## 🚀 Installation

> ⚠️ **Development Only**: This package is designed exclusively for development environments. Do not install in production.

```bash
npm install --save-dev next-http-inspector
```

## 🔧 Troubleshooting

### Error: "Module not found: Can't resolve 'crypto'"

Si encuentras este error, significa que el paquete está intentando ejecutarse en el navegador. Este paquete está diseñado para funcionar solo en el servidor (Node.js).

**Solución rápida:**
1. Asegúrate de que la inicialización solo ocurra en el servidor
2. Usa verificación de entorno en tu código:

```typescript
// En instrumentation.ts o _app.tsx
if (typeof window === 'undefined') {
  setupNextInstrument({
    logFetch: true,
    logConsole: true,
    logErrors: true,
    websocket: { enabled: true, port: 8080 }
  });
}
```

Para más detalles, consulta [CRYPTO_FIX.md](./CRYPTO_FIX.md).

## 📖 Usage

### For Next.js

1. **Create instrumentation file** (`instrumentation.ts` in your project root):

```typescript
import { setupNextInstrument } from 'next-http-inspector';

export function register() {
  setupNextInstrument({
    logFetch: true,
    logConsole: true,
    logErrors: true,
    websocket: { enabled: true, port: 8080 }
  });
}
```

2. **Start external servers** (in a separate terminal):

```bash
# Install the server globally (one-time setup)
npm install -g next-http-inspector-server

# Start the server
next-inspector-server --ui-port 3001 --ws-port 8080
```

3. **Start your Next.js app**:

```bash
npm run dev
```

4. **Access the monitoring UI**:

Open [http://localhost:3001/ui](http://localhost:3001/ui) in your browser.

### Configuration Options

```typescript
setupNextInstrument({
  logFetch: true,           // Enable fetch interceptor
  logConsole: true,         // Enable console interceptor
  logErrors: true,          // Enable error interceptor
  websocket: {
    enabled: true,          // Enable WebSocket server
    port: 8080             // WebSocket port
  },
  fetchGroupInterval: 20000 // Group fetch requests (ms)
});
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│           Next.js App               │
│  ┌─────────────────────────────────┐│
│  │     Interceptors Package        ││
│  │  ┌─────────────────────────────┐││
│  │  │  Fetch Interceptor          │││
│  │  │  Console Interceptor        │││
│  │  │  Error Interceptor          │││
│  │  └─────────────────────────────┘││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
                    │
                    │ Direct WebSocket Client
                    ▼
┌─────────────────────────────────────┐
│    External Server Package          │
│  ┌─────────────────────────────────┐│
│  │  WebSocket Server (port 8080)   ││
│  │  UI Server (port 3001)          ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Key Points:**
- This package **creates its own WebSocket client** connections
- No external package dependencies required
- Direct connection to external WebSocket servers
- Ultra-clean separation of concerns

## 🔧 Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## 📦 Package Structure

```
src/
├── index.ts                    # Main setup function
├── types.ts                    # TypeScript definitions
└── interceptors/
    ├── fetchInterceptor.ts      # HTTP request/response interceptor
    ├── consoleInterceptor.ts    # Console.log interceptor
    └── errorInterceptor.ts      # Console.error interceptor
```

## 🔗 Related Packages

- [`next-http-inspector-server`](../next-http-inspector-server) - External WebSocket and UI servers

## 🛠️ Troubleshooting

### No Data Appearing in UI

1. **Check external servers are running**:
   ```bash
   next-inspector-server --ui-port 3001 --ws-port 8080
   ```

2. **Verify ports match**:
   - WebSocket port in `setupNextInstrument()` should match `--ws-port`
   - UI port should match `--ui-port`

3. **Check logs**:
   - Look for "✅ Using WebSocket library for external server connection" in console
   - Verify interceptors are enabled: "✅ Fetch interceptor enabled"
   - Look for "📡 [WEBSOCKET] Connected to external server" message

### Hot Reload Issues

The package handles hot reloads automatically. If you experience issues:

1. **Restart external servers**:
   ```bash
   # Stop servers (Ctrl+C)
   next-inspector-server --ui-port 3001 --ws-port 8080
   ```

2. **Clear browser cache** and refresh the UI

### Connection Issues

If WebSocket connection fails:

1. **Check server is running**:
   ```bash
   curl http://localhost:3001/ui
   ```

2. **Verify port availability**:
   ```bash
   lsof -i :8080
   ```

3. **Check connection logs**:
   - Look for "📡 [WEBSOCKET] Connected to external server" message
   - Check for "❌ [WEBSOCKET] Connection error" messages

### Mock Mode

If the WebSocket library is not available, the interceptors will use mock functions and log warnings. This ensures your app continues to work but without real-time monitoring.

**Expected behavior:**
- Console shows: "⚠️ Mock sendWS called - no WebSocket connection available"
- Interceptors still work but data is not sent anywhere
- App continues to function normally

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📞 Support

If you encounter any issues or have questions, please open an issue on our GitHub repository.