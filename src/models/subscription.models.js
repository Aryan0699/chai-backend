import mongoose ,{mongo, Schema} from "mongoose";
import { User } from "./user.models";


const subscriptionSchema=new Schema({

    subscriber:{ 
        type:Schema.Types.ObjectId, //one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //ont to whom subcriber is subcribing
        ref:"User"
    }

},{
    timestamps:true
})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)
//Subscription schema ke basisi pe ek model (class) bana ke do 