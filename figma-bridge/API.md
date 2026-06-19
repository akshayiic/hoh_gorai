# API Documentation

Complete reference for all Figma Desktop Bridge tools.

## Read Operations

### figma_get_document

Get the entire Figma document structure.

**Parameters:** None

**Returns:**
```json
{
  "id": "string",
  "name": "string",
  "pages": [...]
}
```

**Example:**
```javascript
figma_get_document()
```

---

### figma_get_pages

Get all pages in the current document.

**Parameters:** None

**Returns:**
```json
[
  {
    "id": "string",
    "name": "string",
    "frames": [...],
    "components": [...]
  }
]
```

**Example:**
```javascript
figma_get_pages()
```

---

### figma_get_current_page

Get the current active page and its contents.

**Parameters:** None

**Returns:**
```json
{
  "id": "string",
  "name": "string",
  "frames": [...],
  "components": [...]
}
```

**Example:**
```javascript
figma_get_current_page()
```

---

### figma_get_selection

Get currently selected nodes in Figma.

**Parameters:** None

**Returns:**
```json
[
  {
    "id": "string",
    "name": "string",
    "type": "string",
    ...
  }
]
```

**Example:**
```javascript
figma_get_selection()
```

---

### figma_get_node

Get a specific node by its ID.

**Parameters:**
- `nodeId` (string, required): The ID of the node to retrieve

**Returns:**
```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "width": number,
  "height": number,
  ...
}
```

**Example:**
```javascript
figma_get_node({ nodeId: "1:234" })
```

---

### figma_get_frames

Get all frames on the current page.

**Parameters:** None

**Returns:**
```json
[
  {
    "id": "string",
    "name": "string",
    "type": "FRAME",
    "width": number,
    "height": number,
    "x": number,
    "y": number
  }
]
```

**Example:**
```javascript
figma_get_frames()
```

---

### figma_get_components

Get all components on the current page.

**Parameters:** None

**Returns:**
```json
[
  {
    "id": "string",
    "name": "string",
    "type": "COMPONENT"
  }
]
```

**Example:**
```javascript
figma_get_components()
```

---

### figma_get_text_nodes

Get all text nodes on the current page.

**Parameters:** None

**Returns:**
```json
[
  {
    "id": "string",
    "name": "string",
    "type": "TEXT",
    "content": "string",
    "fontSize": number,
    "fontWeight": number,
    "fontFamily": "string"
  }
]
```

**Example:**
```javascript
figma_get_text_nodes()
```

---

### figma_get_styles

Get all local styles (colors, text, effects, etc.).

**Parameters:** None

**Returns:**
```json
[
  {
    "id": "string",
    "name": "string",
    "type": "COLOR|TEXT|EFFECT|GRID|LAYOUT",
    "description": "string",
    "properties": {...}
  }
]
```

**Example:**
```javascript
figma_get_styles()
```

---

### figma_get_variables

Get all local variables in the file.

**Parameters:** None

**Returns:**
```json
[
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "values": {...}
  }
]
```

**Example:**
```javascript
figma_get_variables()
```

## Write Operations

### figma_create_frame

Create a new frame in the current page.

**Parameters:**
- `name` (string, required): Name of the frame
- `width` (number, required): Width of the frame in pixels
- `height` (number, required): Height of the frame in pixels
- `x` (number, optional): X position
- `y` (number, optional): Y position
- `cornerRadius` (number, optional): Corner radius

**Returns:**
```json
{
  "nodeId": "string"
}
```

**Example:**
```javascript
figma_create_frame({
  name: "Hero Section",
  width: 1200,
  height: 600,
  x: 100,
  y: 200,
  cornerRadius: 8
})
```

---

### figma_create_text

Create a new text layer in the current page.

**Parameters:**
- `content` (string, required): Text content
- `name` (string, optional): Name of the text layer
- `x` (number, optional): X position
- `y` (number, optional): Y position
- `fontSize` (number, optional): Font size in pixels
- `fontWeight` (number, optional): Font weight (100-900)
- `fontFamily` (string, optional): Font family name
- `textAlign` (string, optional): Text alignment (LEFT, CENTER, RIGHT, JUSTIFIED)
- `width` (number, optional): Width of the text box
- `height` (number, optional): Height of the text box

**Returns:**
```json
{
  "nodeId": "string"
}
```

**Example:**
```javascript
figma_create_text({
  name: "Headline",
  content: "Welcome to Our App",
  x: 150,
  y: 250,
  fontSize: 48,
  fontWeight: 700,
  fontFamily: "Inter",
  textAlign: "CENTER",
  width: 1100
})
```

---

### figma_update_text

Update an existing text node.

**Parameters:**
- `nodeId` (string, required): ID of the text node to update
- `content` (string, optional): New text content
- `fontSize` (number, optional): Font size in pixels
- `fontWeight` (number, optional): Font weight (100-900)
- `fontFamily` (string, optional): Font family name
- `textAlign` (string, optional): Text alignment (LEFT, CENTER, RIGHT, JUSTIFIED)
- `color` (string, optional): Text color in hex format (e.g., #FF0000)

**Returns:**
```json
{
  "success": true
}
```

**Example:**
```javascript
figma_update_text({
  nodeId: "1:234",
  content: "Updated text",
  fontSize: 32,
  color: "#3B82F6"
})
```

---

### figma_update_style

Update styling properties of a node.

**Parameters:**
- `nodeId` (string, required): ID of the node to update
- `fills` (array, optional): Array of fill paints
- `strokes` (array, optional): Array of stroke paints
- `cornerRadius` (number, optional): Corner radius
- `opacity` (number, optional): Opacity (0-1)

**Returns:**
```json
{
  "success": true
}
```

**Example:**
```javascript
figma_update_style({
  nodeId: "1:234",
  fills: [{ type: "SOLID", color: { r: 0.5, g: 0.8, b: 1.0 } }],
  cornerRadius: 12,
  opacity: 0.9
})
```

---

### figma_move_node

Move a node to a new parent or position.

**Parameters:**
- `nodeId` (string, required): ID of the node to move
- `parentId` (string, optional): ID of the new parent node
- `index` (number, optional): Index in the parent children array
- `x` (number, optional): New X position
- `y` (number, optional): New Y position

**Returns:**
```json
{
  "success": true
}
```

**Example:**
```javascript
figma_move_node({
  nodeId: "1:234",
  parentId: "1:123",
  index: 0,
  x: 500,
  y: 300
})
```

---

### figma_delete_node

Delete a node from the document.

**Parameters:**
- `nodeId` (string, required): ID of the node to delete

**Returns:**
```json
{
  "success": true
}
```

**Example:**
```javascript
figma_delete_node({ nodeId: "1:234" })
```

## Export Operations

### figma_export_png

Export a node as PNG.

**Parameters:**
- `nodeId` (string, required): ID of the node to export
- `scale` (number, optional): Export scale factor (default: 1)

**Returns:**
```json
{
  "data": "data:image/png;base64,...",
  "format": "PNG"
}
```

**Example:**
```javascript
figma_export_png({
  nodeId: "1:234",
  scale: 2
})
```

---

### figma_export_jpg

Export a node as JPG.

**Parameters:**
- `nodeId` (string, required): ID of the node to export
- `scale` (number, optional): Export scale factor (default: 1)
- `quality` (number, optional): JPG quality (0-1, default: 0.9)

**Returns:**
```json
{
  "data": "data:image/jpeg;base64,...",
  "format": "JPG"
}
```

**Example:**
```javascript
figma_export_jpg({
  nodeId: "1:234",
  scale: 1,
  quality: 0.95
})
```

---

### figma_export_svg

Export a node as SVG.

**Parameters:**
- `nodeId` (string, required): ID of the node to export

**Returns:**
```json
{
  "data": "data:image/svg+xml;base64,...",
  "format": "SVG"
}
```

**Example:**
```javascript
figma_export_svg({ nodeId: "1:234" })
```

## Error Handling

All operations may return errors in this format:

```json
{
  "error": "Error message description"
}
```

Common errors:
- `"Figma plugin not connected"` - Plugin is not running
- `"Node not found"` - Invalid node ID
- `"Unknown action"` - Invalid tool call
- `"Request timeout"` - Operation took too long

## Type Definitions

### Node Types

- `FRAME` - Frame container
- `COMPONENT` - Component instance
- `TEXT` - Text layer
- `RECTANGLE` - Rectangle shape
- `ELLIPSE` - Ellipse shape
- `GROUP` - Group of nodes

### Style Types

- `COLOR` - Paint styles
- `TEXT` - Text styles
- `EFFECT` - Effect styles
- `GRID` - Grid styles
- `LAYOUT` - Layout styles
