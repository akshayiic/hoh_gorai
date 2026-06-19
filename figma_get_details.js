// figma_get_details.js
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const FRAME_IDS = [
  '2136:406', // Loading screen
  '2136:418', // Welcome page
  '2136:429', // Home Screen
  '2136:2',   // Screen 1
  '2136:309', // Screen 2
  '2136:593', // Screen 3
  '2136:785', // Screen 4
  '2136:156'  // Screen 5
];

let exited = false;

function handleConnection(ws, port) {
  console.log(`[Port ${port}] Connected to Figma Desktop Bridge!`);

  ws.on('message', async (message) => {
    const text = message.toString();
    try {
      const parsed = JSON.parse(text);

      if (parsed.type === 'FILE_INFO' && parsed.data) {
        console.log(`[Port ${port}] File Name: ${parsed.data.fileName}`);
        console.log(`[Port ${port}] Page:      ${parsed.data.currentPage}`);

        console.log(`[Port ${port}] Querying detailed nodes...`);
        sendExecuteCode(ws, 'get-details', `
          try {
            const frameIds = ${JSON.stringify(FRAME_IDS)};
            
            function serializeNode(node) {
              if (!node) return null;
              
              const res = {
                id: node.id,
                name: node.name,
                type: node.type,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height
              };
              
              if ('fills' in node && node.fills) {
                res.fills = node.fills.map(f => {
                  if (f.type === 'IMAGE') {
                    return { type: 'IMAGE', imageHash: f.imageHash, scaleMode: f.scaleMode };
                  }
                  return f;
                });
              }
              if ('strokes' in node) res.strokes = node.strokes;
              if ('strokeWeight' in node) res.strokeWeight = node.strokeWeight;
              if ('effects' in node) res.effects = node.effects;
              if ('cornerRadius' in node) res.cornerRadius = node.cornerRadius;
              if ('opacity' in node) res.opacity = node.opacity;
              
              // Layout / Flex
              if ('layoutMode' in node) res.layoutMode = node.layoutMode;
              if ('primaryAxisSizingMode' in node) res.primaryAxisSizingMode = node.primaryAxisSizingMode;
              if ('counterAxisSizingMode' in node) res.counterAxisSizingMode = node.counterAxisSizingMode;
              if ('paddingLeft' in node) res.paddingLeft = node.paddingLeft;
              if ('paddingRight' in node) res.paddingRight = node.paddingRight;
              if ('paddingTop' in node) res.paddingTop = node.paddingTop;
              if ('paddingBottom' in node) res.paddingBottom = node.paddingBottom;
              if ('itemSpacing' in node) res.itemSpacing = node.itemSpacing;
              if ('layoutAlign' in node) res.layoutAlign = node.layoutAlign;
              if ('layoutGrow' in node) res.layoutGrow = node.layoutGrow;
              
              // Text
              if ('characters' in node) {
                res.characters = node.characters;
                res.fontSize = node.fontSize;
                res.fontName = node.fontName;
                res.fontWeight = node.fontWeight;
                res.lineHeight = node.lineHeight;
                res.letterSpacing = node.letterSpacing;
              }
              
              // Children
              if ('children' in node && node.children) {
                res.children = node.children.map(serializeNode).filter(Boolean);
              }
              
              return res;
            }
            
            const results = {};
            for (const id of frameIds) {
              const node = figma.getNodeById(id);
              if (node) {
                results[id] = serializeNode(node);
              }
            }
            
            return { success: true, frames: results };
          } catch (e) {
            return { success: false, error: e.message };
          }
        `);
      }

      if (parsed.id === 'get-details') {
        const result = parsed.result;
        if (result && result.success && result.result && result.result.success) {
          const frames = result.result.frames;
          const outputPath = path.join(__dirname, 'figma_data.json');
          fs.writeFileSync(outputPath, JSON.stringify(frames, null, 2), 'utf-8');
          console.log(`\n✅ Successfully extracted detailed design tree for all requested screens.`);
          console.log(`💾 Saved to: [figma_data.json](file:///${outputPath.replace(/\\/g, '/')})`);
          safeExit(0);
        } else {
          console.error(`[Port ${port}] ❌ Failed to get details:`, result);
          safeExit(1);
        }
      }
    } catch (e) {
      console.error(`[Port ${port}] Error handling message:`, e);
      safeExit(1);
    }
  });
}

function sendExecuteCode(ws, id, code) {
  const payload = {
    id,
    method: 'EXECUTE_CODE',
    params: { code }
  };
  ws.send(JSON.stringify(payload));
}

let wss9223, wss9224;

try {
  wss9223 = new WebSocketServer({ port: 9223 });
  console.log('WebSocket server listening on ws://localhost:9223');
  wss9223.on('connection', (ws) => handleConnection(ws, 9223));
} catch (e) {
  console.error('Failed to start server on port 9223:', e.message);
}

try {
  wss9224 = new WebSocketServer({ port: 9224 });
  console.log('WebSocket server listening on ws://localhost:9224');
  wss9224.on('connection', (ws) => handleConnection(ws, 9224));
} catch (e) {
  console.error('Failed to start server on port 9224:', e.message);
}

function safeExit(code) {
  if (exited) return;
  exited = true;
  console.log('Exiting...');
  if (wss9223) wss9223.close();
  if (wss9224) wss9224.close();
  setTimeout(() => {
    process.exit(code);
  }, 100);
}

setTimeout(() => {
  console.log('Timeout waiting for Figma Desktop connection or response.');
  safeExit(1);
}, 25000);
