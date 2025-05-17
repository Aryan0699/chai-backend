import { Router } from "express";
import {changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateUserAvatar, 
    updateUserCoverImage,
    updateAccountDetails
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
// created a reference of router just like app
//router bana liya from function
const userRouter=Router();
//ab aage route karo kahan jana hai vaha kya hoga

userRouter.route("/register").post(

    //upload.single for single file
    //upload.fields for (accept) array of filed objects
    //upload.array nahi chalega kyuki ek hi field me multiple files lega mujhe alag filed chaiye
    //kya accept karna hai aur kitna ye batana hoga
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]) 
    ,registerUser) //1 way to define
// userRouter.post("/login",loginUser);

userRouter.route("/login").post(loginUser)

//securedRoutes
//next in verifyJWT ,mera kaam ho gaya ab aage logoutUser ke pass chale jayega
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT,changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT,getCurrentUser)
userRouter.route("/update-account").patch(verifyJWT,updateAccountDetails) //post nahi hoga kyuki pura change karega
userRouter.route("/update-avatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar)//patch ki post ?? 
userRouter.route("/cover-image").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
userRouter.route("/channel/:username").get(verifyJWT,getUserChannelProfile)
userRouter.route("/history").get(verifyJWT,getWatchHistory)
export default userRouter;

