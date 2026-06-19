// Figma Desktop Bridge Plugin
// This plugin runs inside Figma Desktop and communicates via WebSocket with the MCP server

import { RequestMessage, ResponseMessage, ActionType, FigmaNode, FigmaDocument, FigmaPage } from '@figma-bridge/shared/types';

// WebSocket connection
let ws: WebSocket | null = null;
const WS_PORT = 9223;
const WS_URL = `ws://localhost:${WS_PORT}`;

// Connection state
let reconnectInterval: number | null = null;
let pendingRequests = new Map<string, (response: ResponseMessage) => void>();

// Show UI
figma.showUI(__html__, { width: 300, height: 400 });

// Initialize connection
function connect() {
  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to MCP server');
      figma.ui.postMessage({ type: 'CONNECTED' });

      // Clear any existing reconnect interval
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };

    ws.onmessage = async (event) => {
      try {
        const message: RequestMessage = JSON.parse(event.data);
        await handleRequest(message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from MCP server');
      figma.ui.postMessage({ type: 'DISCONNECTED' });

      // Attempt to reconnect every 5 seconds
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000) as unknown as number;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    figma.notify('Failed to connect to MCP server. Make sure the server is running.');
  }
}

// Send response to MCP server
function sendResponse(response: ResponseMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
  }
}

// Handle incoming requests from MCP server
async function handleRequest(message: RequestMessage) {
  const { id, action, params = {} } = message;

  try {
    let data: any;

    switch (action) {
      // Read operations
      case 'GET_DOCUMENT':
        data = await getDocument();
        break;
      case 'GET_PAGES':
        data = await getPages();
        break;
      case 'GET_CURRENT_PAGE':
        data = await getCurrentPage();
        break;
      case 'GET_SELECTION':
        data = await getSelection();
        break;
      case 'GET_NODE':
        data = await getNode(params.nodeId);
        break;
      case 'GET_FRAMES':
        data = await getFrames();
        break;
      case 'GET_COMPONENTS':
        data = await getComponents();
        break;
      case 'GET_TEXT_NODES':
        data = await getTextNodes();
        break;
      case 'GET_STYLES':
        data = await getStyles();
        break;
      case 'GET_VARIABLES':
        data = await getVariables();
        break;

      // Write operations
      case 'CREATE_FRAME':
        data = await createFrame(params);
        break;
      case 'CREATE_TEXT':
        data = await createText(params);
        break;
      case 'UPDATE_TEXT':
        data = await updateText(params);
        break;
      case 'UPDATE_STYLE':
        data = await updateStyle(params);
        break;
      case 'MOVE_NODE':
        data = await moveNode(params);
        break;
      case 'DELETE_NODE':
        data = await deleteNode(params);
        break;

      // Export operations
      case 'EXPORT_PNG':
        data = await exportNode({ ...params, format: 'PNG' });
        break;
      case 'EXPORT_JPG':
        data = await exportNode({ ...params, format: 'JPG' });
        break;
      case 'EXPORT_SVG':
        data = await exportNode({ ...params, format: 'SVG' });
        break;

      // Connection tests
      case 'PING':
        data = { message: 'PONG' };
        break;
      case 'CONNECT':
        data = { message: 'Connected', version: '1.0.0' };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    sendResponse({ id, success: true, data });

  } catch (error) {
    console.error(`Error handling ${action}:`, error);
    sendResponse({
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Read operation implementations

async function getDocument(): Promise<FigmaDocument> {
  const document = figma.root;
  const pages = document.children.map(page => ({
    id: page.id,
    name: page.name,
    frames: page.children.filter(node => node.type === 'FRAME').map(frame => ({
      id: frame.id,
      name: frame.name,
      type: frame.type,
      width: frame.width,
      height: frame.height
    }))
  }));

  return {
    id: document.id,
    name: document.name,
    pages
  };
}

async function getPages(): Promise<FigmaPage[]> {
  const document = figma.root;
  return document.children.map(page => ({
    id: page.id,
    name: page.name,
    frames: page.children.filter(node => node.type === 'FRAME').map(frame => ({
      id: frame.id,
      name: frame.name,
      type: frame.type,
      width: frame.width,
      height: frame.height
    })),
    components: page.children.filter(node => node.type === 'COMPONENT').map(comp => ({
      id: comp.id,
      name: comp.name,
      type: comp.type
    }))
  }));
}

async function getCurrentPage(): Promise<FigmaPage> {
  const page = figma.currentPage;
  return {
    id: page.id,
    name: page.name,
    frames: page.children.filter(node => node.type === 'FRAME').map(frame => ({
      id: frame.id,
      name: frame.name,
      type: frame.type,
      width: frame.width,
      height: frame.height
    })),
    components: page.children.filter(node => node.type === 'COMPONENT').map(comp => ({
      id: comp.id,
      name: comp.name,
      type: comp.type
    }))
  };
}

async function getSelection(): Promise<FigmaNode[]> {
  const selection = figma.currentPage.selection;
  return selection.map(node => serializeNode(node));
}

async function getNode(nodeId: string): Promise<FigmaNode> {
  const node = await figma.getNodeById(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  return serializeNode(node);
}

async function getFrames(): Promise<FigmaNode[]> {
  const frames = figma.currentPage.findAll(node => node.type === 'FRAME');
  return frames.map(frame => ({
    id: frame.id,
    name: frame.name,
    type: frame.type,
    width: frame.width,
    height: frame.height,
    x: frame.x,
    y: frame.y
  }));
}

async function getComponents(): Promise<FigmaNode[]> {
  const components = figma.currentPage.findAll(node => node.type === 'COMPONENT');
  return components.map(comp => ({
    id: comp.id,
    name: comp.name,
    type: comp.type
  }));
}

async function getTextNodes(): Promise<FigmaNode[]> {
  const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT');
  return textNodes.map(text => ({
    id: text.id,
    name: text.name,
    type: text.type,
    content: text.characters,
    fontSize: text.fontSize,
    fontWeight: text.fontWeight,
    fontFamily: text.fontName?.family
  }));
}

async function getStyles(): Promise<any[]> {
  const styles = [];

  // Get local paint styles
  const paintStyles = await figma.getLocalPaintStylesAsync();
  styles.push(...paintStyles.map(style => ({
    id: style.id,
    name: style.name,
    type: 'COLOR',
    description: style.description,
    properties: { color: style.paints[0] }
  })));

  // Get local text styles
  const textStyles = await figma.getLocalTextStylesAsync();
  styles.push(...textStyles.map(style => ({
    id: style.id,
    name: style.name,
    type: 'TEXT',
    description: style.description,
    properties: { fontSize: style.fontSize, fontWeight: style.fontWeight }
  })));

  return styles;
}

async function getVariables(): Promise<any[]> {
  // Variables API is available in newer Figma versions
  if ('variables' in figma) {
    const variables = await figma.variables.getLocalVariablesAsync();
    return variables.map(variable => ({
      id: variable.id,
      name: variable.name,
      type: variable.resolvedType,
      values: variable.valuesByMode
    }));
  }
  return [];
}

// Write operation implementations

async function createFrame(params: any): Promise<{ nodeId: string }> {
  const frame = figma.createFrame();
  frame.name = params.name;
  frame.resize(params.width, params.height);

  if (params.x !== undefined) frame.x = params.x;
  if (params.y !== undefined) frame.y = params.y;
  if (params.fills) frame.fills = params.fills;
  if (params.strokes) frame.strokes = params.strokes;
  if (params.cornerRadius !== undefined) frame.cornerRadius = params.cornerRadius;

  figma.currentPage.appendChild(frame);

  return { nodeId: frame.id };
}

async function createText(params: any): Promise<{ nodeId: string }> {
  const text = figma.createText();
  text.name = params.name || 'Text';
  text.characters = params.content;

  if (params.x !== undefined) text.x = params.x;
  if (params.y !== undefined) text.y = params.y;
  if (params.fontSize !== undefined) text.fontSize = params.fontSize;
  if (params.fontWeight !== undefined) text.fontWeight = params.fontWeight;
  if (params.fontFamily) text.fontName = { family: params.fontFamily, style: 'Regular' };
  if (params.textAlign) text.textAlignHorizontal = params.textAlign;
  if (params.width) text.resize(params.width, params.height || 100);

  figma.currentPage.appendChild(text);

  return { nodeId: text.id };
}

async function updateText(params: any): Promise<{ success: boolean }> {
  const node = await figma.getNodeById(params.nodeId);
  if (!node || node.type !== 'TEXT') {
    throw new Error('Node not found or not a text node');
  }

  const textNode = node as TextNode;

  if (params.content !== undefined) textNode.characters = params.content;
  if (params.fontSize !== undefined) textNode.fontSize = params.fontSize;
  if (params.fontWeight !== undefined) textNode.fontWeight = params.fontWeight;
  if (params.fontFamily) textNode.fontName = { family: params.fontFamily, style: 'Regular' };
  if (params.textAlign) textNode.textAlignHorizontal = params.textAlign;
  if (params.color) textNode.fills = [{ type: 'SOLID', color: hexToRgb(params.color) }];

  return { success: true };
}

async function updateStyle(params: any): Promise<{ success: boolean }> {
  const node = await figma.getNodeById(params.nodeId);
  if (!node) {
    throw new Error('Node not found');
  }

  if (params.fills) (node as any).fills = params.fills;
  if (params.strokes) (node as any).strokes = params.strokes;
  if (params.cornerRadius !== undefined) (node as any).cornerRadius = params.cornerRadius;
  if (params.opacity !== undefined) node.opacity = params.opacity;

  return { success: true };
}

async function moveNode(params: any): Promise<{ success: boolean }> {
  const node = await figma.getNodeById(params.nodeId);
  if (!node) {
    throw new Error('Node not found');
  }

  if (params.parentId) {
    const parent = await figma.getNodeById(params.parentId);
    if (!parent) {
      throw new Error('Parent node not found');
    }
    parent.appendChild(node);
  }

  if (params.index !== undefined) {
    const parent = node.parent;
    if (parent && 'children' in parent) {
      parent.insertChild(params.index, node);
    }
  }

  if (params.x !== undefined) node.x = params.x;
  if (params.y !== undefined) node.y = params.y;

  return { success: true };
}

async function deleteNode(params: any): Promise<{ success: boolean }> {
  const node = await figma.getNodeById(params.nodeId);
  if (!node) {
    throw new Error('Node not found');
  }

  node.remove();
  return { success: true };
}

// Export operation implementations

async function exportNode(params: any): Promise<{ data: string; format: string }> {
  const node = await figma.getNodeById(params.nodeId);
  if (!node) {
    throw new Error('Node not found');
  }

  const exportSettings: ExportSettings = {
    format: params.format,
    constraint: { type: 'SCALE', value: params.scale || 1 }
  };

  if (params.format === 'JPG') {
    exportSettings.quality = params.quality || 0.9;
  }

  const bytes = await node.exportAsync(exportSettings);

  // Convert to base64
  const base64 = figma.base64Encode(bytes);

  return {
    data: `data:image/${params.format.toLowerCase()};base64,${base64}`,
    format: params.format
  };
}

// Utility functions

function serializeNode(node: any): FigmaNode {
  const serialized: FigmaNode = {
    id: node.id,
    name: node.name,
    type: node.type
  };

  if (node.width !== undefined) serialized.width = node.width;
  if (node.height !== undefined) serialized.height = node.height;
  if (node.x !== undefined) serialized.x = node.x;
  if (node.y !== undefined) serialized.y = node.y;

  if (node.type === 'TEXT') {
    serialized.properties = {
      content: node.characters,
      fontSize: node.fontSize,
      fontWeight: node.fontWeight,
      fontFamily: node.fontName?.family
    };
  }

  if ('children' in node && node.children.length > 0) {
    serialized.children = node.children.map((child: any) => serializeNode(child));
  }

  return serialized;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

// Handle messages from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'RECONNECT') {
    connect();
  }
};

// Start connection
connect();
