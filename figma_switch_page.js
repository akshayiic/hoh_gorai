// figma_switch_page.js
const { WebSocketServer } = require('ws');
const PORT = 9224;
const wss = new WebSocketServer({ port: PORT });
console.log(`Figma Switch Page listening on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log(`Connected to Figma Desktop Bridge!`);

  ws.on('message', async (message) => {
    const text = message.toString();
    try {
      const parsed = JSON.parse(text);

      if (parsed.type === 'FILE_INFO' && parsed.data) {
        console.log(`\nDocument: ${parsed.data.fileName}`);
        console.log(`Currently on page: ${parsed.data.currentPage}`);

        console.log('\nScanning pages and switching to "NEW Draft 2"...');
        sendExecuteCode(ws, 'switch-page', `
          try {
            await figma.loadAllPagesAsync();
            const pages = figma.root.children.filter(n => n.type === "PAGE");
            
            const targetPage = pages.find(p => p.name.trim().toLowerCase() === "new draft 2");
            if (!targetPage) {
              return { 
                success: false, 
                error: "Page 'NEW Draft 2' not found", 
                availablePages: pages.map(p => p.name) 
              };
            }
            
            // Switch page asynchronously if not already on it
            if (figma.currentPage.id !== targetPage.id) {
              await figma.setCurrentPageAsync(targetPage);
            }
            
            // List frames on new page
            const topLevel = figma.currentPage.children.map(n => ({
              id: n.id,
              name: n.name,
              type: n.type,
              width: n.width,
              height: n.height,
              x: n.x,
              y: n.y
            }));
            
            return {
              success: true,
              switchedTo: figma.currentPage.name,
              switchedToId: figma.currentPage.id,
              children: topLevel
            };
          } catch (e) {
            return { success: false, error: e.message };
          }
        `);
      }

      if (parsed.id === 'switch-page') {
        const result = parsed.result;
        if (result && result.success && result.result && result.result.success) {
          const res = result.result;
          console.log(`\n🎉 Active page is now: "${res.switchedTo}" (ID: ${res.switchedToId})`);
          console.log(`\nFound ${res.children.length} top-level element(s) on "${res.switchedTo}":`);
          console.log(`=============================================================`);
          res.children.forEach((child, index) => {
            console.log(`${index + 1}. [${child.type}] "${child.name}" (ID: ${child.id})`);
            console.log(`   Dimensions: ${child.width}x${child.height} at (${child.x}, ${child.y})`);
          });
          console.log(`=============================================================`);
        } else {
          console.error('❌ Failed to switch page or query frames:');
          console.error(JSON.stringify(result, null, 2));
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
}, 25000);
