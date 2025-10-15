import { sendWS, getGlobalWsServer } from './../wsServer';
import type { WebSocketServer } from 'ws';

// Helper function to extract request headers
function extractRequestHeaders(headers: any): Record<string, string> {
  const requestHeaders: Record<string, string> = {};
  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        requestHeaders[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        requestHeaders[key] = value;
      });
    } else {
      Object.assign(requestHeaders, headers);
    }
  }
  return requestHeaders;
}

// Helper function to extract URL parameters
function extractUrlParams(url: string | URL): Record<string, string> {
  const urlObj = new URL(url.toString());
  const urlParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    urlParams[key] = value;
  });
  return urlParams;
}

// Helper function to extract request body
function extractRequestBody(body: any): string | null {
  if (!body) return null;
  
  try {
    if (typeof body === 'string') {
      return body;
    } else if (body instanceof FormData) {
      return '[FormData]';
    } else if (body instanceof Blob) {
      return '[Blob]';
    } else {
      return JSON.stringify(body);
    }
  } catch (e) {
    return '[Unparseable Body]';
  }
}

// Helper function to extract response body
async function extractResponseBody(response: Response): Promise<any> {
  try {
    const clonedRes = response.clone();
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await clonedRes.json();
    } else if (contentType.includes('text/')) {
      return await clonedRes.text();
    } else {
      return '[Binary Data]';
    }
  } catch (e) {
    return '[Unable to parse response]';
  }
}

// Helper function to create URL parsed object
function createUrlParsed(url: string | URL) {
  const urlObj = new URL(url.toString());
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port,
    pathname: urlObj.pathname,
    search: urlObj.search,
    hash: urlObj.hash
  };
}

// Helper function to create base request info
function createBaseRequestInfo(url: string | URL | Request, options: RequestInit, startTime: number, startDate: Date) {
  const urlString = url.toString();
  const urlObj = new URL(urlString);
  
  return {
    id: Date.now() + Math.random(),
    url: urlString,
    method: options.method || 'GET',
    startTime,
    startDate: startDate.toISOString(),
    timestamp: startDate.toISOString(),
    requestHeaders: extractRequestHeaders(options.headers),
    urlParams: extractUrlParams(urlString),
    requestBody: extractRequestBody(options.body),
    urlParsed: createUrlParsed(urlString)
  };
}

export function interceptFetch(
  wsServer: WebSocketServer | undefined,
  fetchGroupInterval: number = 20000
) {
  if (typeof global.fetch !== 'function') {
    console.log('❌ [FETCH_INTERCEPTOR] Global fetch not available');
    return;
  }

  console.log('🔧 [FETCH_INTERCEPTOR] Setting up fetch interceptor');
  console.log('🔧 [FETCH_INTERCEPTOR] WebSocket server available:', !!wsServer);

  const originalFetch = global.fetch;
  const fetchLogs: any[] = [];
  const processedRequests = new Set<string>();

  global.fetch = async (...args) => {
    const startTime = performance.now();
    const startDate = new Date();
    const url = args[0];
    const options = args[1] || {};
    
    // Create a unique request identifier to prevent duplicates
    const requestId = `${url}_${options.method || 'GET'}_${startTime}`;
    
    console.log(`🌐 [FETCH_INTERCEPTOR] Intercepting fetch request: ${options.method || 'GET'} ${url}`);
    
    // Skip if this request was already processed
    if (processedRequests.has(requestId)) {
      console.log(`⏭️ [FETCH_INTERCEPTOR] Skipping duplicate request: ${requestId}`);
      return originalFetch(...args);
    }
    
    processedRequests.add(requestId);
    
    try {
      const res = await originalFetch(...args);
      const endTime = performance.now();
      const endDate = new Date();
      const duration = endTime - startTime;

      console.log(`✅ [FETCH_INTERCEPTOR] Request completed: ${res.status} ${res.statusText} (${duration.toFixed(2)}ms)`);

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Extract response body
      const responseBody = await extractResponseBody(res);

      const info = {
        ...createBaseRequestInfo(url, options, startTime, startDate),
        status: res.status,
        statusText: res.statusText,
        duration: `${duration.toFixed(2)} ms`,
        endTime,
        endDate: endDate.toISOString(),
        responseHeaders,
        responseBody
      };

      fetchLogs.push(info);
      
      // Usar el servidor WebSocket global si está disponible
      const currentWsServer = wsServer || getGlobalWsServer() || undefined;
      console.log(`📤 [FETCH_INTERCEPTOR] Sending fetch data via WebSocket. Server available: ${!!currentWsServer}`);
      sendWS(currentWsServer, { type: 'fetch', payload: info });

      return res;
    } catch (error: any) {
      const endTime = performance.now();
      const endDate = new Date();
      const duration = endTime - startTime;

      console.log(`❌ [FETCH_INTERCEPTOR] Request failed: ${error.message} (${duration.toFixed(2)}ms)`);

      const errInfo = {
        ...createBaseRequestInfo(url, options, startTime, startDate),
        error: error.message,
        duration: `${duration.toFixed(2)} ms`,
        endTime,
        endDate: endDate.toISOString()
      };

      fetchLogs.push(errInfo);
      
      // Usar el servidor WebSocket global si está disponible
      const currentWsServer = wsServer || getGlobalWsServer() || undefined;
      console.log(`📤 [FETCH_INTERCEPTOR] Sending fetch error via WebSocket. Server available: ${!!currentWsServer}`);
      sendWS(currentWsServer, { type: 'fetch_error', payload: errInfo });
      throw error;
    } finally {
      // Clean up the request ID after a delay to allow for retries
      setTimeout(() => {
        processedRequests.delete(requestId);
      }, 1000);
    }
  };
}
