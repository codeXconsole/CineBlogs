import { catchResponse, errorResponse, successResponse } from "../utils/functions.js";
import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";

const likeOrDislikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const { value } = req.body;

        if (![1, -1].includes(value)) {
            return errorResponse(res, "Invalid like/dislike value");
        }

        const existing = await Like.findOne({ userId, postId });

        if (existing) {
            if (existing.value === value) {
                await Like.deleteOne({ _id: existing._id });
            } else {
                existing.value = value;
                await existing.save();
            }
        } else {
            await Like.create({ userId, postId, value });
        }
        const likeCount = await Like.countDocuments({ postId, value: 1 });
        const dislikeCount = await Like.countDocuments({ postId, value: -1 });


        await Post.findByIdAndUpdate(postId, {
            likes: likeCount,
            dislikes: dislikeCount,
        });

        return successResponse({ res, message: "Reaction processed" });
    } catch (error) {
        console.error(error);
        return catchResponse(res, "Error processing like/dislike", error.message);
    }
};


export { likeOrDislikePost };