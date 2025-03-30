// require('dotenv').config({path:'./.env'}) //always first line
//load all environment variables at the start //ye sahi hai par not good for code consistency
// import dotenv from 'dotenv'
import dotenv from "dotenv"
dotenv.config({
    path:'./.env' //filename is .env and not just env
})
import connectDB from "./db/index.js";
import app from "./app.js"
const port = process.env.PORT || 8000;

//because promise is returned by async functions
connectDB()
    .then(() => {
        app.on("error",(error) => {
            console.log("Cannot Listen");
            throw error;
        })
        //Server Made
        app.listen(port, (req, res) => {
            console.log(`Server is running on: ${port}`)
        })

    })
    .catch((err) => {
        console.log("MongoDB Connection Failed:", err)
    })


/*
function connectDB()
{

}

connectDB();
//Will work

Better Method us IFFE
import express from "express"
const app = express()

    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)//need to give string use bactext
            //DB to connect ho gaya par kya pata express app baat nahi kar pa rahi
            //on lagake listen karta hai error event ko
            app.on("error", (error) => {
                console.log("Cannot Listen")
                throw error
            })
            app.listen(process.env.MONGODB_URI, () => {
                console.log(`App is listening on port ${process.env.PORT}`)
            })
        }
        catch (error) {
            console.log("error:", error)
            throw error
        }
    })()
*/