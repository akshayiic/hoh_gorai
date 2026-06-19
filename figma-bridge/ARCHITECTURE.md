# System Architecture

Technical deep-dive into the Figma Desktop Bridge architecture.

## Overview

The Figma Desktop Bridge is a distributed system consisting of three main components:

1. **Figma Plugin** (`plugin/`) - Runs inside Figma Desktop
2. **MCP Server** (`server/`) - Bridges AI agents to Figma
3. **Shared Types** (`shared/`) - Common type definitions

## Component Details

### Figma Plugin

**Location:** `plugin/src/`

**Entry Points:**
- `code.ts` - Main plugin logic
- `ui.html` - Plugin UI

**Key Responsibilities:**
- Establish WebSocket connection to MCP server
- Execute Figma API operations
- Serialize/deserialize Figma nodes
- Handle operation timeouts and errors

**Technology Stack:**
- TypeScript
- WebSockets (browser API)
- Figma Plugin API

**Build Process:**
```bash
cd plugin
npm run build    # webpack production build
npm run dev      # webpack dev mode with watch
```

### MCP Server

**Location:** `server/src/`

**Entry Point:** `index.ts`

**Key Responsibilities:**
- Expose MCP tools to AI agents
- Handle stdio communication
- WebSocket server for plugin connections
- Request/response matching and timeouts

**Technology Stack:**
- TypeScript
- Model Context Protocol SDK
- ws (WebSocket library)
- Node.js stdio

**Build Process:**
```bash
cd server
npm run build    # TypeScript compilation
npm run dev      # Watch mode
npm run start    # Run compiled server
```

### Shared Types

**Location:** `shared/src/`

**Files:**
- `types.ts` - All TypeScript type definitions

**Key Responsibilities:**
- Define communication protocol
- Shared interfaces for messages
- Type safety across components

**Build Process:**
```bash
cd shared
npm run build    # TypeScript compilation
npm run dev      # Watch mode
```

## Communication Flow

### Request Flow

```
AI Agent → MCP Server → WebSocket → Figma Plugin → Figma API
```

### Response Flow

```
Figma API → Figma Plugin → WebSocket → MCP Server → AI Agent
```

### Message Protocol

**Request Format:**
```typescript
interface RequestMessage {
  id: string;              // Unique request ID
  action: ActionType;     // Operation to perform
  params?: Record<string, any>;  // Parameters
}
```

**Response Format:**
```typescript
interface ResponseMessage {
  id: string;              // Matches request ID
  success: boolean;        // Operation result
  data?: any;            // Response data
  error?: string;        // Error message if failed
}
```

## Security Architecture

### Threat Model

**Protected Against:**
- Remote Figma file access
- Token theft/exposure
- Unauthorized file operations

**Security Boundaries:**
1. **Plugin Sandbox:** Figma plugin only accesses current document
2. **Localhost Only:** WebSocket accepts only local connections
3. **No Credentials:** No Figma tokens or OAuth required
4. **Process Isolation:** Each component runs in separate process

### Security Guarantees

**The AI Agent CANNOT:**
- Access Figma files not opened in Desktop
- Use your Figma account credentials
- Access team libraries or external resources
- Make changes to files not currently open

**The AI Agent CAN:**
- Read/write to the currently open document
- Export assets from current document
- Modify nodes in current document
- Create new content in current document

## WebSocket Architecture

### Connection Model

```
MCP Server (Server)
  ↓
  Listens on ws://localhost:9223
  ↓
Figma Plugin (Client)
  ↓
  Connects to localhost:9223
  ↓
  Maintains persistent connection
  ↓
  Auto-reconnects on disconnect
```

### Connection States

1. **DISCONNECTED** - No connection
2. **CONNECTING** - Attempting to connect
3. **CONNECTED** - Connection active
4. **ERROR** - Connection error occurred

### Error Handling

**Connection Errors:**
- Automatic reconnection with exponential backoff
- Connection state displayed in plugin UI
- Server logs connection status

**Request Errors:**
- 30-second timeout per request
- Error responses with descriptive messages
- Failed requests don't break connection

## MCP Integration

### Tool Exposure

The MCP server exposes tools through the Model Context Protocol:

**Tool Categories:**
1. **Read Operations** - Query document state
2. **Write Operations** - Modify document
3. **Export Operations** - Export assets

**Tool Schema:**
Each tool has:
- `name` - Unique identifier
- `description` - Human-readable purpose
- `inputSchema` - JSON Schema for parameters

### Server Lifecycle

```typescript
// 1. Initialize
const server = new Server({ ... }, { capabilities });

// 2. Register handlers
server.setRequestHandler(ListToolsRequestSchema, handler);
server.setRequestHandler(CallToolRequestSchema, handler);

// 3. Connect transport
const transport = new StdioServerTransport();
await server.connect(transport);

// 4. Handle requests
server onRequest → process → sendResponse
```

## Figma Plugin Architecture

### Plugin Lifecycle

```typescript
// 1. Initialize
figma.showUI(__html__);

// 2. Connect WebSocket
ws = new WebSocket(WS_URL);

// 3. Listen for messages
ws.onmessage = handleRequest;

// 4. Process requests
handleRequest → execute → sendResponse;

// 5. Handle disconnect
ws.onclose = reconnect;
```

### Request Processing

```typescript
async function handleRequest(message: RequestMessage) {
  try {
    const data = await executeAction(message.action, message.params);
    sendResponse({ id: message.id, success: true, data });
  } catch (error) {
    sendResponse({ id: message.id, success: false, error });
  }
}
```

### Figma API Mapping

| MCP Tool | Figma API | Description |
|----------|-----------|-------------|
| `GET_DOCUMENT` | `figma.root` | Get document root |
| `GET_CURRENT_PAGE` | `figma.currentPage` | Get active page |
| `GET_SELECTION` | `figma.currentPage.selection` | Get selected nodes |
| `GET_NODE` | `figma.getNodeById()` | Get node by ID |
| `CREATE_FRAME` | `figma.createFrame()` | Create frame |
| `CREATE_TEXT` | `figma.createText()` | Create text |
| `UPDATE_TEXT` | `TextNode.characters` | Update text |
| `DELETE_NODE` | `node.remove()` | Delete node |
| `EXPORT_PNG` | `node.exportAsync()` | Export as PNG |

## Performance Considerations

### Optimization Strategies

1. **Request Batching:** Group multiple operations
2. **Lazy Loading:** Load node details on demand
3. **Connection Pooling:** Reuse WebSocket connections
4. **Timeout Management:** Prevent hanging requests

### Scalability Limits

**Recommended Limits:**
- Maximum document size: ~10,000 nodes
- Concurrent requests: 1 per WebSocket
- Request timeout: 30 seconds
- WebSocket message size: < 10MB

**Performance Tips:**
- Use specific node queries when possible
- Batch write operations
- Export at appropriate scales
- Cache frequently accessed nodes

## Error Handling

### Error Categories

1. **Connection Errors** - WebSocket issues
2. **Request Errors** - Invalid parameters
3. **Figma Errors** - API operation failures
4. **Timeout Errors** - Operation took too long

### Error Recovery

**Connection Errors:**
- Automatic reconnection
- Exponential backoff
- User notification in UI

**Request Errors:**
- Graceful failure with error message
- No connection impact
- Retry capability

**Figma Errors:**
- Descriptive error messages
- Operation rollback if possible
- User guidance for correction

## Testing Strategy

### Unit Testing

```typescript
// Test individual operations
describe('Figma Plugin', () => {
  it('should serialize node correctly', () => {
    const node = mockFigmaNode();
    const serialized = serializeNode(node);
    expect(serialized).toMatchSchema();
  });
});
```

### Integration Testing

```typescript
// Test end-to-end flow
describe('MCP Integration', () => {
  it('should handle figma_get_frames', async () => {
    const result = await callTool('figma_get_frames', {});
    expect(result).toHaveProperty('frames');
  });
});
```

### Manual Testing

1. Start MCP server
2. Open Figma with plugin
3. Test each operation manually
4. Verify error handling
5. Test edge cases

## Debugging

### Plugin Debugging

1. Open Figma Desktop
2. Run plugin
3. Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows)
4. View console logs and errors

### Server Debugging

```bash
# Run with debug output
DEBUG=* npm run dev

# Or check logs
tail -f logs/mcp-server.log
```

### WebSocket Debugging

```bash
# Monitor WebSocket traffic
wscat -c ws://localhost:9223

# Or use browser DevTools
# Inspect WebSocket frames in Network tab
```

## Future Enhancements

### Planned Features

1. **Request Caching** - Cache frequently accessed data
2. **Batch Operations** - Group multiple operations
3. **Real-time Updates** - Push changes to agent
4. **Advanced Exports** - More export options
5. **Plugin Hot Reload** - Development improvements

### Architecture Evolution

- Support for multiple concurrent connections
- Enhanced error recovery mechanisms
- Performance monitoring and metrics
- Plugin marketplace distribution

This architecture ensures secure, efficient, and reliable communication between AI agents and Figma Desktop while maintaining strict security boundaries and providing a smooth user experience.
