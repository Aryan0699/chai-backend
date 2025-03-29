import {asyncHandler} from "../utils/asyncHandler.js"
//jaise export vaise import 
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
//ye User model is like a classs jisse multiple objects called users create ho sakte hai
const registerUser =asyncHandler(async (req,res)=>
{
    //get user details from user
    //validation  not empty
    //if already exist : username
    //check for images and for avatar
    //upload them to cloudinary,avatar
    //create user object
    //create entry in db
    //remove password and refresh token field from respone
    //check for usercreation
    //return res if not then error

    //form se ya body se data aa rha to req.body me mil jayega
    //if url ke through aa raha then kuch aur
      const {username,email,fullname,password}=req.body

      const fields=["fullname","username","email","password"]

      for(const field in fields)
      {
        // if(fullname=="")
        if(!field) //better check many things
        {
          //throw a object of ApirError 
          throw new ApiError(400,`${field} is required`)
        }
      }
      //*** Something New
      const existingUser=await User.findOne({
        $or:[{username},{email}]
      })

      if(existingUser)
      {
        throw new ApiError(409,"User with email or username already exist")
      }
      //upload.fields karne par req.files me key value pair store ho jata hai key==name and value of Array of uploaded files
      //avatar[0] means first uploaded file 
      //uska path
      const avatarLocalPath=req.files?.avatar[0]?.path;
      console.log(avatarLocalPath)
      const coverImageLocalPath=req.files?.coverImage[0]?.path;
      
      if(!avatarLocalPath)
      {
        throw new ApiError(400,"Avatar File is required")
      }
      const avatar=await uploadOnCloudinary(avatarLocalPath)
      const coverImage=await uploadOnCloudinary(coverImageLocalPath )

      //no need still checking
      if(!avatar)
      {
        throw new ApiError(400,"Avatar file is required!")
      }
      //User.create() already creates a new document internally. no need of "new User.create()"
      //automatically saves as well
      //ANOTHER METHOD
    //   const newUser = new User({
    //     username: username,
    //     password: hashedPassword,
    //     email: email,
    // });
    // await newUser.save();
    ////////
      const newUser=await User.create({
        //password apne aap ban jayega save hone se pehele
        username:username.toLowerCase(),
        email:email,
        fullname,
        avatar:avatar.url,
        //coverImage ke liye check nahi lagaya tha ho sakta hai na ho
        coverImage:coverImage?.url || "",
      })

      //Good way to check if user created 
      const createdUser=await User.findById(newUser._id)
      .select("-password -refreshToken")

      if(createdUser)
      {
        throw new ApiError(500,"Something went wrong while registering the user")
      }

      return res.status(201).json(
        new ApiResponse(201,createdUser,"User Registered Successfully")
      )







})
export default registerUser
//ek url create hoga for register uss pe jab bhi rq aayegi to vo isko execute kar dega and user will be registered

//TODO : console log karke req.files req.body existingUser