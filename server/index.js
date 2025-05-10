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
configDotenv()
export const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, content } = data;
    const message = new Message({ senderId, receiverId, content });
    await message.save();
    io.emit("receiveMessage", message);
  });
});

server.listen(process.env.PORT, () => console.log(`App is running on ${process.env.PORT}`))
connect()

app.use("/api/v1/users", userRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/message", messageRouter)