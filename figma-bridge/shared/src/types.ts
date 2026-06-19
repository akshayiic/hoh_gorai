// Request and Response types for WebSocket communication

export interface RequestMessage {
  id: string;
  action: string;
  params?: Record<string, any>;
}

export interface ResponseMessage {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Node types
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  children?: FigmaNode[];
  properties?: Record<string, any>;
}

// Document structure
export interface FigmaDocument {
  id: string;
  name: string;
  pages: FigmaPage[];
}

export interface FigmaPage {
  id: string;
  name: string;
  frames: FigmaNode[];
  components: FigmaNode[];
}

// Style types
export interface FigmaStyle {
  id: string;
  name: string;
  type: 'COLOR' | 'TEXT' | 'EFFECT' | 'GRID' | 'LAYOUT';
  description?: string;
  properties: Record<string, any>;
}

// Export types
export interface ExportOptions {
  format: 'PNG' | 'JPG' | 'SVG' | 'PDF';
  scale?: number;
  quality?: number;
  svgOutlineText?: boolean;
}

// Action types
export type ActionType =
  // Read operations
  | 'GET_DOCUMENT'
  | 'GET_PAGES'
  | 'GET_CURRENT_PAGE'
  | 'GET_SELECTION'
  | 'GET_NODE'
  | 'GET_FRAMES'
  | 'GET_COMPONENTS'
  | 'GET_TEXT_NODES'
  | 'GET_STYLES'
  | 'GET_VARIABLES'
  // Write operations
  | 'CREATE_FRAME'
  | 'CREATE_TEXT'
  | 'UPDATE_TEXT'
  | 'UPDATE_STYLE'
  | 'MOVE_NODE'
  | 'DELETE_NODE'
  // Export operations
  | 'EXPORT_PNG'
  | 'EXPORT_JPG'
  | 'EXPORT_SVG'
  // Connection
  | 'PING'
  | 'CONNECT';

// Node creation parameters
export interface CreateFrameParams {
  name: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  fills?: any[];
  strokes?: any[];
  cornerRadius?: number;
}

export interface CreateTextParams {
  name: string;
  content: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  width?: number;
  height?: number;
}

export interface UpdateTextParams {
  nodeId: string;
  content?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  color?: string;
}

export interface UpdateStyleParams {
  nodeId: string;
  fills?: any[];
  strokes?: any[];
  cornerRadius?: number;
  opacity?: number;
}

export interface MoveNodeParams {
  nodeId: string;
  parentId?: string;
  index?: number;
  x?: number;
  y?: number;
}

export interface DeleteNodeParams {
  nodeId: string;
}

export interface ExportNodeParams {
  nodeId: string;
  format: 'PNG' | 'JPG' | 'SVG' | 'PDF';
  scale?: number;
  quality?: number;
}
