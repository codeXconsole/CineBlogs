import { User } from "../models/user.model.js"
import joi from "joi"
import mongoose from "mongoose"
import { Follow } from "../models/followers.model.js"
import { Post } from "../models/post.model.js"
import { successResponse, errorResponse, catchResponse, generateAccessToken, bcryptPassCompare, uploadOnCloudinry, deleteImage } from "../utils/functions.js"
const userValidationSchema = joi.object({
  username: joi.string().min(3).max(30),
  email: joi.string().email().required(),
  password: joi.string().required().min(4),
})
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const { error } = userValidationSchema.validate(req.body);

    if (error) return errorResponse(res, error.message);

    const userAlreadyExists = await User.findOne({ username });
    if (userAlreadyExists) return errorResponse(res, "User already exists");

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return errorResponse(res, "Email already exists");

    const token = generateAccessToken({ username, email })
    const user = await User.create({ username, email, password, token });
    if (!user) return errorResponse(res, "User not created");

    const userResponse = user.toObject();
    delete userResponse.password
    return successResponse({ res, message: "User created successfully", data: userResponse });
  } catch (error) {
    return catchResponse(res, "Error occurred creating user", error.message);
  }
};

const loginValidationSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required().min(4)
})

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const { error } = await loginValidationSchema.validate(req.body)
    if (error) return errorResponse(res, error.message);

    const user = await User.findOne({ email })
    if (!user) return errorResponse(res, "User not found");
    const result = await bcryptPassCompare(password, user.password)
    if (result === false) return errorResponse(res, "Incorrect password");
    const username = user.username
    if (result === true) {
      const token = generateAccessToken({ username, email })

      const newUser = await User.findOneAndUpdate(
        { email },
        { token },
        { new: true }
      ).select("-password");
      if (!newUser) return errorResponse(res, "Token not updated");

      return successResponse({ res, message: "User login successfully", data: newUser });
    }
    return errorResponse(res, "Incorrect password");
  } catch (error) {
    return catchResponse(res, "Error occurred in login user", error.message);
  }
}

const logOut = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ email: req.user.email }, { token: "" })
    if (!user) return errorResponse(res, "User not updated");
    return successResponse({ res, message: "User logged out successfully", data: {} });
  } catch (error) {
    return catchResponse(res, "Error occurred in logout user", error.message);
  }
}

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return errorResponse(res, "User not found.");
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse({ res, message: "User found successfully", data: userResponse });
  } catch (error) {
    return catchResponse(res, "Error occurred in fetching current user", error.message);
  }
};

const getAllArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";

    const regex = new RegExp(search, "i");
    const filters = {}
    if (search)
      filters.$or = [
        { username: { $regex: regex } },
        { email: { $regex: regex } }
      ];

    const pipeline = [
      {
        $match: filters
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts"
        }
      },
      {
        $addFields: {
          postCount: { $size: "$posts" }
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      },
      {
        $project: {
          password: 0,
          posts: 0
        }
      }
    ];

    const users = await User.aggregate(pipeline);
    const userCount = await User.countDocuments(filters);

    return res.status(200).json({
      artists: users,
      artistsCount: userCount
    });

  } catch (error) {
    console.error("Error in getAllArtists:", error);
    return res.status(500).json({
      error: "Error occurred while fetching artists.",
    });
  }
};


const getUserById = async (req, res) => {
  try {
    const userId = req.params.id
    if (!mongoose.isValidObjectId(userId)) {
      return errorResponse("Invalid userId");
    }
    const user = await User.findOne({ _id: userId }, '-password -__v')
    if (!user) return errorResponse(res, "User not found");

    const posts = await Post.countDocuments({ userId: userId })

    const followers = await Follow.find({ userId })
    const userData = {
      ...user.toObject(),
      followers: followers.length > 0 ? followers : [],
      posts
    };
    return successResponse({ res, message: "User found successfully", data: userData });
  } catch (error) {
    return catchResponse(res, "Error occurred in get user by id", error.message);
  }
}

const follow = async (req, res) => {
  try {
    const userId = req.user._id;
    const followId = req.params.followId;

    if (!userId || !followId) {
      return errorResponse(res, "FollowId is required");
    }

    if (!mongoose.isValidObjectId(followId)) {
      return errorResponse(res, "Invalid followId");
    }

    if (userId.toString() === followId.toString()) {
      return errorResponse(res, "You cannot follow yourself");
    }

    // Fetch both users in parallel
    const [follower, user] = await Promise.all([
      User.findById(userId),
      User.findById(followId),
    ]);

    if (!follower || !user) {
      return errorResponse(res, "User not found");
    }

    // Check if already following
    const followExists = await Follow.findOne({
      userId: followId,
      "follower._id": userId,
    });

    if (followExists) {
      // Unfollow
      await Follow.deleteOne({
        userId: followId,
        "follower._id": userId,
      });
      return successResponse({ res, message: "Unfollowed successfully", data: {} });
    }

    // Follow
    await Follow.create({
      userId: followId,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || null,
      },
      follower: {
        _id: follower._id,
        username: follower.username,
        email: follower.email,
        profileImage: follower.profileImage || null,
      },
    });

    return successResponse({ res, message: "Followed successfully", data: {} });
  } catch (error) {
    console.error(error);
    return catchResponse(res, "Error occurred in following", error.message);
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const { bio, username, email } = req.body;
    const userId = req.user._id;

    const existingUser = await User.findById(userId);
    if (!existingUser) return errorResponse(res, "User not found");

    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return errorResponse(res, "Email is already in use by another account");
    }

    let profileImageUrl = existingUser.profileImage;

    if (req.file) {

      if (existingUser.profileImage) {
        const publicId = existingUser.profileImage.split('/').pop().split('.')[0];
        await deleteImage(publicId);
      }

      const uploadResult = await uploadOnCloudinry(req.file.path);
      if (!uploadResult) return errorResponse(res, "Failed to upload the new image");

      profileImageUrl = uploadResult.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio, username, email, profileImage: profileImageUrl },
      { new: true }
    );

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return successResponse({
      res,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.log('Error updating profile:', error);
    return catchResponse(res, "Error updating profile", error.message)
  }
};

const getUserFollowings = async (req, res) => {
  try {
    const userId = req.params.userId
    if (!mongoose.isValidObjectId(userId)) {
      return errorResponse(res, "Invalid id")
    }

    const followings = await Follow.find({ 'follower._id': userId });
    return successResponse({ res, message: "Get followings successfully", data: followings });

  } catch (error) {
    console.log(error)
    return catchResponse(res, "Error occured in get followings", error.message)
  }
}

export {
  createUser,
  login,
  logOut,
  getUserById,
  getAllArtists,
  getCurrentUser,
  follow,
  updateUserProfile,
  getUserFollowings
}
