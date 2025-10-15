# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-12-19

### ✨ Added
- **Tabbed Interface**: Request details now organized in two tabs:
  - **Details Tab**: URL breakdown, request headers, response headers, timing information
  - **Response Body Tab**: Dedicated tab for response body with interactive JSON viewer
- **Interactive JSON Viewer**: 
  - Syntax highlighting with different colors for strings, numbers, booleans, null
  - Expandable/collapsible JSON objects and arrays
  - Smart defaults (first 2 levels expanded by default)
  - Visual indicators with brackets, commas, and proper indentation
- **Smart WebSocket Reconnection**:
  - Automatic reconnection with exponential backoff (max 5 attempts)
  - Manual retry button when connection fails
  - Visual connection status indicators (🟢 connected, 🟡 reconnecting, 🔴 disconnected)
  - Error messages with actionable information

### 🔧 Improved
- **Performance Optimizations**:
  - Eliminated duplicate request tracking
  - Improved fetch interceptor efficiency
  - Reduced memory usage with better data handling
- **Error Handling**:
  - Robust error handling in WebSocket server
  - Better error messages and logging
  - Prevention of infinite loops in console interceptors
- **Code Quality**:
  - Removed unused files and dependencies
  - Better TypeScript types and validation
  - Cleaner code structure and organization

### 🐛 Fixed
- **WebSocket Issues**:
  - Fixed infinite reconnection loops
  - Better connection state management
  - Improved error handling and recovery
- **Request Duplication**:
  - Eliminated duplicate request logging
  - Better request tracking and deduplication
- **Console Interceptors**:
  - Fixed potential infinite loops
  - Better filtering of internal logs

### 🗑️ Removed
- Unused React components directory (`src/ui/`)
- Unused logger.ts file
- Example files (moved to documentation)
- React and React-DOM dependencies (not needed for embedded UI)

## [0.1.0] - 2024-12-19

### ✨ Initial Release
- Real-time network monitoring for Next.js applications
- React-based web UI with dark/light theme support
- WebSocket integration for real-time updates
- Request filtering and live statistics
- Complete request/response capture with headers and body
- Responsive design for desktop and mobile
- Console logging integration
- Error tracking and monitoring
