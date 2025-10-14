import { createServer, Server } from 'http';
import { WebSocketServer } from 'ws';

export function createUIServer(port: number, path: string = '/ui'): Server {
  const server = createServer((req, res) => {
    if (req.url === path) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getUIHTML());
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(port, () => {
    console.log(`🌐 next-instrument UI available at http://localhost:${port}${path}`);
  });

  return server;
}

function getUIHTML(): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next Telescope - Fetch Monitor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #00d4ff;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #888;
            font-size: 1.1rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #333;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #00d4ff;
        }
        
        .stat-label {
            color: #888;
            margin-top: 5px;
        }
        
        .filters {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 16px;
            background: #333;
            color: #e0e0e0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .filter-btn:hover {
            background: #444;
        }
        
        .filter-btn.active {
            background: #00d4ff;
            color: #000;
        }
        
        .fetch-list {
            background: #1a1a1a;
            border-radius: 8px;
            border: 1px solid #333;
            overflow: hidden;
        }
        
        .fetch-item {
            padding: 15px 20px;
            border-bottom: 1px solid #333;
            display: grid;
            grid-template-columns: 1fr auto auto auto;
            gap: 20px;
            align-items: center;
            transition: background 0.2s;
        }
        
        .fetch-item:hover {
            background: #222;
        }
        
        .fetch-item:last-child {
            border-bottom: none;
        }
        
        .fetch-url {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            word-break: break-all;
        }
        
        .fetch-method {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            text-align: center;
            min-width: 60px;
        }
        
        .method-GET { background: #4caf50; color: white; }
        .method-POST { background: #ff9800; color: white; }
        .method-PUT { background: #2196f3; color: white; }
        .method-DELETE { background: #f44336; color: white; }
        .method-PATCH { background: #9c27b0; color: white; }
        
        .fetch-status {
            font-weight: bold;
            text-align: center;
            min-width: 50px;
        }
        
        .status-2xx { color: #4caf50; }
        .status-3xx { color: #ff9800; }
        .status-4xx { color: #f44336; }
        .status-5xx { color: #f44336; }
        
        .fetch-duration {
            font-family: 'Monaco', 'Menlo', monospace;
            color: #888;
            text-align: right;
            min-width: 80px;
        }
        
        .timestamp {
            font-size: 0.8rem;
            color: #666;
            margin-top: 5px;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .error-item {
            background: #2a1a1a;
            border-left: 4px solid #f44336;
        }
        
        .error-message {
            color: #f44336;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            .fetch-item {
                grid-template-columns: 1fr;
                gap: 10px;
            }
            
            .fetch-method, .fetch-status, .fetch-duration {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔭 Next Telescope</h1>
        <p>Monitor de Fetch Requests en Tiempo Real</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number" id="total-requests">0</div>
            <div class="stat-label">Total Requests</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="success-rate">0%</div>
            <div class="stat-label">Success Rate</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="avg-duration">0ms</div>
            <div class="stat-label">Avg Duration</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="errors">0</div>
            <div class="stat-label">Errors</div>
        </div>
    </div>
    
    <div class="filters">
        <button class="filter-btn active" data-filter="all">Todos</button>
        <button class="filter-btn" data-filter="GET">GET</button>
        <button class="filter-btn" data-filter="POST">POST</button>
        <button class="filter-btn" data-filter="PUT">PUT</button>
        <button class="filter-btn" data-filter="DELETE">DELETE</button>
        <button class="filter-btn" data-filter="error">Errores</button>
    </div>
    
    <div class="fetch-list" id="fetch-list">
        <div class="no-data">
            Esperando requests...
        </div>
    </div>

    <script>
        let allRequests = [];
        let ws;
        
        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:8000');
            
            ws.onopen = function() {
                console.log('Conectado al WebSocket');
            };
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                
                if (data.type === 'fetch' || data.type === 'fetch_error') {
                    const request = {
                        ...data.payload,
                        type: data.type,
                        id: Date.now() + Math.random()
                    };
                    
                    allRequests.unshift(request);
                    updateUI();
                }
            };
            
            ws.onclose = function() {
                console.log('WebSocket desconectado, reconectando...');
                setTimeout(connectWebSocket, 3000);
            };
            
            ws.onerror = function(error) {
                console.error('Error WebSocket:', error);
            };
        }
        
        function updateUI() {
            updateStats();
            renderRequests();
        }
        
        function updateStats() {
            const total = allRequests.length;
            const successful = allRequests.filter(r => r.type === 'fetch' && r.status >= 200 && r.status < 300).length;
            const errors = allRequests.filter(r => r.type === 'fetch_error').length;
            const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
            
            const durations = allRequests
                .filter(r => r.duration)
                .map(r => parseFloat(r.duration.replace(' ms', '')));
            const avgDuration = durations.length > 0 
                ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
                : 0;
            
            document.getElementById('total-requests').textContent = total;
            document.getElementById('success-rate').textContent = successRate + '%';
            document.getElementById('avg-duration').textContent = avgDuration + 'ms';
            document.getElementById('errors').textContent = errors;
        }
        
        function renderRequests() {
            const filter = document.querySelector('.filter-btn.active').dataset.filter;
            const container = document.getElementById('fetch-list');
            
            let filteredRequests = allRequests;
            
            if (filter === 'error') {
                filteredRequests = allRequests.filter(r => r.type === 'fetch_error');
            } else if (filter !== 'all') {
                filteredRequests = allRequests.filter(r => r.method === filter);
            }
            
            if (filteredRequests.length === 0) {
                container.innerHTML = '<div class="no-data">No hay requests que coincidan con el filtro</div>';
                return;
            }
            
            container.innerHTML = filteredRequests.map(request => {
                if (request.type === 'fetch_error') {
                    return \`
                        <div class="fetch-item error-item">
                            <div>
                                <div class="fetch-url">\${request.url}</div>
                                <div class="error-message">Error: \${request.error}</div>
                                <div class="timestamp">\${new Date(request.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="fetch-method method-\${request.method}">\${request.method}</div>
                            <div class="fetch-status" style="color: #f44336;">ERROR</div>
                            <div class="fetch-duration">-</div>
                        </div>
                    \`;
                }
                
                const statusClass = request.status >= 200 && request.status < 300 ? 'status-2xx' :
                                  request.status >= 300 && request.status < 400 ? 'status-3xx' :
                                  request.status >= 400 && request.status < 500 ? 'status-4xx' : 'status-5xx';
                
                return \`
                    <div class="fetch-item">
                        <div>
                            <div class="fetch-url">\${request.url}</div>
                            <div class="timestamp">\${new Date(request.timestamp).toLocaleString()}</div>
                        </div>
                        <div class="fetch-method method-\${request.method}">\${request.method}</div>
                        <div class="fetch-status \${statusClass}">\${request.status}</div>
                        <div class="fetch-duration">\${request.duration}</div>
                    </div>
                \`;
            }).join('');
        }
        
        // Event listeners
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                renderRequests();
            });
        });
        
        // Inicializar
        connectWebSocket();
    </script>
</body>
</html>
  `;
}
