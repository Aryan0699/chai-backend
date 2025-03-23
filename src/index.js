// require('dotenv').config({path:'./env'})
//load all environment variables at the start //ye sahi hai par not good for code consistency

// import dotenv from 'dotenv'
import connectDB from "./db/index.js";

// /
connectDB();


/*
// function connectDB()
// {

// }

// connectDB();
// //Will work

//Better Method us IFFE
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