import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
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


export default userRouter;
