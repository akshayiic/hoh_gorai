# Figma Desktop Bridge

A system that allows CLI AI agents to read and modify the currently open Figma document without using Figma Personal Access Tokens.

## Overview

The Figma Desktop Bridge enables AI agents to interact with Figma through a local plugin and MCP server, providing secure, token-free access to your currently open Figma document.

## Architecture

The system consists of four layers:

```
User
  ↓
CLI AI Agent
  ↓
MCP Tool Call
  ↓
Local MCP Server
  ↓
WebSocket Message
  ↓
Figma Plugin
  ↓
Figma Plugin API
  ↓
Current Open Figma File
```

### Components

1. **CLI AI Agent** - The agent that reasons about user requests and decides which tools to call
2. **MCP Server** - Bridges the agent to Figma by exposing tools and handling WebSocket communication
3. **Figma Plugin** - Runs inside Figma Desktop, executes commands via the Figma Plugin API
4. **Figma Plugin API** - Provides access to the currently open document

## Features

### Read Operations
- Get document structure and pages
- Get frames, components, and text nodes
- Get selection and specific nodes
- Get styles and variables

### Write Operations
- Create frames and text layers
- Update text content and styling
- Move and delete nodes
- Apply styles and effects

### Export Operations
- Export nodes as PNG, JPG, or SVG
- Configurable scale and quality
- Base64 encoded output

## Installation

### Prerequisites

- Node.js 18+ and npm 9+
- Figma Desktop application
- CLI AI agent that supports MCP (e.g., Claude Code)

### Setup

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd figma-bridge
npm install
npm run build
```

2. **Package and install the Figma plugin:**

```bash
npm run package
```

3. **Install in Figma Desktop:**
   - Open Figma Desktop
   - Go to Plugins > Development > Import plugin from manifest
   - Select `figma-bridge-plugin/manifest.json`

4. **Start the MCP server:**

```bash
npm run dev
```

5. **Configure your AI agent:**
   Add the MCP server to your agent's configuration:

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/path/to/figma-bridge/server/dist/index.js"]
    }
  }
}
```

## Usage

### Basic Workflow

1. Open Figma Desktop with your document
2. Run the Figma Desktop Bridge plugin
3. Start the MCP server
4. AI agent can now interact with your document

### Example Tool Calls

#### List all frames on the current page

```javascript
figma_get_frames()
```

#### Create a new frame

```javascript
figma_create_frame({
  name: "Testimonials Section",
  width: 1200,
  height: 600,
  x: 100,
  y: 200
})
```

#### Update text content

```javascript
figma_update_text({
  nodeId: "1:234",
  content: "New text content",
  fontSize: 24,
  fontWeight: 600
})
```

#### Export a frame as PNG

```javascript
figma_export_png({
  nodeId: "1:123",
  scale: 2
})
```

## Available Tools

### Read Operations

- `figma_get_document` - Get entire document structure
- `figma_get_pages` - Get all pages
- `figma_get_current_page` - Get current page
- `figma_get_selection` - Get selected nodes
- `figma_get_node` - Get specific node by ID
- `figma_get_frames` - Get all frames
- `figma_get_components` - Get all components
- `figma_get_text_nodes` - Get all text nodes
- `figma_get_styles` - Get all local styles
- `figma_get_variables` - Get all variables

### Write Operations

- `figma_create_frame` - Create new frame
- `figma_create_text` - Create new text layer
- `figma_update_text` - Update text node
- `figma_update_style` - Update node styling
- `figma_move_node` - Move/reparent node
- `figma_delete_node` - Delete node

### Export Operations

- `figma_export_png` - Export as PNG
- `figma_export_jpg` - Export as JPG
- `figma_export_svg` - Export as SVG

## Security Model

The system is designed with security in mind:

- **No Figma Tokens**: Never stores or uses Figma Personal Access Tokens
- **Sandboxed Plugin**: The plugin only has access to the currently open document
- **Local Communication**: All communication happens via localhost WebSockets
- **No External Access**: The AI agent cannot access arbitrary Figma files

### What the Agent CAN Access:
- The currently open Figma document
- Nodes and pages in that document
- Local styles and variables

### What the Agent CANNOT Access:
- Other Figma files
- Your Figma account
- Team libraries or external resources
- Files not opened in Figma Desktop

## Development

### Project Structure

```
figma-bridge/
├── plugin/          # Figma plugin code
│   ├── src/
│   │   ├── code.ts  # Plugin logic
│   │   └── ui.html  # Plugin UI
│   ├── manifest.json
│   └── webpack.config.js
├── server/          # MCP server code
│   └── src/
│       └── index.ts # Server implementation
├── shared/          # Shared types
│   └── src/
│       └── types.ts # TypeScript types
└── scripts/         # Build scripts
```

### Build Commands

```bash
# Development mode (watch)
npm run dev

# Build everything
npm run build

# Package plugin for distribution
npm run package

# Build plugin only
npm run build:plugin

# Build server only
npm run build:server
```

### Communication Protocol

The plugin and server communicate via WebSocket on `ws://localhost:9223`.

**Request Format:**
```json
{
  "id": "req-001",
  "action": "GET_FRAMES",
  "params": {}
}
```

**Response Format:**
```json
{
  "id": "req-001",
  "success": true,
  "data": [...]
}
```

## Troubleshooting

### Plugin won't connect to server

1. Ensure the MCP server is running
2. Check that port 9223 is not in use
3. Check Figma plugin console for errors

### Agent can't reach the server

1. Verify MCP server is configured correctly
2. Check agent's MCP configuration
3. Ensure server is running locally

### Node operations fail

1. Make sure a document is open in Figma
2. Check that the plugin is running
3. Verify node IDs are correct

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Uses [Figma Plugin API](https://www.figma.com/developers/docs)
- Inspired by the need for token-free Figma automation

## Support

For issues, questions, or contributions, please visit our GitHub repository.
