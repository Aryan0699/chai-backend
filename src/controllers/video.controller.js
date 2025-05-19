import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { v2 as cloudinary } from "cloudinary"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";


const findVideoById = async (videoId) => {
    if (!videoId) throw new ApiError(400, "VideoId is missing!");
    let video;
    try {
        video = await Video.findById(videoId)
    } catch (error) {
        throw new ApiError(500, "Internal Server Error while fetching video!");
    }
    if (!video) throw new ApiError(404, "No such Video Exists!!")
    // console.log(video);
    return video
}

//Video ek collection hai
//frontend ko ye baatana hoga ki kitne videos the total me
const getALLVideos = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, query = "", sortBy, sortType = 1, userId } = req.query

    // console.log(query)
    //query me quotes aa rahe isliye regex galat aayega remove qoutes
    const cleanedQuery = query.slice(1, -1).trim();
    // console.log(cleanedQuery)
    const regex = new RegExp(cleanedQuery, "i");
    // console.log(regex)
    //if query="" then it will give all the videos 

    const skip = (page - 1) * limit;
    /* M1 to find total documents
        const totalVideoCount=await Video.countDocuments();
        console.log(totalVideoCount);
    */
    //upar se kitne documnet/video leave karne hai vo batayega aur phir limit lagake uss page wale le liye
    const videos = await Video.aggregate([{
        $match: {
            $or: [
                {
                    description: {
                        $regex: regex //  /pizza/ works but "pizza"  wont work a RegExp is needed not a string so query wont work first need to convert

                    }
                },
                {
                    title: {
                        $regex: regex
                    }
                }
            ]
        }
    }, {
        $match: {
            owner: new mongoose.Types.ObjectId(userId) //userId number hota ye objectID hai
        }
    }
        // {
        //     $count:"count"
        //     //Not correct MongoDB replaces all documents with a single document like: { count: <number> } //no dcouments left after this
        //     //need to use facet to run parellel pipelines or count seperately
        // }
        ,
    {
        $facet: {
            totalCount: [
                {
                    $count: "count"
                }
            ],
            paginatedVideos: [
                {
                    $sort: 
                    {
                        [sortBy]:1 //since its a variable therefore in square brackets
                    }
                }, 
                {

                    $skip: skip

                }, 
                {
                    $limit:Number(limit)
                }
            ]
        }
    }
    ])
    // console.log("Aggregation:", videos);

    res.status(200).json(new ApiResponse(200, videos, "Videos Fetched Successfully"))
})


//title,description,thumbnail,video,duration send karna hai response me
const publishAVideo = asyncHandler(async (req, res, next) => {

    const { title, description } = req.body;

    if (!title)
        throw new ApiError(400, `title is required`)
    if (!description)
        throw new ApiError(400, `description is required`)

    console.log(title, "  ", description);
    //chekced if already uploaded
    const existingVideo = await Video.findOne({
        title: title.trim(),
        owner: req.user._id,
    });

    if (existingVideo) {
        throw new ApiError(409, "You have already uploaded a video with this title");
    }

    // console.log(req.files.videoFile[0].path)
    //? nahi lagaya tha to ye checks nahi kaam kar rahe the
    const videoLocalPAth = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

    if (!videoLocalPAth) throw new ApiError(400, "Video is Required!");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is Required!");

    const video = await uploadOnCloudinary(videoLocalPAth)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    console.log(video);
    if (!video.url || !thumbnail.url) {
        throw new ApiResponse(500, "Error Uploading On Cloudinary")
    }

    const newVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        //views aur isPublished have default values
        owner: req.user._id
    })

    if (!newVideo)
        throw new ApiError(500, "Something went wrong while publishing the Video")

    return res.status(200).json(
        new ApiResponse(200, newVideo, "Succesfuly uploaded video")
    )
})


const getVideoByID = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    //await jaruri hai varna promise return hoga actual values nahi
    const video = await findVideoById(videoId);
    // console.log(video);

    res.status(200)
        .json(new ApiResponse(200, video, "Video Found Sucessfully!"));

})

//TODO:Update Title is not working giving Malformed part header
//form data se bheja to error aa rha hai raw bheja to working hai
const updateVideo = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;

    const video = await findVideoById(videoId);

    let { updatedTitle, updatedDescription } = req.body;

    if (!updatedTitle)
        updatedTitle = video.title
    if (!updatedDescription)
        updatedDescription = video.description


    const updatedThumbnailLocalPath = req.file?.path;
    let updatedThumbnail;
    if (updatedThumbnailLocalPath) {
        //Firstly deleting the previous thumbnail
        const thumbnailBeforeUpdate = video.thumbnail;
        const public_id_thumbnail = thumbnailBeforeUpdate.split("/upload/")[1].split(".")[0].split("/")[1];

        try {
            const result_thumbnail = await cloudinary.uploader.destroy(public_id_thumbnail);
            console.log("Deleted thumbnail:", result_thumbnail);

        } catch (error) {
            throw new ApiError("500", "Failed to delete Files on Cloudinary")
        }
        //uploading the new Thumbnail
        updatedThumbnail = await uploadOnCloudinary(updatedThumbnailLocalPath);


        if (!updatedThumbnail)
            throw new ApiError(500, "Failed to upload on Cloudinary");

        video.thumbnail = updatedThumbnail.url;
    }

    video.title = updatedTitle;
    video.description = updatedDescription;

    await video.save({ validateBeforeSave: false })



    const updatedVideo = await Video.findById(video._id);
    console.log(updatedVideo)
    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video details updated Successfully")
    )

})


const deleteVideo = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;

    const video = await findVideoById(videoId);

    const videoFile = video.videoFile;
    const thumbnail = video.thumbnail;

    const public_id_video = videoFile.split("/upload/")[1].split(".")[0].split("/")[1];
    console.log(public_id_video);
    const public_id_thumbnail = thumbnail.split("/upload/")[1].split(".")[0].split("/")[1];


    try {
        //resource_type: "video" is necessary hai by_default image hota hai isliye pata nahi chala abhi tak 
        const result_video = await cloudinary.uploader.destroy(public_id_video, { resource_type: "video" });
        const result_thumbnail = await cloudinary.uploader.destroy(public_id_thumbnail);
        console.log("Deleted video:", result_video);
        console.log("Deleted thumbnail:", result_thumbnail);

    } catch (error) {
        throw new ApiError("500", "Failed to delete Files on Cloudinary")
    }

    await video.deleteOne();

    res.status(201).json(
        new ApiResponse(201, {}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await findVideoById(videoId);

    const toggledVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                isPublished: !video.isPublished //cannot directly access isPublished
            }
        },
        {
            new: true
        })

    const message = toggledVideo.isPublished ? "Video is now Published" : "Video is now unpublished";
    res.status(200)
        .json(new ApiResponse(200, toggledVideo, message))
})


export { publishAVideo, getVideoByID, updateVideo, deleteVideo, togglePublishStatus, getALLVideos }