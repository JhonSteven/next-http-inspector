# @jhonparra/next-instrument

Next.js instrumentation toolkit — captures logs, requests, errors and metrics in real-time during development.

## 🚀 Installation

```bash
npm install next-telescope
```

## 📖 Usage

```javascript
import { setupNextInstrument } from 'next-telescope';

// Configurar el instrumento
const { wsServer, uiServer } = setupNextInstrument({
  logFetch: true,        // Los fetchs se muestran en la UI web
  logConsole: true,      // Los console.log se muestran en consola
  logErrors: true,       // Los errores se muestran en consola
  websocket: {
    enabled: true,
    port: 8000
  },
  ui: {
    enabled: true,
    port: 3001,
    path: '/ui'
  }
});

console.log('🚀 Next Telescope iniciado!');
console.log('📊 UI disponible en: http://localhost:3001/ui');
```

## ✨ Features

### 🖥️ Web UI Dashboard
- **URL**: `http://localhost:3001/ui` (configurable)
- **Fetch Monitoring**: Visualiza todas las requests HTTP en tiempo real
- **Filtros**: Por método (GET, POST, PUT, DELETE) y errores
- **Estadísticas**: Total de requests, tasa de éxito, duración promedio
- **Diseño Responsivo**: Funciona en desktop y móvil

### 📝 Console Logging
- Los `console.log()` aparecen en la consola del terminal
- Los fetchs **NO** aparecen en consola (solo en la UI web)
- Los errores se muestran en consola

### 🔌 WebSocket Server
- Servidor WebSocket en puerto 8000 (configurable)
- Comunicación en tiempo real entre la aplicación y la UI

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
  websocket: { enabled: true, port: 8000 },
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

## 📊 UI Features

- **Tiempo Real**: Los fetchs aparecen instantáneamente
- **Filtros Inteligentes**: Filtra por método HTTP o errores
- **Estadísticas en Vivo**: Contadores actualizados en tiempo real
- **Diseño Moderno**: Interfaz oscura y profesional
- **Responsive**: Se adapta a cualquier tamaño de pantalla