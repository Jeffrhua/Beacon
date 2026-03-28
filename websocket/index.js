import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map();

wss.on('connection', function connection(ws) {
  console.log("Client connected")

  ws.on('message', (raw) => {
    const message = JSON.parse(raw.toString());

    // Register a user, set the id as the current user for this instance
    if (message.type === 'register') {
      clients.set(message.userId, ws);
      ws.userId = message.userId;
      console.log(`${message.userId} registered`);
      return;
    }

    // Handle any messages
    if (message.type === 'chat') {
      const targetSocket = clients.get(message.to);

      if (targetSocket && targetSocket.readyState === ws.OPEN) {
        console.log("Message sent....")
        targetSocket.send(JSON.stringify({
          type: 'chat',
          from: message.from,
          text: message.text
        }));
      }
    }
  })
});