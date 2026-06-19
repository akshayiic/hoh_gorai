// test-server-2.js
const { WebSocketServer } = require('ws');

function startServer(port) {
  try {
    const wss = new WebSocketServer({ port });
    console.log(`WebSocket server listening on ws://localhost:${port}`);

    wss.on('connection', (ws, req) => {
      console.log(`[Port ${port}] Client connected!`);

      ws.on('message', (message) => {
        const text = message.toString();
        console.log(`[Port ${port}] Received:`, text);
        try {
          const parsed = JSON.parse(text);
          if (parsed.id === 'test-req-selection') {
            console.log(`[Port ${port}] SUCCESS! Selection result:`, JSON.stringify(parsed.result, null, 2));
            ws.close();
            process.exit(0);
          }
        } catch (e) {}
      });

      // Send the correct command format
      setTimeout(() => {
        const payload = {
          id: 'test-req-selection',
          method: 'EXECUTE_CODE',
          params: {
            code: `
              try {
                const nodes = figma.currentPage.selection.map(n => ({
                  id: n.id,
                  name: n.name,
                  type: n.type,
                  x: n.x,
                  y: n.y,
                  width: n.width,
                  height: n.height
                }));
                return { success: true, selection: nodes };
              } catch (e) {
                return { success: false, error: e.message };
              }
            `
          }
        };
        console.log(`[Port ${port}] Sending command...`);
        ws.send(JSON.stringify(payload));
      }, 1500);
    });

    return wss;
  } catch (err) {
    console.error(`[Port ${port}] Failed to start:`, err.message);
  }
}

startServer(9224);

setTimeout(() => {
  console.log('Timeout. Exiting...');
  process.exit(0);
}, 10000);
