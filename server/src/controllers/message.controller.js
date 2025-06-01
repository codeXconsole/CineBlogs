import { Message } from "../models/message.model.js";
import { catchResponse, successResponse, errorResponse, uploadOnCloudinry, deleteImage } from "../utils/functions.js";

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;
    const senderId = req.user._id;
    let fileUrl = null;
    let fileSize = null;

    if (!receiverId) {
      return errorResponse(res, "Receiver ID is required");
    }

    // Handle file upload if type is not text
    if (type !== 'text' && req.file) {
      const uploadResult = await uploadOnCloudinry(req.file.path, {
        resource_type: "auto", // This will automatically detect the file type
        folder: "chat_media"
      });
      
      if (!uploadResult) {
        return errorResponse(res, "Failed to upload the file");
      }
      fileUrl = uploadResult.url;
      fileSize = req.file.size; // Get file size from multer
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content: content || (req.file ? req.file.originalname : ''),
      type: type || (req.file ? req.file.mimetype.split('/')[0] : 'text'),
      fileUrl,
      fileSize,
    });

    return successResponse({
      res,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.log(error);
    return catchResponse(res, "Error sending message", error);
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    return successResponse({
      res,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    return catchResponse(res, "Error retrieving messages", error);
  }
};

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData", // Unwind before projecting
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          userData: {
            _id: "$userData._id",
            username: "$userData.username",
            profileImage: "$userData.profileImage",
          },
        },
      },
      {
        $sort: { "lastMessage.timestamp": -1 },
      },
    ]);

    return successResponse({
      res,
      message: "Conversations retrieved successfully",
      data: conversations,
    });
  } catch (error) {
    return catchResponse(res, "Error retrieving conversations", error);
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages"
      });
    }

    // Update the message
    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit("messageEdited", message);

    return res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error("Error editing message:", error);
    return res.status(500).json({
      success: false,
      message: "Error editing message"
    });
  }
};

export { sendMessage, getMessages, getAllConversations };