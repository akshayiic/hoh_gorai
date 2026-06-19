// test-server.js
const { WebSocketServer } = require('ws');

function startServer(port) {
  try {
    const wss = new WebSocketServer({ port });
    console.log(`WebSocket server listening on ws://localhost:${port}`);

    wss.on('connection', (ws, req) => {
      console.log(`[Port ${port}] Client connected from ${req.socket.remoteAddress}:${req.socket.remotePort}`);

      ws.on('message', (message) => {
        console.log(`[Port ${port}] Received message:`, message.toString());
      });

      ws.on('close', (code, reason) => {
        console.log(`[Port ${port}] Connection closed. Code: ${code}, Reason: ${reason}`);
      });

      ws.on('error', (err) => {
        console.error(`[Port ${port}] Connection error:`, err);
      });

      // Send a test query to see if it responds to figma-console-mcp protocol or the architecture protocol
      // Let's try both formats after 2 seconds
      setTimeout(() => {
        console.log(`[Port ${port}] Sending architecture test GET_SELECTION...`);
        ws.send(JSON.stringify({
          id: 'test-req-arch',
          action: 'GET_SELECTION'
        }));
      }, 2000);

      setTimeout(() => {
        console.log(`[Port ${port}] Sending figma-console-mcp test EXECUTE_CODE...`);
        ws.send(JSON.stringify({
          type: 'EXECUTE_CODE',
          code: 'figma.currentPage.selection.map(n => ({ id: n.id, name: n.name }))'
        }));
      }, 4000);
    });

    wss.on('error', (err) => {
      console.error(`[Port ${port}] Server error:`, err.message);
    });

    return wss;
  } catch (err) {
    console.error(`[Port ${port}] Failed to start server:`, err.message);
  }
}

const wss9223 = startServer(9223);
const wss9224 = startServer(9224);

// Keep alive for 15 seconds
setTimeout(() => {
  console.log('Shutting down test servers...');
  if (wss9223) wss9223.close();
  if (wss9224) wss9224.close();
  process.exit(0);
}, 15000);
