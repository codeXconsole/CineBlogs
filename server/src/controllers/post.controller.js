import Joi from "joi"
import { Post } from "../models/post.model.js"
import { errorResponse, successResponse, catchResponse, uploadOnCloudinry } from "../utils/functions.js"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"
import { Like } from "../models/like.model.js"

const postValidation = Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().min(5).required(),
  status: Joi.boolean().required(),
  image: Joi.string().required(),
  rating: Joi.number().required(),
})

const createPost = async (req, res) => {
  try {
    const { error } = postValidation.validate(req.body);
    if (error) return errorResponse(res, error.message);

    const { userId, title, content, status, image, rating } = req.body;

    if (userId != req.user._id) return errorResponse(res, "User is not the same");

    const user = await User.findOne({ _id: userId });
    if (!user) return errorResponse(res, "User not found");

    const post = await Post.create({ userId, title, content, image, status, rating });
    if (!post) return errorResponse(res, "Error while creating post");

    await User.updateOne({ _id: userId }, { $inc: { posts: 1 } });

    return successResponse({ res, message: "Post created successfully", data: post });
  } catch (error) {
    return catchResponse(res, "Error occurred in creating post", error);
  }
};

const postUpdateValidation = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().min(5).required(),
  status: Joi.boolean().required()
})

const updatePost = async (req, res) => {

  try {
    const { error } = postUpdateValidation.validate(req.body)
    if (error) return errorResponse(res, error.message);
    const { title, content, status } = req.body;
    const post = await Post.findOneAndUpdate(
      { _id: req.params.postId, userId: req.user._id },
      { title, content, status },
      { new: true }
    );
    if (!post) return errorResponse(res, "Post not found or user not authorized");

    return successResponse({ res, message: "Post updated successfully", data: post });
  } catch (error) {
    return catchResponse(res, "Error occurred while updating post", error);
  }
}


const getAllPostsOfUser = async (req, res) => {
  try {
    const userId = req.params.userId
    const filter = { userId };

    if (userId !== String(req.user._id)) filter.status = true;
    const posts = await Post.find(filter)
    if (!posts) return errorResponse(res, "Error while getting posts");

    return successResponse({ res, message: "Posts get successfully", data: posts });
  } catch (error) {
    return catchResponse(res, "Error occurred in get posts", error);
  }
}

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId).populate('userId', 'username email profileImage');
    if (!post) {
      return errorResponse(res, "Post not found");
    }

    const userReaction = await Like.findOne({ userId, postId });

    const userHasLiked = userReaction && userReaction.value === 1;
    const userHasDisliked = userReaction && userReaction.value === -1;
    return successResponse({
      res,
      message: "Post found successfully",
      data: {
        ...post.toObject(),
        userHasLiked,
        userHasDisliked,
      },
    });
  } catch (error) {
    return catchResponse(res, "Error occurred while fetching post by ID", error.message);
  }
};

const getAllPostsById = async (req, res) => {

  try {
    const { userId } = req.params;
    const post = await Post.find({ userId }, 'image');

    return successResponse({ res, message: "Posts found successfully", data: post });

  } catch (error) {
    return catchResponse(res, "Error occurred while fetching posts", error.message);
  }
};

const getAllPosts = async (req, res) => {
  try {
    const category = req.query.category;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const regex = new RegExp(search, "i");
    const minRating = parseFloat(req.query.rating);

    const matchStage = { status: true };
    // if (!isNaN(minRating)) {
    //   matchStage.rating = { $gte: minRating };
    // }
    if (search) {
      matchStage.$or = [
        { title: { $regex: regex } },
        { category: { $regex: regex } }
      ];
    }

    // Count total matching posts
    const postCount = await Post.countDocuments(matchStage);

    const posts = await Post.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'authorData'
        }
      },
      {
        $unwind: {
          path: "$authorData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          image: 1,
          category: 1,
          createdAt: 1,
          likes: 1,
          dislikes: 1,
          content: 1,
          rating: 1,
          author: "$authorData._id",
          authorName: "$authorData.username",
          authorProfile: "$authorData.profileImage"
        }
      }
    ]);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "Post Not Found By Filters" });
    }

    return res.status(200).json({ posts, postCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: `Error Occurred While Fetching Data By Filters`,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.postId, userId: req.user._id });
    if (!post) return errorResponse(res, "Post not found or user not authorized");

    await User.updateOne({ _id: req.user._id }, { $inc: { posts: -1 } });

    return successResponse({ res, message: "Post deleted successfully", data: {} });
  } catch (error) {
    return catchResponse(res, "Error occurred while deleting post", error);
  }
};

export {
  createPost,
  getAllPosts,
  getAllPostsOfUser,
  updatePost,
  deletePost,
  getPostById,
  getAllPostsById,
}