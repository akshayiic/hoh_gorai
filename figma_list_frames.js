// figma_list_frames.js
const { WebSocketServer } = require('ws');
const PORT = 9224;
const wss = new WebSocketServer({ port: PORT });
console.log(`Figma List Frames listening on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log(`Connected to Figma Desktop Bridge!`);

  ws.on('message', async (message) => {
    const text = message.toString();
    try {
      const parsed = JSON.parse(text);

      if (parsed.type === 'FILE_INFO' && parsed.data) {
        const fileInfo = parsed.data;
        console.log(`\nActive File: ${fileInfo.fileName}`);
        console.log(`Active Page: ${fileInfo.currentPage} (${fileInfo.currentPageId})`);
        
        console.log('\nQuerying top-level elements...');
        // Query top-level frames
        sendExecuteCode(ws, 'list-frames', `
          try {
            const page = figma.currentPage;
            const topLevel = page.children.map(n => ({
              id: n.id,
              name: n.name,
              type: n.type,
              width: n.width,
              height: n.height,
              x: n.x,
              y: n.y
            }));
            return { success: true, children: topLevel };
          } catch (e) {
            return { success: false, error: e.message };
          }
        `);
      }

      if (parsed.id === 'list-frames') {
        const result = parsed.result;
        if (result && result.success && result.result && result.result.success) {
          const children = result.result.children;
          console.log(`\nFound ${children.length} top-level element(s) on the current page:`);
          console.log(`=============================================================`);
          children.forEach((child, index) => {
            console.log(`${index + 1}. [${child.type}] "${child.name}" (ID: ${child.id})`);
            console.log(`   Dimensions: ${child.width}x${child.height} at (${child.x}, ${child.y})`);
          });
          console.log(`=============================================================`);
        } else {
          console.error('❌ Failed to list elements:', result);
        }
        cleanupAndExit(0);
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

function cleanupAndExit(code) {
  wss.close(() => {
    process.exit(code);
  });
}

setTimeout(() => {
  console.log('Timeout waiting for Figma Desktop connection.');
  cleanupAndExit(1);
}, 20000);
