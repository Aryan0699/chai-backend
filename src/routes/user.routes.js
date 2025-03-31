import { Router } from "express";
import {loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/user.controller.js";
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

export default userRouter;
