import { createServer, Server } from 'http';

function getStyle() {
    return `
    <style>
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --bg-tertiary: #e9ecef;
            --text-primary: #212529;
            --text-secondary: #6c757d;
            --text-muted: #adb5bd;
            --border-color: #dee2e6;
            --accent-color: #007bff;
            --success-color: #28a745;
            --warning-color: #ffc107;
            --error-color: #dc3545;
            --info-color: #17a2b8;
            --network-bg: #f5f5f5;
            --network-border: #d0d0d0;
            --network-header: #f0f0f0;
        }
        
        [data-theme="dark"] {
            --bg-primary: #0a0a0a;
            --bg-secondary: #1a1a1a;
            --bg-tertiary: #222;
            --text-primary: #e0e0e0;
            --text-secondary: #888;
            --text-muted: #666;
            --border-color: #333;
            --accent-color: #00d4ff;
            --success-color: #4caf50;
            --warning-color: #ff9800;
            --error-color: #f44336;
            --info-color: #2196f3;
            --network-bg: #1e1e1e;
            --network-border: #333;
            --network-header: #2a2a2a;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--network-bg);
            color: var(--text-primary);
            padding: 0;
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .header {
            background: var(--network-header);
            border-bottom: 1px solid var(--network-border);
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header h1 {
            color: var(--text-primary);
            font-size: 16px;
            font-weight: 500;
            margin: 0;
        }
        
        .header-controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        .theme-toggle {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s ease;
        }
        
        .theme-toggle:hover {
            background: var(--bg-tertiary);
        }
        
        .clear-btn {
            background: var(--error-color);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .clear-btn:hover {
            background: #c82333;
        }
        
        .clear-btn:disabled {
            background: var(--text-muted);
            cursor: not-allowed;
        }
        
        .reconnect-btn {
            background: var(--warning-color);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s ease;
            margin-right: 8px;
        }
        
        .reconnect-btn:hover {
            background: #e0a800;
        }
        
        .toolbar {
            background: var(--network-header);
            border-bottom: 1px solid var(--network-border);
            padding: 8px 16px;
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .filters {
            display: flex;
            gap: 4px;
        }
        
        .filter-btn {
            padding: 4px 8px;
            background: transparent;
            color: var(--text-primary);
            border: 1px solid transparent;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
            background: var(--bg-tertiary);
        }
        
        .filter-btn.active {
            background: var(--accent-color);
            color: white;
            border-color: var(--accent-color);
        }
        
        .stats {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-left: auto;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            color: var(--text-secondary);
        }
        
        .stat-number {
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .network-table {
            background: var(--bg-primary);
            border: 1px solid var(--network-border);
            border-radius: 0;
            overflow: hidden;
        }
        
        .network-header {
            background: var(--network-header);
            border-bottom: 1px solid var(--network-border);
            padding: 8px 16px;
            display: grid;
            grid-template-columns: 1fr 60px 50px 70px 80px;
            gap: 16px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .network-item {
            border-bottom: 1px solid var(--network-border);
            transition: background 0.1s ease;
        }
        
        .network-item:hover {
            background: var(--bg-tertiary);
        }
        
        .network-item:last-child {
            border-bottom: none;
        }
        
        .network-row {
            padding: 8px 16px;
            display: grid;
            grid-template-columns: 1fr 60px 50px 70px 80px;
            gap: 16px;
            align-items: center;
            cursor: pointer;
        }
        
        .network-url {
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 11px;
            color: var(--text-primary);
            word-break: break-all;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .network-method {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            text-align: center;
            width: 60px;
        }
        
        .method-GET { background: var(--success-color); color: white; }
        .method-POST { background: var(--warning-color); color: white; }
        .method-PUT { background: var(--info-color); color: white; }
        .method-DELETE { background: var(--error-color); color: white; }
        .method-PATCH { background: #9c27b0; color: white; }
        
        .network-status {
            font-size: 11px;
            font-weight: 500;
            text-align: center;
            width: 50px;
        }
        
        .status-2xx { color: var(--success-color); }
        .status-3xx { color: var(--warning-color); }
        .status-4xx { color: var(--error-color); }
        .status-5xx { color: var(--error-color); }
        
        .network-duration {
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 11px;
            color: var(--text-secondary);
            text-align: right;
            width: 70px;
        }
        
        .network-time {
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 10px;
            color: var(--text-muted);
            text-align: right;
            width: 80px;
        }
        
        .network-details {
            background: var(--bg-secondary);
            border-top: 1px solid var(--network-border);
            padding: 16px;
        }
        
        .details-section {
            margin-bottom: 16px;
        }
        
        .details-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .details-content {
            background: var(--bg-primary);
            padding: 12px;
            border-radius: 4px;
            border: 1px solid var(--network-border);
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 11px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .json-content-container {
            position: relative;
        }
        
        .json-content {
            white-space: pre-wrap;
            word-break: break-word;
            padding-right: 60px;
        }
        
        .copy-button {
            position: absolute;
            top: 8px;
            right: 8px;
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: 0.8;
        }
        
        .copy-button:hover {
            opacity: 1;
            background: var(--accent-color);
            transform: scale(1.05);
        }
        
        .copy-button:active {
            transform: scale(0.95);
        }
        
        .headers-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 8px;
        }
        
        .header-key {
            font-weight: 600;
            color: var(--accent-color);
        }
        
        .header-value {
            color: var(--text-primary);
        }
        
        .expand-icon {
            font-size: 10px;
            color: var(--text-muted);
            transition: transform 0.2s ease;
        }
        
        .expand-icon.expanded {
            transform: rotate(90deg);
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .error-item {
            background: var(--bg-secondary);
            border-left: 3px solid var(--error-color);
        }
        
        .error-message {
            color: var(--error-color);
            font-weight: 600;
        }
        
        .tabs-container {
            margin-top: 16px;
        }
        
        .tabs-header {
            display: flex;
            border-bottom: 1px solid var(--network-border);
            margin-bottom: 16px;
        }
        
        .tab-button {
            background: transparent;
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-secondary);
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }
        
        .tab-button:hover {
            color: var(--text-primary);
            background: var(--bg-tertiary);
        }
        
        .tab-button.active {
            color: var(--accent-color);
            border-bottom-color: var(--accent-color);
            background: var(--bg-primary);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .json-viewer {
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 11px;
            line-height: 1.4;
        }
        
        .json-key {
            color: var(--accent-color);
            font-weight: 600;
        }
        
        .json-string {
            color: var(--success-color);
        }
        
        .json-number {
            color: var(--info-color);
        }
        
        .json-boolean {
            color: var(--warning-color);
        }
        
        .json-null {
            color: var(--text-muted);
            font-style: italic;
        }
        
        .json-toggle {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-muted);
            font-size: 10px;
            margin-right: 4px;
            padding: 0;
            width: 12px;
            height: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        
        .json-toggle:hover {
            color: var(--text-primary);
        }
        
        .json-object {
            margin-left: 16px;
        }
        
        .json-array {
            margin-left: 16px;
        }
        
        .json-collapsed {
            display: none;
        }
        
        .json-expanded {
            display: block;
        }
        
        .json-bracket {
            color: var(--text-muted);
        }
        
        .json-comma {
            color: var(--text-muted);
        }
        
        @media (max-width: 768px) {
            .network-header,
            .network-row {
                grid-template-columns: 1fr;
                gap: 8px;
            }
            
            .network-method, .network-status, .network-duration, .network-time {
                text-align: left;
                width: auto;
            }
        }
    </style>
    `;
}

export function createUIServer(port: number, path: string = '/ui', wsPort: number = 8080): Server {
  const server = createServer((req, res) => {
    if (req.url === path) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getReactUIHTML(wsPort));
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

function getReactUIHTML(wsPort: number = 8080): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next Telescope - Network Monitor</title>
    ${getStyle()}
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useCallback } = React;

        // Types
        const FilterType = {
            ALL: 'all',
            GET: 'GET',
            POST: 'POST',
            PUT: 'PUT',
            DELETE: 'DELETE',
            ERROR: 'error'
        };

        // Custom Hooks
        function useWebSocket(wsPort, onMessage) {
            const [isConnected, setIsConnected] = useState(false);
            const [ws, setWs] = useState(null);
            const [reconnectAttempts, setReconnectAttempts] = useState(0);
            const [isReconnecting, setIsReconnecting] = useState(false);
            const [connectionError, setConnectionError] = useState(null);

            const connectWebSocket = () => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    return;
                }

                try {
                    setConnectionError(null);
                    const websocket = new WebSocket(\`ws://localhost:\${wsPort}\`);
                    
                    websocket.onopen = () => {
                        console.log(\`Connected to WebSocket on port \${wsPort}\`);
                        setIsConnected(true);
                        setWs(websocket);
                        setReconnectAttempts(0);
                        setIsReconnecting(false);
                        setConnectionError(null);
                    };
                    
                    websocket.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            onMessage(data);
                        } catch (e) {
                            console.error('Error parsing WebSocket message:', e);
                        }
                    };
                    
                    websocket.onclose = (event) => {
                        console.log('WebSocket disconnected:', event.code, event.reason);
                        setIsConnected(false);
                        setWs(null);
                        
                        // Only attempt reconnection if it wasn't a manual close
                        if (event.code !== 1000 && reconnectAttempts < 5) {
                            setIsReconnecting(true);
                            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Max 10 seconds
                            console.log(\`Attempting to reconnect in \${delay/1000} seconds... (attempt \${reconnectAttempts + 1}/5)\`);
                            
                            setTimeout(() => {
                                setReconnectAttempts(prev => prev + 1);
                                connectWebSocket();
                            }, delay);
                        } else if (reconnectAttempts >= 5) {
                            console.error('Max reconnection attempts reached.');
                            setIsReconnecting(false);
                            setConnectionError('Unable to connect to WebSocket server. Make sure the Next.js app is running with instrumentation enabled.');
                        }
                    };
                    
                    websocket.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        setIsConnected(false);
                        setIsReconnecting(false);
                        setConnectionError('WebSocket connection failed. Check if the server is running.');
                    };

                } catch (error) {
                    console.error('Failed to create WebSocket connection:', error);
                    setIsConnected(false);
                    setIsReconnecting(false);
                    setConnectionError('Failed to create WebSocket connection.');
                }
            };

            const manualReconnect = () => {
                setReconnectAttempts(0);
                setIsReconnecting(false);
                setConnectionError(null);
                connectWebSocket();
            };

            useEffect(() => {
                connectWebSocket();

                return () => {
                    if (ws) {
                        ws.close(1000, 'Component unmounting');
                    }
                };
            }, [wsPort]);

            return { isConnected, ws, isReconnecting, connectionError, manualReconnect };
        }

        function useTheme() {
            const [theme, setTheme] = useState('light');

            useEffect(() => {
                const savedTheme = localStorage.getItem('theme') || 'light';
                setTheme(savedTheme);
                document.documentElement.setAttribute('data-theme', savedTheme);
            }, []);

            const toggleTheme = () => {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                localStorage.setItem('theme', newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            };

            return { theme, toggleTheme };
        }

        // Components
        function Header({ onToggleTheme, onClearAll, theme, onReconnect, connectionError }) {
            return React.createElement('div', { className: 'header' },
                React.createElement('h1', null, '🔭 Next Telescope'),
                React.createElement('div', { className: 'header-controls' },
                    connectionError && React.createElement('button', { 
                        className: 'reconnect-btn', 
                        onClick: onReconnect,
                        title: 'Reconnect to WebSocket'
                    }, '🔄 Reconnect'),
                    React.createElement('button', { 
                        className: 'theme-toggle', 
                        onClick: onToggleTheme 
                    }, theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'),
                    React.createElement('button', { 
                        className: 'clear-btn', 
                        onClick: onClearAll 
                    }, '🗑️ Clear All')
                )
            );
        }

        function Toolbar({ filter, onFilterChange, stats, isConnected, isReconnecting }) {
            const filters = ['all', 'GET', 'POST', 'PUT', 'DELETE', 'error'];

            return React.createElement('div', { className: 'toolbar' },
                React.createElement('div', { className: 'filters' },
                    ...filters.map(filterType => 
                        React.createElement('button', {
                            key: filterType,
                            className: \`filter-btn \${filter === filterType ? 'active' : ''}\`,
                            onClick: () => onFilterChange(filterType)
                        }, filterType)
                    )
                ),
                React.createElement('div', { className: 'stats' },
                    React.createElement('div', { className: 'stat-item' },
                        React.createElement('span', { className: 'stat-number' }, stats.total),
                        React.createElement('span', null, 'requests')
                    ),
                    React.createElement('div', { className: 'stat-item' },
                        React.createElement('span', { className: 'stat-number' }, 
                            stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0
                        ),
                        React.createElement('span', null, 'success')
                    ),
                    React.createElement('div', { className: 'stat-item' },
                        React.createElement('span', { className: 'stat-number' }, \`\${stats.avgDuration}ms\`),
                        React.createElement('span', null, 'avg time')
                    ),
                    React.createElement('div', { className: 'stat-item' },
                        React.createElement('span', { className: 'stat-number' }, stats.errors),
                        React.createElement('span', null, 'errors')
                    ),
                    React.createElement('div', { className: 'stat-item' },
                        React.createElement('span', { 
                            className: 'stat-number', 
                            style: { 
                                color: isConnected ? 'var(--success-color)' : 
                                       isReconnecting ? 'var(--warning-color)' : 'var(--error-color)' 
                            }
                        }, isConnected ? '🟢' : isReconnecting ? '🟡' : '🔴'),
                        React.createElement('span', null, isConnected ? 'connected' : isReconnecting ? 'reconnecting...' : 'disconnected')
                    )
                )
            );
        }

        function NetworkItem({ request, isExpanded, onToggleExpand }) {
            const [activeTab, setActiveTab] = React.useState('details');
            
            const formatTime = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    fractionalSecondDigits: 3
                });
            };

            const JsonValue = ({ value, level = 0 }) => {
                const [isExpanded, setIsExpanded] = React.useState(level < 2);
                const toggleExpanded = () => setIsExpanded(!isExpanded);
                
                if (value === null) {
                    return React.createElement('span', { className: 'json-null' }, 'null');
                }
                
                if (typeof value === 'string') {
                    return React.createElement('span', { className: 'json-string' }, \`"\${value}"\`);
                }
                
                if (typeof value === 'number') {
                    return React.createElement('span', { className: 'json-number' }, value.toString());
                }
                
                if (typeof value === 'boolean') {
                    return React.createElement('span', { className: 'json-boolean' }, value.toString());
                }
                
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        return React.createElement('span', { className: 'json-bracket' }, '[]');
                    }
                    
                    return React.createElement('div', { className: 'json-array' },
                        React.createElement('button', { 
                            className: 'json-toggle',
                            onClick: toggleExpanded 
                        }, isExpanded ? '▼' : '▶'),
                        React.createElement('span', { className: 'json-bracket' }, '['),
                        isExpanded && React.createElement('div', { className: 'json-expanded' },
                            ...value.map((item, index) => 
                                React.createElement('div', { key: index },
                                    React.createElement(JsonValue, { value: item, level: level + 1 }),
                                    index < value.length - 1 && React.createElement('span', { className: 'json-comma' }, ',')
                                )
                            )
                        ),
                        !isExpanded && React.createElement('span', { className: 'json-bracket' }, '...'),
                        React.createElement('span', { className: 'json-bracket' }, ']')
                    );
                }
                
                if (typeof value === 'object') {
                    const entries = Object.entries(value);
                    
                    if (entries.length === 0) {
                        return React.createElement('span', { className: 'json-bracket' }, '{}');
                    }
                    
                    return React.createElement('div', { className: 'json-object' },
                        React.createElement('button', { 
                            className: 'json-toggle',
                            onClick: toggleExpanded 
                        }, isExpanded ? '▼' : '▶'),
                        React.createElement('span', { className: 'json-bracket' }, '{'),
                        isExpanded && React.createElement('div', { className: 'json-expanded' },
                            ...entries.map(([objKey, objValue], index) => 
                                React.createElement('div', { key: objKey },
                                    React.createElement('span', { className: 'json-key' }, \`"\${objKey}"\`),
                                    React.createElement('span', { className: 'json-bracket' }, ': '),
                                    React.createElement(JsonValue, { value: objValue, level: level + 1 }),
                                    index < entries.length - 1 && React.createElement('span', { className: 'json-comma' }, ',')
                                )
                            )
                        ),
                        !isExpanded && React.createElement('span', { className: 'json-bracket' }, '...'),
                        React.createElement('span', { className: 'json-bracket' }, '}')
                    );
                }
                
                return React.createElement('span', null, String(value));
            };

            const renderRequestDetails = (request) => {
                let details = '';
                
                if (request.urlParsed) {
                    details += \`
                        <div class="details-section">
                            <div class="details-title">URL Breakdown</div>
                            <div class="details-content">
                                <div><strong>Protocol:</strong> \${request.urlParsed.protocol}</div>
                                <div><strong>Host:</strong> \${request.urlParsed.hostname}\${request.urlParsed.port ? ':' + request.urlParsed.port : ''}</div>
                                <div><strong>Path:</strong> \${request.urlParsed.pathname}</div>
                                <div><strong>Query:</strong> \${request.urlParsed.search || 'N/A'}</div>
                                <div><strong>Hash:</strong> \${request.urlParsed.hash || 'N/A'}</div>
                            </div>
                        </div>
                    \`;
                }
                
                if (request.urlParams && Object.keys(request.urlParams).length > 0) {
                    details += \`
                        <div class="details-section">
                            <div class="details-title">URL Parameters</div>
                            <div class="details-content">
                                <div class="headers-grid">
                                    \${Object.entries(request.urlParams).map(([key, value]) => 
                                        \`<div class="header-key">\${key}:</div><div class="header-value">\${value}</div>\`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    \`;
                }
                
                if (request.requestHeaders && Object.keys(request.requestHeaders).length > 0) {
                    details += \`
                        <div class="details-section">
                            <div class="details-title">Request Headers</div>
                            <div class="details-content">
                                <div class="headers-grid">
                                    \${Object.entries(request.requestHeaders).map(([key, value]) => 
                                        \`<div class="header-key">\${key}:</div><div class="header-value">\${value}</div>\`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    \`;
                }
                
                if (request.responseHeaders && Object.keys(request.responseHeaders).length > 0) {
                    details += \`
                        <div class="details-section">
                            <div class="details-title">Response Headers</div>
                            <div class="details-content">
                                <div class="headers-grid">
                                    \${Object.entries(request.responseHeaders).map(([key, value]) => 
                                        \`<div class="header-key">\${key}:</div><div class="header-value">\${value}</div>\`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    \`;
                }
                
                if (request.startTime && request.endTime) {
                    details += \`
                        <div class="details-section">
                            <div class="details-title">Timing Information</div>
                            <div class="details-content">
                                <div><strong>Start Time:</strong> \${new Date(request.startDate).toLocaleString()}</div>
                                <div><strong>End Time:</strong> \${new Date(request.endDate || '').toLocaleString()}</div>
                                <div><strong>Duration:</strong> \${request.duration}</div>
                                <div><strong>Start Timestamp:</strong> \${request.startTime.toFixed(2)}ms</div>
                                <div><strong>End Timestamp:</strong> \${request.endTime.toFixed(2)}ms</div>
                            </div>
                        </div>
                    \`;
                }
                
                return details;
            };

            const renderResponseBody = (request) => {
                if (!request.responseBody) {
                    return React.createElement('div', { className: 'no-data' }, 'No response body');
                }
                
                try {
                    let parsedBody;
                    if (typeof request.responseBody === 'string') {
                        parsedBody = JSON.parse(request.responseBody);
                    } else {
                        parsedBody = request.responseBody;
                    }
                    
                    return React.createElement('div', { className: 'json-viewer' },
                        React.createElement(JsonValue, { value: parsedBody })
                    );
                } catch (e) {
                    return React.createElement('div', { className: 'details-content' },
                        React.createElement('pre', { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, 
                            typeof request.responseBody === 'string' ? request.responseBody : JSON.stringify(request.responseBody, null, 2)
                        )
                    );
                }
            };

            if (request.type === 'fetch_error') {
                return React.createElement('div', { 
                    className: 'network-item error-item', 
                    'data-id': request.id 
                },
                    React.createElement('div', { 
                        className: 'network-row', 
                        onClick: () => onToggleExpand(request.id) 
                    },
                        React.createElement('div', { className: 'network-url' },
                            React.createElement('span', { 
                                className: \`expand-icon \${isExpanded ? 'expanded' : ''}\` 
                            }, '▶'),
                            React.createElement('span', null, request.url)
                        ),
                        React.createElement('div', { 
                            className: \`network-method method-\${request.method}\` 
                        }, request.method),
                        React.createElement('div', { 
                            className: 'network-status', 
                            style: { color: 'var(--error-color)' } 
                        }, 'ERROR'),
                        React.createElement('div', { className: 'network-duration' }, request.duration),
                        React.createElement('div', { className: 'network-time' }, formatTime(request.startDate))
                    ),
                    isExpanded && React.createElement('div', { className: 'network-details' },
                        React.createElement('div', { className: 'error-message' }, \`Error: \${request.error}\`),
                        React.createElement('div', { className: 'tabs-container' },
                            React.createElement('div', { className: 'tabs-header' },
                                React.createElement('button', {
                                    className: \`tab-button \${activeTab === 'details' ? 'active' : ''}\`,
                                    onClick: () => setActiveTab('details')
                                }, 'Details')
                            ),
                            React.createElement('div', { 
                                className: \`tab-content \${activeTab === 'details' ? 'active' : ''}\`
                            },
                                React.createElement('div', { 
                                    dangerouslySetInnerHTML: { __html: renderRequestDetails(request) } 
                                })
                            )
                        )
                    )
                );
            }

            const statusClass = request.status && request.status >= 200 && request.status < 300 ? 'status-2xx' :
                              request.status && request.status >= 300 && request.status < 400 ? 'status-3xx' :
                              request.status && request.status >= 400 && request.status < 500 ? 'status-4xx' : 'status-5xx';

            return React.createElement('div', { 
                className: 'network-item', 
                'data-id': request.id 
            },
                React.createElement('div', { 
                    className: 'network-row', 
                    onClick: () => onToggleExpand(request.id) 
                },
                    React.createElement('div', { className: 'network-url' },
                        React.createElement('span', { 
                            className: \`expand-icon \${isExpanded ? 'expanded' : ''}\` 
                        }, '▶'),
                        React.createElement('span', null, request.url)
                    ),
                    React.createElement('div', { 
                        className: \`network-method method-\${request.method}\` 
                    }, request.method),
                    React.createElement('div', { 
                        className: \`network-status \${statusClass}\` 
                    }, request.status),
                    React.createElement('div', { className: 'network-duration' }, request.duration),
                    React.createElement('div', { className: 'network-time' }, formatTime(request.startDate))
                ),
                isExpanded && React.createElement('div', { className: 'network-details' },
                    React.createElement('div', { className: 'tabs-container' },
                        React.createElement('div', { className: 'tabs-header' },
                            React.createElement('button', {
                                className: \`tab-button \${activeTab === 'details' ? 'active' : ''}\`,
                                onClick: () => setActiveTab('details')
                            }, 'Details'),
                            React.createElement('button', {
                                className: \`tab-button \${activeTab === 'response' ? 'active' : ''}\`,
                                onClick: () => setActiveTab('response')
                            }, 'Response Body')
                        ),
                        React.createElement('div', { 
                            className: \`tab-content \${activeTab === 'details' ? 'active' : ''}\`
                        },
                            React.createElement('div', { 
                                dangerouslySetInnerHTML: { __html: renderRequestDetails(request) } 
                            })
                        ),
                        React.createElement('div', { 
                            className: \`tab-content \${activeTab === 'response' ? 'active' : ''}\`
                        },
                            renderResponseBody(request)
                        )
                    )
                )
            );
        }

        function NetworkTable({ requests, expandedItems, onToggleExpand }) {
            if (requests.length === 0) {
                return React.createElement('div', { className: 'network-table' },
                    React.createElement('div', { className: 'network-header' },
                        React.createElement('div', null, 'Name'),
                        React.createElement('div', null, 'Method'),
                        React.createElement('div', null, 'Status'),
                        React.createElement('div', null, 'Duration'),
                        React.createElement('div', null, 'Time')
                    ),
                    React.createElement('div', { className: 'no-data' }, 'Waiting for requests...')
                );
            }

            return React.createElement('div', { className: 'network-table' },
                React.createElement('div', { className: 'network-header' },
                    React.createElement('div', null, 'Name'),
                    React.createElement('div', null, 'Method'),
                    React.createElement('div', null, 'Status'),
                    React.createElement('div', null, 'Duration'),
                    React.createElement('div', null, 'Time')
                ),
                React.createElement('div', { id: 'network-list' },
                    ...requests.map(request => 
                        React.createElement(NetworkItem, {
                            key: request.id,
                            request: request,
                            isExpanded: expandedItems.has(request.id),
                            onToggleExpand: onToggleExpand
                        })
                    )
                )
            );
        }

        function App({ wsPort }) {
            const [requests, setRequests] = useState([]);
            const [filter, setFilter] = useState('all');
            const [expandedItems, setExpandedItems] = useState(new Set());
            
            const { theme, toggleTheme } = useTheme();
            const { isConnected, isReconnecting, connectionError, manualReconnect } = useWebSocket(wsPort, (data) => {
                if (data.type === 'fetch' || data.type === 'fetch_error') {
                    const request = {
                        ...data.payload,
                        type: data.type,
                        id: data.payload.id || 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
                    };
                    
                    setRequests(prev => [...prev, request]);
                }
            });

            const clearAllRequests = useCallback(() => {
                setRequests([]);
                setExpandedItems(new Set());
            }, []);

            const toggleExpand = useCallback((requestId) => {
                setExpandedItems(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(requestId)) {
                        newSet.delete(requestId);
                    } else {
                        newSet.add(requestId);
                    }
                    return newSet;
                });
            }, []);

            const filteredRequests = requests.filter(request => {
                if (filter === 'error') {
                    return request.type === 'fetch_error';
                } else if (filter !== 'all') {
                    return request.method === filter;
                }
                return true;
            });

            const stats = {
                total: requests.length,
                successful: requests.filter(r => r.type === 'fetch' && r.status >= 200 && r.status < 300).length,
                errors: requests.filter(r => r.type === 'fetch_error').length,
                avgDuration: requests.length > 0 
                    ? Math.round(
                        requests
                            .filter(r => r.duration)
                            .map(r => parseFloat(r.duration.replace(' ms', '')))
                            .reduce((a, b) => a + b, 0) / requests.filter(r => r.duration).length
                    )
                    : 0
            };

            return React.createElement('div', { 'data-theme': theme },
                React.createElement(Header, { 
                    onToggleTheme: toggleTheme,
                    onClearAll: clearAllRequests,
                    theme: theme,
                    onReconnect: manualReconnect,
                    connectionError: connectionError
                }),
                connectionError && React.createElement('div', { 
                    className: 'error-banner',
                    style: {
                        background: 'var(--error-color)',
                        color: 'white',
                        padding: '8px 16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '500'
                    }
                }, connectionError),
                React.createElement(Toolbar, { 
                    filter: filter,
                    onFilterChange: setFilter,
                    stats: stats,
                    isConnected: isConnected,
                    isReconnecting: isReconnecting
                }),
                React.createElement(NetworkTable, { 
                    requests: filteredRequests,
                    expandedItems: expandedItems,
                    onToggleExpand: toggleExpand
                })
            );
        }

        // Render the app using React 18 createRoot API
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App, { wsPort: ${wsPort} }));
    </script>
</body>
</html>
  `;
}
