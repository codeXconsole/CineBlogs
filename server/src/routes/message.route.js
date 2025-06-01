import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { getAllConversations, getMessages, sendMessage, editMessage } from "../controllers/message.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const messageRouter = Router()

messageRouter.route("/send").post(authenticateToken, upload.single('file'), sendMessage)         
messageRouter.route("/all/:otherUserId").get(authenticateToken, getMessages)         
messageRouter.route("/conversations").get(authenticateToken, getAllConversations)
messageRouter.route("/:messageId").patch(authenticateToken, editMessage)

export default messageRouter