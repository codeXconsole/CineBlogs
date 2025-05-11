import { createUser, follow, getAllArtists, getCurrentUser, getUserById, getUserFollowers, getUserFollowings, login, logOut, updateUserProfile } from "../controllers/user.controller.js"
import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = Router()

userRouter.route("/create").post( upload.single('profileImage') ,createUser)
userRouter.route("/follow/:followId").post(authenticateToken, follow)
userRouter.route("/login").post(login)
userRouter.route("/logout").post(authenticateToken, logOut)
userRouter.route("/get-user/:id").get(authenticateToken, getUserById)
userRouter.route("/current-user").get( authenticateToken, getCurrentUser);
userRouter.route("/artists").get( authenticateToken, getAllArtists);
userRouter.route("/update-profile").put(authenticateToken, upload.single('profileImage'), updateUserProfile);
userRouter.route("/followings/:userId").get(authenticateToken, getUserFollowings); 
userRouter.route("/followers/:userId").get(authenticateToken, getUserFollowers); 
export default userRouter