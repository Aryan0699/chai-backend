import { Router } from "express";
import registerUser from "../controllers/user.controller.js";

// created a reference of router just like app
//router bana liya from function
const userRouter=Router();
//ab aage route karo kahan jana hai vaha kya hoga

userRouter.route("/register").post(registerUser) //1 way to define
// userRouter.post("/login",loginUser);


export default userRouter;
