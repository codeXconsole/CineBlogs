import e, { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { addDislike, addLike, createPost, deletePost, getAllPosts, getAllPostsById, getAllPostsOfUser, getPostById, updatePost } from "../controllers/post.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
const postRouter = Router()

postRouter.route("/create").post(authenticateToken, createPost)
postRouter.route("/get-posts").get(authenticateToken, getAllPosts)
postRouter.route("/get-userposts/:userId").get(authenticateToken, getAllPostsOfUser)
postRouter.route("/update-post/:postId").put(authenticateToken, updatePost);
postRouter.route("/delete-post/:postId").delete(authenticateToken, deletePost);
postRouter.route('/get-post/:postId').get(authenticateToken,getPostById);
postRouter.route('/get-posts-by-id/:userId').get(authenticateToken,getAllPostsById);
postRouter.route('/like/:postId').post(authenticateToken,addLike);
postRouter.route('/dislike/:postId').post(authenticateToken,addDislike);

export default postRouter