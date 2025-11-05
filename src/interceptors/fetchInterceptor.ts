// Type declaration for global state
declare global {
  var __next_http_inspector_fetch_interceptor__: {
    isInstalled: boolean;
    originalFetch: typeof global.fetch | null;
  } | undefined;
}

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
  // Convertir url a string de forma segura
  let urlString: string;
  let method: string;
  let headers: any;
  let body: any;
  
  if (typeof url === 'string') {
    urlString = url;
    method = options.method || 'GET';
    headers = options.headers;
    body = options.body;
  } else if (url instanceof URL) {
    urlString = url.toString();
    method = options.method || 'GET';
    headers = options.headers;
    body = options.body;
  } else if (url instanceof Request) {
    urlString = url.url;
    method = options.method || url.method || 'GET';
    // Si hay headers en options, los combinamos con los del Request
    headers = options.headers || url.headers;
    body = options.body !== undefined ? options.body : url.body;
  } else {
    urlString = String(url);
    method = options.method || 'GET';
    headers = options.headers;
    body = options.body;
  }
  
  const urlObj = new URL(urlString);
  
  return {
    id: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    url: urlString,
    method,
    startTime,
    startDate: startDate.toISOString(),
    timestamp: startDate.toISOString(),
    requestHeaders: extractRequestHeaders(headers),
    urlParams: extractUrlParams(urlString),
    requestBody: extractRequestBody(body),
    urlParsed: createUrlParsed(urlString)
  };
}

// Global state to track if interceptor is already installed
// Using global to persist across hot reloads
const INTERCEPTOR_KEY = '__next_http_inspector_fetch_interceptor__';

function getInterceptorState() {
  if (!global[INTERCEPTOR_KEY]) {
    global[INTERCEPTOR_KEY] = {
      isInstalled: false,
      originalFetch: null
    };
  }
  return global[INTERCEPTOR_KEY];
}

export function interceptFetch(
  sendWS: (data: any) => void,
  httpConfig?: { host: string; port: number; endpoint: string } | null,
  fetch?: typeof global.fetch | null
) {
  // Usar fetch pasado o el por defecto
  const fetchToUse = fetch || global.fetch;
  
  if (typeof fetchToUse !== 'function') {
    console.log('❌ [FETCH_INTERCEPTOR] Fetch function not available');
    return;
  }

  const state = getInterceptorState();

  // Check if interceptor is already installed
  if (state.isInstalled) {
    console.log('🔧 [FETCH_INTERCEPTOR] Interceptor already installed, skipping');
    console.log('🔧 [FETCH_INTERCEPTOR] Current fetch function:', typeof global.fetch);
    console.log('🔧 [FETCH_INTERCEPTOR] Original fetch function:', typeof state.originalFetch);
    return;
  }

  console.log('🔧 [FETCH_INTERCEPTOR] Setting up fetch interceptor');

  // Store the original fetch function
  state.originalFetch = fetchToUse;

  // Mark as installed
  state.isInstalled = true;

  // Reemplazar el fetch en global con nuestra versión interceptada
  global.fetch = async (...args) => {
    const startTime = performance.now();
    const startDate = new Date();
    const url = args[0];
    const options = args[1] || {};
    
    // Convertir url a string de forma segura para logging
    let urlString: string;
    try {
      urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url instanceof Request ? url.url : String(url);
    } catch (e) {
      urlString = '[Unable to parse URL]';
    }
    
    console.log(`🌐 [FETCH_INTERCEPTOR] Intercepting fetch request: ${options.method || 'GET'} ${urlString}`);
    
    // Skip HTTP requests to the log server to prevent infinite loops
    if (httpConfig) {
      try {
        const urlObj = typeof url === 'string' || url instanceof URL 
          ? new URL(url.toString()) 
          : url instanceof Request 
            ? new URL(url.url) 
            : null;
        
        if (urlObj) {
          const isLogServerRequest = urlObj.hostname === httpConfig.host && 
                                     urlObj.port === httpConfig.port.toString() && 
                                     urlObj.pathname === httpConfig.endpoint;
          
          if (isLogServerRequest) {
            console.log(`⏭️ [FETCH_INTERCEPTOR] Skipping log server request to prevent infinite loop: ${urlString}`);
            return state.originalFetch!(...args);
          }
        }
      } catch (e) {
        // Si no se puede parsear la URL, continuar con el request normal
      }
    }
    
    try {
      const res = await state.originalFetch!(...args);
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

      // Usar la función de envío proporcionada
      console.log(`📤 [FETCH_INTERCEPTOR] Sending fetch data via WebSocket`);
      console.log(`📤 [FETCH_INTERCEPTOR] Data being sent:`, { type: 'fetch', payload: JSON.stringify(info).slice(0, 100) + '...' });
      sendWS({ type: 'fetch', payload: info });

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

      // Usar la función de envío proporcionada
      console.log(`📤 [FETCH_INTERCEPTOR] Sending fetch error via WebSocket`);
      sendWS({ type: 'fetch_error', payload: errInfo });
      throw error;
    }
  };
}

