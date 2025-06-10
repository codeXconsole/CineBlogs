import express from "express"
import { configDotenv } from "dotenv"
import { connect } from "./src/database/db.js"
import cors from "cors"
import userRouter from "./src/routes/user.routes.js"
import postRouter from "./src/routes/post.route.js"
import messageRouter from "./src/routes/message.route.js"
import bodyParser from "body-parser"
import http from "http";
import { Server } from "socket.io";
import { Message } from "./src/models/message.model.js"
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';

configDotenv()
export const app = express()

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Register routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/message", messageRouter)

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user connection
  socket.on("user_connected", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User connected:", userId, "Socket ID:", socket.id);
  });

  // Handle typing events
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId, receiverId });
    }
  });

  // Handle stop typing events
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId, receiverId });
    }
  });
  
  // Handle all types of messages (text, file, image, etc.)
  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, content, type, fileUrl } = data;
      
      // Broadcast to receiver
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          ...data,
          timestamp: new Date().toISOString()
        });
      }
      
      // Broadcast to sender for confirmation
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", {
          ...data,
          timestamp: new Date().toISOString()
        });
      }

      // Broadcast to all users in the conversation
      io.emit("messageUpdate", {
        senderId,
        receiverId,
        type: "new_message"
      });
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Handle message deletion
  socket.on("messageDeleted", async (data) => {
    try {
      const { messageId, senderId, receiverId } = data;
      
      // Broadcast to receiver
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { messageId });
      }
      
      // Broadcast to sender for confirmation
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeleted", { messageId });
      }
    } catch (error) {
      console.error("Error handling message deletion:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    let disconnectedUserId;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      console.log("User disconnected:", disconnectedUserId);
    }
  });
});

// Start server
server.listen(process.env.PORT, () => console.log(`App is running on ${process.env.PORT}`))
connect()