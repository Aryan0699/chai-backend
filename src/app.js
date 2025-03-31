import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express();


//Configuration
// ** Don’t use origin: "*" with credentials: true.**
app.use(cors(
    {
      origin:process.env.CORS_ORIGIN,
      credential:true //allow all credentials like cookies authentication token headers
    }
)) //allow all routes object pass karke bata sakte ho kisko allow karn ahi kisko nahi
// export {app}

app.use(express.json({
    limit:"16kb"
})) //isse jyada ka json data nahi aana chahiye //pehele body parser use karna padta tha vo taking json

app.use(express.urlencoded({
    extended:true, //nested objects allowed
    limit:"16kb"
}))

app.use(express.static('public'));  
app.use(cookieParser()) //parse to req.cookies res.cookie ka access deta hai


import userRouter from "./routes/user.routes.js";
//define a url that will be specifically for the user routes like register/login
//router ko lane ke liye middleware lagega 
//iss endpoint par control userRouter ke pass aa gaya ab aage ke route vo dekhega
app.use("/api/v1/users",userRouter)

//ye ek ap hai uska version 1 hai


export default app;
