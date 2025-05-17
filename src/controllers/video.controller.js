import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { v2 as cloudinary } from "cloudinary"
import mongoose, { trusted } from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { application } from "express";


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



//title,description,thumbnail,video,duration send karna hai response me
const publishAVideo = asyncHandler(async (req, res, next) => {

    const { title, description } = req.body;

    if (!title)
        throw new ApiError(400, `title is required`)
    if (!description)
        throw new ApiError(400, `description is required`)

    console.log(title, "  ", description);

    // console.log(req.files.videoFile[0].path)
    //? nahi lagaya tha to ye checks nahi kaam kar rahe the
    const videoLocalPAth = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

    if (!videoLocalPAth) throw new ApiError(400, "Video is Required!");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is Required!");

    const video = await uploadOnCloudinary(videoLocalPAth)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    // console.log(video);
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
export { publishAVideo, getVideoByID, updateVideo, deleteVideo }