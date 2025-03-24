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
 
export default app;
