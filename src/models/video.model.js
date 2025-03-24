import mongoose,{Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

//plugin ke tarah inject hoga
const videoSchema=new Schema(
    {
        videoFile:
        {
            type:String, //url cloudinary se aayega
            required:true
        },
        thumbnail:
        {
            type:String, //url cloudinary se aayega
            required:true
        },
        title:
        {
            type:String, 
            required:true
        },
        description:
        {
            type:String, 
            required:true
        },
        duration:
        {
            type:Number, //cloudinary video ka time bhi bhejta hu vahi se lenge
            required:true
        },
        views:
        {
            type:Number,
            default:0
        },
        isPublished:
        {
            type:Boolean,
            default:true
        },
        owner:
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }



    },
    {
        timestamps:true
    }

)
//as a plugin inject hota hai
videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema);

