import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js"; //.js important hai
//async promise return karta hai
const connectDB = async () =>
{
    try
    {
        //on connection ye object return karta hai mongoose reponse aata hai
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`) //kaunse host pe connect hua hai (kaunsa wala database)
        //check this out
    
    }
    catch(error)
    {
        console.log("MONGODB connection Failed:",error)
        process.exit(1)//current application ke process pe chal rahi hai usla reference hai ye

    }
}

export default connectDB