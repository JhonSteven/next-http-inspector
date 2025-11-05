# Next Http Inspector

**Fetch interceptor for Next.js** that connects directly to external WebSocket servers (dev-only).

This package provides a fetch interceptor that captures HTTP requests and responses, connecting directly to external WebSocket servers for real-time monitoring.

## 🎯 Focus

This package **connects directly** to external WebSocket servers using only the `ws` library. It does not require any external packages and creates its own WebSocket client connections.

## ✨ Features

- 🔍 **Fetch Interceptor**: Captures all HTTP requests and responses
- 📡 **Direct WebSocket Connection**: Connects directly to external servers
- 🛡️ **Development Only**: Automatically disabled in production
- 🚀 **Zero External Dependencies**: Only requires `ws` library
- 🔒 **Single Initialization**: Prevents multiple initializations automatically

## 🚀 Installation

> ⚠️ **Development Only**: This package is designed exclusively for development environments. Do not install in production.

```bash
npm install --save-dev next-http-inspector
```

## 📖 Usage

### For Next.js

1. **Initialize in your root layout** (server-side only):

```typescript
// app/layout.tsx (or pages/_app.tsx for Pages Router)
import { initFetchServerInterceptor } from 'next-http-inspector';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize only on server side
  if (typeof window === 'undefined') {
    initFetchServerInterceptor({
      websocket: { enabled: true, port: 8080 },
      http: { enabled: true, host: 'localhost', port: 3001, endpoint: '/api/logs' }
    });
  }

  return (
    <html>
      <body>{children}</body>
    </html>
  );
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
initFetchServerInterceptor({
  websocket: {
    enabled: true,          // Enable WebSocket connection
    port: 8080             // WebSocket port
  },
  http: {
    enabled: true,         // Enable HTTP fallback
    host: 'localhost',     // HTTP server host
    port: 3001,            // HTTP server port
    endpoint: '/api/logs'  // HTTP endpoint
  },
  fetch: global.fetch  // Optional: custom fetch function
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
- Single initialization prevents duplicate setup

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
├── index.ts                    # Main initFetchServerInterceptor function
├── types.ts                    # TypeScript definitions
└── interceptors/
    └── fetchInterceptor.ts      # HTTP request/response interceptor
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
   - WebSocket port in `initFetchServerInterceptor()` should match `--ws-port`
   - UI port should match `--ui-port`

3. **Check logs**:
   - Look for "🚀 Initializing Fetch Server Interceptor..." in console
   - Verify interceptor is enabled: "✅ Fetch Server Interceptor initialized successfully!"

### Initialization Issues

The package automatically prevents multiple initializations. If you need to reinitialize:

1. **Restart your Next.js app**:
   ```bash
   # Stop app (Ctrl+C)
   npm run dev
   ```

2. **Ensure initialization happens only on server side**:
   ```typescript
   if (typeof window === 'undefined') {
    initFetchServerInterceptor({ ... });
  }
   ```

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
   - Look for WebSocket connection messages in console
   - HTTP fallback will be used automatically if WebSocket fails

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📞 Support

If you encounter any issues or have questions, please open an issue on our GitHub repository.
