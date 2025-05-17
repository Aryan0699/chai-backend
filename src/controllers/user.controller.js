import { asyncHandler } from "../utils/asyncHandler.js"
//jaise export vaise import 
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt, { decode } from "jsonwebtoken"

import { v2 as cloudinary } from "cloudinary"
import mongoose from "mongoose"
const gerneateAccessAndRefreshToken = async (userId) => //user bhi pass kar skate the ye beterr if you want to ensure you're always working with the latest database state.
// If user might be modified elsewhere in the code before this function runs.
{
  try {
    const user = await User.findById(userId)
    console.log("AccessTokenUser:", user)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    // console.log("RF:",refreshToken)
    user.refreshToken = refreshToken;//db me dalne ke liye
    // console.log("URF:",user.refreshToken)
    await user.save({ validateBeforeSave: false });//No validation required just save //yaha required shayd na ho kyuki password already hai agar nahi hota to required hone ke karan error throw kar sakta tha
    console.log("URF:", refreshToken)
    return { accessToken, refreshToken }; //***NOTE::jo naam se function ke se return kar deconstruct bhi ussi naam se kar***
  } catch (error) {
    throw new ApiError(500, "Something wend wrong while generating access and refresh token ")

  }
}

//REGISTER HANDLER
//ye User model is like a classs jisse multiple objects called users create ho sakte hai
const registerUser = asyncHandler(async (req, res) => {
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
  const { username, email, fullName, password } = req.body
  const fields = ["fullName", "username", "email", "password"]

  for (const field of fields)  //in me index leta hai of use karo actual values ke liye
  {
    // console.log(field);
    // if(fullname=="")
    if (!req.body[field]) //better check many things //wrond kyuki string hai ki nahi vo check kar raha username ki value nahi
    {
      //throw a object of ApirError 
      throw new ApiError(400, `${field} is required`) //throw is kind of return only
    }
  }
  //*** Something New
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exist")
  }
  //upload.fields karne par req.files me key value pair store ho jata hai key==name and value of Array of uploaded files
  //avatar[0] means first uploaded file 
  //uska path
  console.log("Req.Files: ", req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log("AvatarPath:", avatarLocalPath)
  // const coverImageLocalPath=req.files?.coverImage[0]?.path; //possible ki nahi bheja to error show karega
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) //kya vo ek array hai kya usme kuch hai
  {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is required")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  //no need still checking
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!") //ek object return ho jayega jisme sari info hai
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
  console.log("Avatar Respone", avatar);
  console.log("coverImage Respone", coverImage);
  const newUser = await User.create({
    //password apne aap ban jayega save hone se pehele
    username: username.toLowerCase(),
    email: email,
    fullName,
    password,//password bhejna to padega hi na 
    avatar: avatar.url,
    //coverImage ke liye check nahi lagaya tha ho sakta hai na ho
    coverImage: coverImage?.url || "",
  })
  console.log("New user:", newUser);

  //Good way to check if user created 
  const createdUser = await User.findById(newUser._id)
    .select("-password -refreshToken")

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User Registered Successfully") //object with all information returned
  )







})


//LOGIN HANDLER
const loginUser = asyncHandler(async (req, res) => {
  //Todo
  //get user details
  //validation
  //find user ki exist karta hai ya nahi
  //uske baad password check
  //token dena hai dono
  //send cookie
  //Login successfull
  console.log("Body", req.body);
  const { username, email, password } = req.body
  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }
  //user ko fecth karne me await nahi lagaya tha usse user.isPasswordGenrator access nahi ho pa raha tha par user print ho raha tha
  const user = await User.findOne(
    {
      $or: [{ username }, { email }] //mongo db operators array ke ander oobject pass kar sakte
    }
  )

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }
  //jo methods khudse banaye hai vo user me milenge
  //mongoose ke User se milenge
  console.log(user)
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials")
  }

  //Ab token dena hai
  // If user is already available as a valid Mongoose document, passing it directly is fine.

  // If there's any doubt about the freshness of user, passing userId and refetching might be safer.
  const { accessToken, refreshToken } = await gerneateAccessAndRefreshToken(user._id) //thoda bhi doubt ho use await

  //user jo hai uske refreshtoken field abhi empty hai kyuki jo upar fucntion me hua usko db me to dal diya par ab vo updated user lena padega tujhe
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  //frontend pe cookies ko modify kar sakte hai 
  //JS access kar sakta hai to prevent it and that it can be modified on the server onnly ue do httpOnly and secure(sent over https)
  const options = {
    httpOnly: true, // Prevents JavaScript access (protection against XSS attacks)//only modified at server
    secure: true,   // Ensures cookies are only sent over HTTPS
    sameSite: "Strict", // Prevents CSRF attacks
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken //yaha isliye bhej rahe ki kya pata use rko kuch kaam se apne local storage pe save karani ho
        },
        "User Logged in Successfully"
      )
    )

  //M2 was ki updated user bhi return karo and in fn only set user.password = undefined;
  // user.refreshToken = undefined; db wale user me hai yaha se return hua usme nahi hai ye fields

  //ye token jayenge cookies mai




})
//verify jwt as a middleware jab bhi request mare uske pehele to check loggedin User hai ki nahi//loggedin hai to uske pass token hoga na
const logoutUser = asyncHandler(async (req, res) => {
  //req.user //ka access middleware auth se mila
  //phir user fetch kiya taki naye changes ho to aa jaye
  const user=await User.findByIdAndUpdate(req.user._id,
    {
      // $set: {
      //   refreshToken: undefined, //undefined fileds ko mongoDb ignore kar deta hai updates me to vo same hi reh jaeyga
      // },
      $unset:{
        refreshToken:1,//removes the field from document /better baadme jab login kare to apne app naya hi banega user to refreshToken hoga hi usme
      }
    },
    {
      new: true
    } //new updated user de dega varna by-default flase hota hai matlab update se pehle eka return karega

  )
  console.log("LoggedOutUser:",user)
  const options = {
    httpOnly: true,
    secure: true
  }
  //main logout yaha hua
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User Logged Out")
    )

  //refresh field update karke save karna padta yaha aone aap ho raha



})

const refreshAccessToken = asyncHandler(async (req, res) => {
  //NEED TO FIRST TAKE REFRESH TOKEN
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorised request")
  }
  //jarruri nahi hai payload ho ho sakta hai khali ho
  //yaha try catch asynchandler ke baad bhi lagana jaruri hai kyuki jwt.verify synchronous hai await me error aata to asynchandler error de deta paar synchrnous me nahi dega
  try {
    //  genuinely created by us and still within its valid time?”
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token Expired or Used")
    }
    // refresh token chura liya ab logout hone pe bhi uske pass to  hai bhejke vo acces token generate kara lega 
    //agar user logout kar gaya to refreshToken nahi bacha ye step nahi lagaya to abhi bhi vo genrate karke de dega aur access mil jayega even after refresh Token expiry
    //iise naya generate hoga puran gayab to kisine ne le bhi liya hoga to ab use nahi kar sakta varna usme to pehele ka khali hi nahi hota
    // If an attacker steals a refresh token and you only verify it with JWT, they can keep generating new access tokens indefinitely.

    const { accessToken, refreshToken } = await gerneateAccessAndRefreshToken(user._id)

    const options = {
      httpOnly: true,
      secure: true
    }
    console.log(refreshToken)

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Access Token Refreshed")
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token"

    )
  }


}
)


const changeCurrentPassword = asyncHandler(async (req, res) => {
  //since jwt verify hone ke badd aayega req.user ka access hai vaha se naya use rnikala taki updated vala ho aur sari fileds ho like password and refreshToken jo ki req.user me nahi hai
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Old Password")
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false })//koi filed missing hoti to error dega yaha na ho shayd par if then neglect it
  //password hash apne aap hoke save ho jaeyga
  return res.status(200)
    .json(new ApiResponse(200, {}, "Password SuccessFully Changed"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"))
})
//files update ka endpoint alag hi rakho less congestion
const updateAccountDetails = asyncHandler(async (req, res) => {
  //username not allowed to update
  let { updatedFullName, updatedEmail } = req.body //make it let as value later changing

  if (!updatedEmail && !updatedFullName) { //dono hi hone chaiye empty nahi chaiye
    throw new ApiError(400, "Atleast one field required")
  }
  
  if (!updatedEmail) {
    updatedEmail = req.user.email
  }
  if (!updatedFullName) {
    updatedFullName = req.user.fullName
  }
  console.log("Updates:",updatedFullName," ",updatedEmail)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: updatedFullName, //dont do typos fullname nahi fullName hai
        email: updatedEmail
      }
    },
    {
      new: true //updated return ho
    }
  ).select("-password")

  return res.status(200)
    .json(new ApiResponse(200, user, "Acoount Details Updated SuccessFully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

  //jo bhi upload kiya hai using upload middleware vo req.files me aa jauega
  //abhi sirf req.file use hoga kuki avatar akela hai array nahi chaiye coverImage to hai hi nahi
  const avartarLocalPath = req.file?.path
  if (!avartarLocalPath) {
    throw new ApiError(400, "Avatar File Missing")
  }

  const avatar = await uploadOnCloudinary(avartarLocalPath)
  //Cloudinary se delete nahi kiya hai
  if (!avatar.url) {
    throw new ApiResponse(500, "Error Uploading On Cloudinary")
  }
  
  const userBeforeUpdate = await User.findById(req.user._id)
  const avatarDeleted = userBeforeUpdate.avatar;
  console.log(avatarDeleted);
  const publicID = avatarDeleted.split("/upload/")[1]?.split(".")[0].split("/")[1];
  console.log(publicID);
  if (!publicID) {
    throw new ApiError(500, "Older Avatar Cannot Be Found")
  }

  try {
    const result = await cloudinary.uploader.destroy(publicID)
    console.log("Deleted Avatar:", result); //agar nahi exist karta to be handle ho jayega not found message aayega 
  } catch (error) {
    throw new ApiError(500, error?.message || "Cannot Delete Older Avatar")

  }
  


  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:
      {
        avatar: avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password")


  return res.status(200)
    .json(
      new ApiResponse(200, user, "Avatar Updated SuccessFully")
    )

})

const updateUserCoverImage = asyncHandler(async (req, res) => {

  //jo bhi upload kiya hai using upload middleware vo req.files me aa jauega
  //abhi sirf req.file use hoga kuki avatar akela hai array nahi chaiye coverImage to hai hi nahi
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image File Missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  //Cloudinary se delete nahi kiya hai
  if (!coverImage.url) {
    throw new ApiResponse(500, "Error Uploading On Cloudinary")
  }

// http://res.cloudinary.com/daffyayyj/image/upload/v1747296595/thv0lreqkygxe6jsvrjg.jpg
  const coverImageToDelete=req.user.coverImage;
  console.log(coverImageToDelete);
  const public_id=coverImageToDelete.split("/upload/")[1].split(".")[0].split("/")[1];
  console.log(public_id)
  try{
    const result= await cloudinary.uploader.destroy(public_id);
    console.log("Deleted CoverImage:",result);

  }
  catch(error){
    throw new ApiError(500,error.message || "Cannot delete CoverImage")

  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:
      {
        coverImage: coverImage.url
      }
    },
    {
      new: true
    }
  ).select("-password")

  return res.status(200)
    .json(
      new ApiResponse(200, user, "Cover Image Updated SuccessFully")
    )
})

//channel pe url ke through jaoge to uss url.params se channel details aa jayegi
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) //Removes leading and trailing spaces from a string.
  {
    throw new ApiError(400, "username is missing")
  }
  //user leke phir id ke basis pe pipeline lagane se better hai use $match
  //   const user = await User.findOne({ _id: userId }); // Find user first
  //   const result = await User.aggregate([
  //   { $match: { _id: userId } }, // Then match again in aggregation
  //   { $project: { name: 1, age: 1 } }
  // ]);Two Database Queries:involved
  //Each curly bracket represent one pipeline(each object of array)
  //Array save hoga  channel me
  //Array me ek hi object hoga apne me
  //URL se channel wale user ka username aayega
  const channel = await User.aggregate([
    {

      //vo user aa gaya jiska channel hai
      $match: {
        username: username?.toLowerCase()
      }
    },
    //ab subcriber aur subcription kitne hai vo dekhna hai
    {
      //kis model ko user me join karna hai kis basis pe
      $lookup: {
        from: "subscriptions", //db me jo naam hai vo use karna padega
        localField: "_id",
        foreignField: "channel",
        as: "subscribers" //ek subscription documnet return hoga jisme ki channel me chai aur code hoga aur scubcriber me alag alag ho sakte hai
      }
    },
    //ek PROBLEM hai ki local field foreignField ka data type macth hona chaiye varna compare nahi hoga par yaha nahi kiya hai
    //solution //dono user._id  hi hogi(channel and subscriber)
    //$lookup don't show up in user schema sirf yahi tak limited
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount:
        {
          $size: "$subscribedTo"
        },
        isSubscribed:
        {
          $cond: {
            if: {
              //arrya object dono ke liye valid ander kya hai
              //possible error
              //no need of $subscribers[0].subscriber mongodb autommatically dekh lega
              //subscribers Subscription Schema ka object hai jisme channel aur subscriber dono hai to usme se subscriber chaiye
              $in: [req.user?._id, "$subscribers.subscriber"] //doubt can we use-> subscription.subscriber -> No as it is not a field 
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }

  ])

  if (!channel?.length) {
    throw new ApiError(400, "Channel Doesn't Exist")
  }
  console.log(channel);
  return res.status(200)
    .json(new ApiResponse(200, channel[0], "User Channel fetched successfully"))

})


//User no jo watchHistiry hai usme video ke id hai naki datils hume details chaiye isliye id match karke details la rahe
//ab ek video me bhi uske owner ke liye id hai user ki naki pura user detial vo bhi lookup karke id macth karke la rahe 
//since arry ke format me answer aata hai isliye addField kare usko object me convert kiya
//kyuki user ek hi hai to Arrya jo return hua usme bhi ek hi object hai isliye user[0] kiya

const getWatchHistory = asyncHandler(async (req, res) => {
  // req.user._id ==> give string 
  //jis user ne login kiya hai
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id) //varna match nahi hoga//_id ObjectId type hai 
      }
    },
    { //user ki field hogi par user available nahi hoga
      $lookup:
      {
        from: "videos",
        localField: "watchHistory", //watchHistory to kali hai kaise match hoga kya chal raha*****//khai nahi hai
        foreignField: "_id", //watchHistory me pehelese video ki ids hai jinko match karke pura video ka subkuch manga liya to usme owner pehele se hona chaiye na???
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",//id se pura user aa gaya usme se bhi 3 hi fields li apan ne
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar:1  
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner" //Array ke ek hi obj aayega owner unique hai usko le liya  
              }
            }
          }
        ]
      }
    }
  ])

  return res.status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History Fetched SuccessFully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory
}
//ek url create hoga for register uss pe jab bhi rq aayegi to vo isko execute kar dega and user will be registered

//TODO : console log karke req.files req.body existingUser