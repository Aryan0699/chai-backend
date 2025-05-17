import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
export const verifyJWT=asyncHandler(async(req,_,next)=>

{
    // console.log("VerifyJWT_REQ:",req);
    //get token from frontedn wither through cookies or in header ke nader Authorisation
    try{
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token)
    {
        throw new ApiError(401,"Unauthorised Request");
    }  
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)//returns payload
    //payload has user details
    const user=await User.findById(decodedToken._id).select("-password -refreshToken")


    if(!user)
    {
        throw new ApiError(401,"Invalid AccessToken")
    }

    req.user=user;//aage use karne ke liye//Very good and imp step
    next();
    }
    catch(error)
    {
        throw new ApiError(400,error?.messgae ||"Invalid Access Token")
    }

})