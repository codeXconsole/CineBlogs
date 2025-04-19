import Joi from "joi"
import { Post } from "../models/post.model.js"
import { errorResponse, successResponse, catchResponse, uploadOnCloudinry } from "../utils/functions.js"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"

const postValidation = Joi.object({
    userId: Joi.string().required(),
    title: Joi.string().required(),
    content: Joi.string().min(5).required(),
    status: Joi.boolean().required(),
    image: Joi.string().required(),
})
const createPost = async (req, res) => {
  
    try {
        const { error } = postValidation.validate(req.body)
        if (error) return errorResponse(res, error.message);
        const { userId, title, content, status, image } = req.body;

        if(userId != req.user._id) return errorResponse(res, "User is not the same");

        const user = await User.findOne({_id: userId});
        if (!user) return errorResponse(res, "User not found");

        const post = await Post.create({ userId, title, content, image , status })
        if (!post) return errorResponse(res, "Error while creating post");

        return successResponse({ res, message: "Post created successfully", data: post });
    } catch (error) {
        return catchResponse(res, "Error occurred in creating post", error);
    }
}

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


const getAllPostsOfUser = async (req, res)=>{
    try {
        const userId = req.params.userId
        const posts = await Post.find({userId})
        if(!posts) return errorResponse(res, "Error while getting posts");

        if(posts.length == 0) return errorResponse(res, "No post found");
        
        return successResponse({ res, message: "Posts get successfully", data: posts });
    } catch (error) {
        return catchResponse(res, "Error occurred in get posts", error);
    }
}

const getPostById = async (req, res) => {
  
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate('userId', 'username email');
    if (!post) {
      return errorResponse(res, "Post not found");
    }

    return successResponse({ res, message: "Post found successfully", data: post });

  } catch (error) {
    return catchResponse(res, "Error occurred while fetching post by ID", error.message);
  }
};

const getAllPostsById = async (req, res) => {
  
  try {
    const { userId } = req.params;

    const post = await Post.find({userId}, 'image');

    return successResponse({ res, message: "Posts found successfully", data: post });

  } catch (error) {
    return catchResponse(res, "Error occurred while fetching posts", error.message);
  }
};

const getAllPosts = async (req, res) => {
    try {
      const category = req.query.category;
      const limit = req.query.limit;
      const page = req.query.page;
      const search = req.query.search;
      const regex = new RegExp(search, "i");
      const filters = {
         status: true 
      };
      if (category) filters.category = category;
  
      if (search)
        filters.$or = [
          { title: { $regex: regex } },
          { category: { $regex: regex } }
        ];
  
      const postCount = await Post.countDocuments(filters);
      const posts = await Post.find(filters)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
      if (!posts)
        return res.json({ 
          error: `Post Not Found By Filters`,
        });
  
      return res.status(200).json({ posts, postCount });
    } catch (error) {
      return res.json({
        error: `Error Occured While Fetching Data By Filters`,
      });
    }
  };

const deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.postId, userId: req.user._id });
        if (!post) return errorResponse(res, "Post not found or user not authorized");

        return successResponse({ res, message: "Post deleted successfully", data: {} });
    } catch (error) {
        return catchResponse(res, "Error occurred while deleting post", error);
    }
}

const addLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const user = req.user;

    if (!mongoose.isValidObjectId(postId)) {
      return errorResponse(res, "Invalid post ID");
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      [
        {
          $set: {
            dislikes: {
              $filter: {
                input: "$dislikes",
                as: "dislike",
                cond: { $ne: ["$$dislike.userId", user._id] },
              },
            },
            likes: {
              $cond: [
                {
                  $in: [user._id, "$likes.userId"],
                },
                {
                  $filter: {
                    input: "$likes",
                    as: "like",
                    cond: { $ne: ["$$like.userId", user._id] },
                  },
                },
                {
                  $concatArrays: [
                    "$likes",
                    [
                      {
                        userId: user._id,
                        profileImage: user.profileImage,
                        email: user.email,
                        username: user.username,
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
      ],
      { new: true }
    );

    if (!updatedPost) {
      return errorResponse(res, "Post not found or unable to update");
    }

    const isLiked = updatedPost.likes.some((like) => like.userId.equals(user._id));

    const message = isLiked
      ? "Post liked successfully"
      : "Like removed successfully";

    return successResponse({ res, message, data: {} });
  } catch (error) {
    console.log(error);
    return catchResponse(res, "Error occurred in like", error);
  }
};


const addDislike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const user = req.user;

    if (!mongoose.isValidObjectId(postId)) {
      return errorResponse(res, "Invalid post ID");
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      [
        {
          $set: {
            likes: {
              $filter: {
                input: "$likes",
                as: "like",
                cond: { $ne: ["$$like.userId", user._id] },
              },
            },
            dislikes: {
              $cond: [
                {
                  $in: [user._id, "$dislikes.userId"],
                },
                {
                  $filter: {
                    input: "$dislikes",
                    as: "dislike",
                    cond: { $ne: ["$$dislike.userId", user._id] },
                  },
                },
                {
                  $concatArrays: [
                    "$dislikes",
                    [
                      {
                        userId: user._id,
                        profileImage: user.profileImage,
                        email: user.email,
                        username: user.username,
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
      ],
      { new: true }
    );

    if (!updatedPost) {
      return errorResponse(res, "Post not found or unable to update");
    }

    const isDisliked = updatedPost.dislikes.some((dislike) =>
      dislike.userId.equals(user._id)
    );

    const message = isDisliked
      ? "Post disliked successfully"
      : "Dislike removed successfully";

    return successResponse({ res, message, data: {} });
  } catch (error) {
    console.log(error);
    return catchResponse(res, "Error occurred in dislike", error);
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
    addLike,
    addDislike
}