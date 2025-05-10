import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { getAllConversations, getMessages, sendMessage } from "../controllers/message.controller.js"

const messageRouter = Router()
messageRouter.route("/send").post(authenticateToken, sendMessage)         
messageRouter.route("/all/:otherUserId").get(authenticateToken, getMessages)         
messageRouter.route("/conversations").get(authenticateToken, getAllConversations)

export default messageRouter