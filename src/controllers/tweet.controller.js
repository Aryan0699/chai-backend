//DATABASE IS IN A DIFFERENT CONTINENT SO ALWAYS USE AWAIT WITH DATABASE RELATED TASKS

import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    
    const {content}=req.body;
    // console.log(req.body)
    // console.log(content)
    if(!content)
        throw new ApiError(400,"Content is missing!")

    const tweet=await Tweet.create({
        content:content,
        owner:req.user._id
    })

    if(!tweet)
        throw new ApiError(500,"Error in creating Tweet")

    const finalTweet=await Tweet.findById(tweet._id);
    // console.log(finalTweet.content)
    res.status(200).json({
        status:200,
        data:finalTweet,
        message:"Tweet Created Successfully"
    });
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    res.status(200).json(new ApiResponse(200,await Tweet.find(),"All Tweets Fetched Succesfully"));
})

const updateTweet = asyncHandler(async (req, res) => {

    //TODO: update tweet
    const {tweetId}=req.params;
    if(!tweetId)
        throw new ApiError(400,"Provide Valid TweetID")
    const {content}=req.body;
    // console.log(req.body)
    if(!content)
        throw new ApiError(400,"Content is missing!")

    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:
            {
                content:content,
            }
        },
        {
            new:true
        }
    )

    if(!updatedTweet)
        throw new ApiError(500,"No such Tweet Exists")

 
    res.status(200).json({
        status:200,
        data:updatedTweet,
        message:"Tweet Created Successfully"
    });
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    if(!tweetId)
        throw new ApiError(400,"Provide Valid TweetID")
    const tweetToDelete=await Tweet.findOneAndDelete({_id:tweetId});

    if(!tweetToDelete)
        throw new ApiError(500,"Failed to Delete the Required Tweet or No such Tweet Exists");

    res.status(200).json(new ApiResponse(200,"Tweet Deleted Successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}