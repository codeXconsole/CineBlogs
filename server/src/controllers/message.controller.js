import { Message } from "../models/message.model.js";
import { catchResponse, successResponse } from "../utils/functions.js";

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return errorResponse(res, "Receiver ID and content are required");
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content,
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

export { sendMessage, getMessages, getAllConversations };