import { WebSocketServer, WebSocket } from 'ws';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config()

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map();
const mongoClient = new MongoClient(process.env.MONGODB_URI)

async function startServer() {
  await mongoClient.connect();
  const db = mongoClient.db("main")
  const messagesCollection = db.collection("conversation_message")
  const locationCollection = db.collection("location_share")
  console.log("MongoDB connected...")

  wss.on('connection', function connection(ws) {
    console.log("Client connected...")

    ws.on('message', async (raw) => {
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
        if (!ws.userId) return;

        const text = String(message.text ?? "").trim();
        if (!text) return;

        const savedMsg = {
          conversation_id: new ObjectId(message.conversation_id),
          sender_id: new ObjectId(message.from),
          content: message.text,
          createdAt: new Date()
        }
        const dbInsert = await messagesCollection.insertOne(savedMsg)

        for (const userId of message.to) {
          const targetSocket = clients.get(userId);

          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({
              type: "chat",
              conversation_id: message.conversation_id,
              from: message.from,
              text: message.text
            }));
          }
        }
      }

      if (message.type === 'location_update') {
        if (!ws.userId) return;

        const { latitude, longitude, accuracy, to } = message;

        await locationCollection.updateOne(
          { user_id: new ObjectId(ws.userId) },
          { $set: { latitude, longitude, accuracy, updatedAt: new Date() } }
        );

        for (const userId of to) {
          const targetSocket = clients.get(userId);
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({
              type: 'location_update',
              from: ws.userId,
              latitude,
              longitude,
              accuracy
            }));
          }
        }
      }

      if (message.type === 'location_stop') {
        if (!ws.userId) return;

        const { to } = message;

        await locationCollection.updateOne(
          { user_id: new ObjectId(ws.userId) },
          { $set: { isActive: false, updatedAt: new Date() } }
        );

        for (const userId of to) {
          const targetSocket = clients.get(userId);
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({
              type: 'location_stop',
              from: ws.userId
            }));
          }
        }
      }
    })

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`${ws.userId} disconnected`);
      }
    });
  });
}

startServer();