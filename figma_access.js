// figma_access.js
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = 9224;
const wss = new WebSocketServer({ port: PORT });
console.log(`Figma Access server listening on ws://localhost:${PORT}`);

wss.on('connection', (ws, req) => {
  console.log(`Connected to Figma Desktop Bridge!`);

  let fileInfo = null;

  ws.on('message', async (message) => {
    const text = message.toString();
    try {
      const parsed = JSON.parse(text);

      // Handle file info update
      if (parsed.type === 'FILE_INFO' && parsed.data) {
        fileInfo = parsed.data;
        console.log(`\n--- Active Figma File ---`);
        console.log(`File Name: ${fileInfo.fileName}`);
        console.log(`File Key:  ${fileInfo.fileKey}`);
        console.log(`Page:      ${fileInfo.currentPage} (${fileInfo.currentPageId})`);
        console.log(`Selection count: ${fileInfo.selectionCount}`);
        console.log(`-------------------------\n`);

        if (fileInfo.selectionCount === 0) {
          console.log('⚠️ Selection is empty! Please select a design element/frame in Figma Desktop, then run this script again.');
          cleanupAndExit(0);
          return;
        }

        // We have a selection! Let's query selection details
        console.log('Fetching selection details...');
        sendExecuteCode(ws, 'get-selection-details', `
          try {
            const selectedNodes = figma.currentPage.selection;
            if (selectedNodes.length === 0) return { success: false, error: "No nodes selected" };
            
            function serializeNode(node) {
              const res = {
                id: node.id,
                name: node.name,
                type: node.type,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height
              };
              
              if ('fills' in node) res.fills = node.fills;
              if ('strokes' in node) res.strokes = node.strokes;
              if ('strokeWeight' in node) res.strokeWeight = node.strokeWeight;
              if ('effects' in node) res.effects = node.effects;
              if ('cornerRadius' in node) res.cornerRadius = node.cornerRadius;
              if ('opacity' in node) res.opacity = node.opacity;
              if ('layoutMode' in node) res.layoutMode = node.layoutMode;
              if ('primaryAxisSizingMode' in node) res.primaryAxisSizingMode = node.primaryAxisSizingMode;
              if ('counterAxisSizingMode' in node) res.counterAxisSizingMode = node.counterAxisSizingMode;
              if ('paddingLeft' in node) res.paddingLeft = node.paddingLeft;
              if ('paddingRight' in node) res.paddingRight = node.paddingRight;
              if ('paddingTop' in node) res.paddingTop = node.paddingTop;
              if ('paddingBottom' in node) res.paddingBottom = node.paddingBottom;
              if ('itemSpacing' in node) res.itemSpacing = node.itemSpacing;
              
              if ('characters' in node) {
                res.characters = node.characters;
                res.fontSize = node.fontSize;
                res.fontName = node.fontName;
                res.fontWeight = node.fontWeight;
                res.lineHeight = node.lineHeight;
                res.letterSpacing = node.letterSpacing;
              }
              
              if ('children' in node) {
                res.children = node.children.map(serializeNode);
              }
              
              return res;
            }
            
            return {
              success: true,
              nodes: selectedNodes.map(serializeNode)
            };
          } catch (e) {
            return { success: false, error: e.message };
          }
        `);
      }

      // Handle execute code result
      if (parsed.id === 'get-selection-details') {
        const result = parsed.result;
        if (result && result.success && result.result && result.result.success) {
          const nodes = result.result.nodes;
          console.log(`\n✅ Extracted details for ${nodes.length} selected node(s).`);
          
          // Save node details
          const detailsPath = path.join(__dirname, 'figma_node.json');
          fs.writeFileSync(detailsPath, JSON.stringify(nodes, null, 2), 'utf-8');
          console.log(`💾 Saved node details to: [figma_node.json](file:///${detailsPath.replace(/\\/g, '/')})`);

          // Let's now capture a screenshot of the first selected node
          const primaryNode = nodes[0];
          console.log(`\nCapturing screenshot of primary node: ${primaryNode.name} (${primaryNode.id})...`);
          
          sendServerCommand(ws, 'capture-screenshot', 'CAPTURE_SCREENSHOT', {
            nodeId: primaryNode.id,
            scale: 2,
            format: 'png'
          });
        } else {
          console.error('❌ Failed to get selection details:', result);
          cleanupAndExit(1);
        }
      }

      // Handle screenshot result
      if (parsed.id === 'capture-screenshot') {
        const result = parsed.result;
        if (result && result.success && result.imageData) {
          const base64Data = result.imageData;
          const imageBuffer = Buffer.from(base64Data, 'base64');
          const screenshotPath = path.join(__dirname, 'figma_ref.png');
          fs.writeFileSync(screenshotPath, imageBuffer);
          console.log(`\n📸 Captured high-res screenshot!`);
          console.log(`💾 Saved reference image to: [figma_ref.png](file:///${screenshotPath.replace(/\\/g, '/')})`);
          cleanupAndExit(0);
        } else {
          console.error('❌ Failed to capture screenshot:', result);
          cleanupAndExit(1);
        }
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  });
});

function sendExecuteCode(ws, id, code) {
  const payload = {
    id,
    method: 'EXECUTE_CODE',
    params: { code }
  };
  ws.send(JSON.stringify(payload));
}

function sendServerCommand(ws, id, method, params) {
  const payload = { id, method, params };
  ws.send(JSON.stringify(payload));
}

function cleanupAndExit(code) {
  console.log('\nClosing server...');
  wss.close(() => {
    process.exit(code);
  });
}

// Timeout after 30 seconds
setTimeout(() => {
  console.log('Timeout waiting for Figma Desktop connection or response.');
  cleanupAndExit(1);
}, 30000);
