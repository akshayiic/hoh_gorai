#!/usr/bin/env node
/**
 * Figma Desktop Bridge MCP Server
 *
 * This MCP server acts as a bridge between CLI AI agents and Figma Desktop.
 * It exposes tools that agents can use to interact with the currently open Figma document.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WebSocket } from 'ws';
import { RequestMessage, ResponseMessage } from '@figma-bridge/shared/types';

// WebSocket server configuration
const WS_PORT = 9223;
const WS_HOST = 'localhost';

// WebSocket client connection to Figma plugin
let figmaClient: WebSocket | null = null;
let connectionReady = false;

// Pending requests
const pendingRequests = new Map<string, (response: ResponseMessage) => void>();
let requestIdCounter = 0;

// Create MCP server
const server = new Server(
  {
    name: 'figma-bridge-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// WebSocket server for Figma plugin connections
import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: WS_PORT, host: WS_HOST });

console.error(`Figma Bridge MCP Server starting on ws://${WS_HOST}:${WS_PORT}`);

wss.on('connection', (ws: WebSocket) => {
  console.error('Figma plugin connected');
  figmaClient = ws;
  connectionReady = true;

  ws.on('message', (data: Buffer) => {
    try {
      const response: ResponseMessage = JSON.parse(data.toString());
      const resolver = pendingRequests.get(response.id);

      if (resolver) {
        resolver(response);
        pendingRequests.delete(response.id);
      }
    } catch (error) {
      console.error('Error handling plugin message:', error);
    }
  });

  ws.on('close', () => {
    console.error('Figma plugin disconnected');
    figmaClient = null;
    connectionReady = false;
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Send request to Figma plugin
async function sendRequest(action: string, params: any = {}): Promise<any> {
  if (!connectionReady || !figmaClient) {
    throw new Error('Figma plugin not connected. Please open the plugin in Figma Desktop.');
  }

  const requestId = `req-${Date.now()}-${requestIdCounter++}`;
  const request: RequestMessage = {
    id: requestId,
    action,
    params
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error('Request timeout'));
    }, 30000); // 30 second timeout

    pendingRequests.set(requestId, (response: ResponseMessage) => {
      clearTimeout(timeout);
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Unknown error'));
      }
    });

    figmaClient!.send(JSON.stringify(request));
  });
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Read operations
      {
        name: 'figma_get_document',
        description: 'Get the entire Figma document structure with all pages and their contents',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_pages',
        description: 'Get all pages in the current document',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_current_page',
        description: 'Get the current active page and its contents',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_selection',
        description: 'Get currently selected nodes in Figma',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_node',
        description: 'Get a specific node by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The ID of the node to retrieve',
            },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'figma_get_frames',
        description: 'Get all frames on the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_components',
        description: 'Get all components on the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_text_nodes',
        description: 'Get all text nodes on the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_styles',
        description: 'Get all local styles (colors, text, effects, etc.)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'figma_get_variables',
        description: 'Get all local variables in the file',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Write operations
      {
        name: 'figma_create_frame',
        description: 'Create a new frame in the current page',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the frame',
            },
            width: {
              type: 'number',
              description: 'Width of the frame in pixels',
            },
            height: {
              type: 'number',
              description: 'Height of the frame in pixels',
            },
            x: {
              type: 'number',
              description: 'X position',
            },
            y: {
              type: 'number',
              description: 'Y position',
            },
            cornerRadius: {
              type: 'number',
              description: 'Corner radius',
            },
          },
          required: ['name', 'width', 'height'],
        },
      },
      {
        name: 'figma_create_text',
        description: 'Create a new text layer in the current page',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the text layer',
            },
            content: {
              type: 'string',
              description: 'Text content',
            },
            x: {
              type: 'number',
              description: 'X position',
            },
            y: {
              type: 'number',
              description: 'Y position',
            },
            fontSize: {
              type: 'number',
              description: 'Font size in pixels',
            },
            fontWeight: {
              type: 'number',
              description: 'Font weight (100-900)',
            },
            fontFamily: {
              type: 'string',
              description: 'Font family name',
            },
            textAlign: {
              type: 'string',
              description: 'Text alignment (LEFT, CENTER, RIGHT, JUSTIFIED)',
            },
            width: {
              type: 'number',
              description: 'Width of the text box',
            },
            height: {
              type: 'number',
              description: 'Height of the text box',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'figma_update_text',
        description: 'Update an existing text node',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'ID of the text node to update',
            },
            content: {
              type: 'string',
              description: 'New text content',
            },
            fontSize: {
              type: 'number',
              description: 'Font size in pixels',
            },
            fontWeight: {
              type: 'number',
              description: 'Font weight (100-900)',
            },
            fontFamily: {
              type: 'string',
              description: 'Font family name',
            },
            textAlign: {
              type: 'string',
              description: 'Text alignment (LEFT, CENTER, RIGHT, JUSTIFIED)',
            },
            color: {
              type: 'string',
              description: 'Text color in hex format (e.g., #FF0000)',
            },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'figma_update_style',
        description: 'Update styling properties of a node',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'ID of the node to update',
            },
            fills: {
              type: 'array',
              description: 'Array of fill paints',
            },
            strokes: {
              type: 'array',
              description: 'Array of stroke paints',
            },
            cornerRadius: {
              type: 'number',
              description: 'Corner radius',
            },
            opacity: {
              type: 'number',
              description: 'Opacity (0-1)',
            },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'figma_move_node',
        description: 'Move a node to a new parent or position',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'ID of the node to move',
            },
            parentId: {
              type: 'string',
              description: 'ID of the new parent node',
            },
            index: {
              type: 'number',
              description: 'Index in the parent children array',
            },
            x: {
              type: 'number',
              description: 'New X position',
            },
            y: {
              type: 'number',
              description: 'New Y position',
            },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'figma_delete_node',
        description: 'Delete a node from the document',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'ID of the node to delete',
            },
          },
          required: ['nodeId'],
        },
      },
      // Export operations
      {
        name: 'figma_export_png',
        description: 'Export a node as PNG',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'ID of the node to export',
            },
            scale: {
              type: 'number',
              description: 'Export scale factor (default: 1)',
            },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'figma_export_jpg',
        description: 'Export a node as JPG',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'ID of the node to export',
            },
            scale: {
              type: 'number',
              description: 'Export scale factor (default: 1)',
            },
            quality: {
              type: 'number',
              description: 'JPG quality (0-1, default: 0.9)',
            },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'figma_export_svg',
        description: 'Export a node as SVG',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'ID of the node to export',
            },
          },
          required: ['nodeId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      // Read operations
      case 'figma_get_document':
        result = await sendRequest('GET_DOCUMENT');
        break;
      case 'figma_get_pages':
        result = await sendRequest('GET_PAGES');
        break;
      case 'figma_get_current_page':
        result = await sendRequest('GET_CURRENT_PAGE');
        break;
      case 'figma_get_selection':
        result = await sendRequest('GET_SELECTION');
        break;
      case 'figma_get_node':
        result = await sendRequest('GET_NODE', { nodeId: args?.nodeId });
        break;
      case 'figma_get_frames':
        result = await sendRequest('GET_FRAMES');
        break;
      case 'figma_get_components':
        result = await sendRequest('GET_COMPONENTS');
        break;
      case 'figma_get_text_nodes':
        result = await sendRequest('GET_TEXT_NODES');
        break;
      case 'figma_get_styles':
        result = await sendRequest('GET_STYLES');
        break;
      case 'figma_get_variables':
        result = await sendRequest('GET_VARIABLES');
        break;

      // Write operations
      case 'figma_create_frame':
        result = await sendRequest('CREATE_FRAME', args);
        break;
      case 'figma_create_text':
        result = await sendRequest('CREATE_TEXT', args);
        break;
      case 'figma_update_text':
        result = await sendRequest('UPDATE_TEXT', args);
        break;
      case 'figma_update_style':
        result = await sendRequest('UPDATE_STYLE', args);
        break;
      case 'figma_move_node':
        result = await sendRequest('MOVE_NODE', args);
        break;
      case 'figma_delete_node':
        result = await sendRequest('DELETE_NODE', args);
        break;

      // Export operations
      case 'figma_export_png':
        result = await sendRequest('EXPORT_PNG', {
          nodeId: args?.nodeId,
          format: 'PNG',
          scale: args?.scale || 1
        });
        break;
      case 'figma_export_jpg':
        result = await sendRequest('EXPORT_JPG', {
          nodeId: args?.nodeId,
          format: 'JPG',
          scale: args?.scale || 1,
          quality: args?.quality || 0.9
        });
        break;
      case 'figma_export_svg':
        result = await sendRequest('EXPORT_SVG', {
          nodeId: args?.nodeId,
          format: 'SVG'
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Figma Bridge MCP Server running');
  console.error('Waiting for Figma plugin to connect...');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
