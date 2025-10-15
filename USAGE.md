# Usage Guide

## Quick Start

### 1. Installation

> ⚠️ **Development Only**: This package is designed exclusively for development environments. Do not install in production.

```bash
npm install --save-dev next-http-server-inspector
```

### 2. Next.js Setup

Create `instrumentation.ts` in your project root:

```typescript
import { setupNextInstrument } from 'next-http-server-inspector';

export async function register() {
  setupNextInstrument({
    logFetch: true,        // Capture fetch requests
    logConsole: true,      // Capture console.log
    logErrors: true,       // Capture errors
    websocket: { 
      enabled: true, 
      port: 8080           // WebSocket port
    },
    ui: {
      enabled: true,
      port: 3001,          // UI port
      path: '/ui'          // UI path
    }
  });
  
  console.log('🚀 Next Http Server Inspector initialized!');
  console.log('📊 UI available at: http://localhost:3001/ui');
}
```

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
```

### 3. Run Your Application

```bash
npm run dev
```

### 4. Open the UI

Navigate to `http://localhost:3001/ui` to see the monitoring dashboard.

## Features Overview

### 🖥️ Dashboard Interface

The dashboard provides a Chrome DevTools-style interface with:

- **Request List**: All HTTP requests in chronological order
- **Real-time Updates**: New requests appear instantly
- **Filtering**: Filter by HTTP method or errors
- **Statistics**: Live metrics including success rate and average duration
- **Theme Toggle**: Switch between light and dark modes

### 📑 Request Details

Each request can be expanded to show detailed information in two tabs:

#### Details Tab
- **URL Breakdown**: Protocol, host, path, query parameters, hash
- **Request Headers**: All request headers sent
- **Response Headers**: All response headers received
- **Timing Information**: Start/end times, duration, timestamps

#### Response Body Tab
- **Interactive JSON Viewer**: 
  - Syntax highlighting
  - Expandable/collapsible objects and arrays
  - Smart defaults (first 2 levels expanded)
  - Visual indicators for different data types

### 🔄 Connection Management

- **Auto Reconnection**: Automatically retries connection with exponential backoff
- **Manual Retry**: Click "🔄 Reconnect" button if connection fails
- **Status Indicators**:
  - 🟢 Connected
  - 🟡 Reconnecting
  - 🔴 Disconnected

## Configuration Options

```typescript
interface InstrumentOptions {
  logFetch?: boolean;           // Show fetch requests in UI
  logConsole?: boolean;         // Show console.log in terminal
  logErrors?: boolean;          // Show errors in terminal
  websocket?: {
    enabled: boolean;
    port: number;
  };
  ui?: {
    enabled: boolean;
    port: number;
    path: string;
  };
  fetchGroupInterval?: number;  // Grouping interval for logs (ms)
}
```

## Troubleshooting

### Requests Not Appearing

1. **Check Configuration**:
   - Ensure `instrumentation.ts` is in project root
   - Verify `next.config.js` has `instrumentationHook: true`
   - Restart Next.js development server

2. **Check Ports**:
   - WebSocket port 8080 should be available
   - UI port 3001 should be available
   - Change ports if needed

3. **Check WebSocket Connection**:
   - Open browser dev tools
   - Look for "Connected to WebSocket on port 8080" message
   - Check for connection errors

### UI Not Loading

1. **Verify UI Configuration**:
   - Ensure `ui: { enabled: true }`
   - Check if port 3001 is available
   - Try different port: `ui: { port: 3002 }`

2. **Check Browser Console**:
   - Look for JavaScript errors
   - Verify React and Babel scripts are loading

### Performance Issues

1. **Reduce Logging**:
   - Disable console logging: `logConsole: false`
   - Disable error logging: `logErrors: false`

2. **Adjust Grouping**:
   - Increase `fetchGroupInterval` to reduce frequency
   - Default is 20000ms (20 seconds)

## Advanced Usage

### Custom Ports

```typescript
setupNextInstrument({
  websocket: { enabled: true, port: 8081 },
  ui: { enabled: true, port: 3002, path: '/monitor' }
});
```

### Disable Features

```typescript
setupNextInstrument({
  logFetch: true,        // Keep network monitoring
  logConsole: false,     // Disable console logging
  logErrors: false,      // Disable error logging
  websocket: { enabled: true, port: 8080 },
  ui: { enabled: true, port: 3001, path: '/ui' }
});
```

### Production Considerations

- Only enable in development environments
- Consider disabling in production builds
- Monitor resource usage with high request volumes
- Use appropriate port configurations for your environment

## Examples

### API Route Example

```typescript
// pages/api/users.ts
export default async function handler(req, res) {
  // This fetch will appear in the UI
  const response = await fetch('https://jsonplaceholder.typicode.com/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123'
    }
  });
  
  const data = await response.json();
  console.log('✅ Users fetched:', data.length); // Appears in console
  
  res.status(200).json(data);
}
```

### Server Component Example

```typescript
// app/users/page.tsx
export default async function UsersPage() {
  // This fetch will appear in the UI
  const response = await fetch('https://jsonplaceholder.typicode.com/users', {
    cache: 'no-store'
  });
  
  const users = await response.json();
  
  return (
    <div>
      <h1>Users ({users.length})</h1>
      {/* Render users */}
    </div>
  );
}
```
