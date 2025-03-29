import {asyncHandler} from "../utils/asyncHandler.js"
//jaise export vaise import 
const registerUser =asyncHandler(async (req,res)=>
{
    return res.status(200).json
    ({
        message:"ok"
    })
})
export default registerUser
//ek url create hoga for register uss pe jab bhi rq aayegi to vo isko execute kar dega and user will be registered
