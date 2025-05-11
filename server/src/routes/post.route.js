import e, { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { createPost, deletePost, getAllPosts, getAllPostsById, getAllPostsOfUser, getPostById, updatePost } from "../controllers/post.controller.js"
import { likeOrDislikePost } from "../controllers/like.controller.js"
const postRouter = Router()

postRouter.route("/create").post(authenticateToken, createPost)
postRouter.route("/get-posts").get(authenticateToken, getAllPosts)
postRouter.route("/get-userposts/:userId").get(authenticateToken, getAllPostsOfUser)
postRouter.route("/update-post/:postId").put(authenticateToken, updatePost);
postRouter.route("/delete-post/:postId").delete(authenticateToken, deletePost);
postRouter.route('/get-post/:postId').get(authenticateToken,getPostById);
postRouter.route('/get-posts-by-id/:userId').get(authenticateToken, getAllPostsById);
postRouter.route('/react/:postId').post(authenticateToken, likeOrDislikePost);

export default postRouter