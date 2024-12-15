import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js"
import { apiError } from "../utils/apiErrors.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

export const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    
    const {title, description} = req.body
    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!videoLocalPath){
        throw new apiError(400, "Video file is required")
    }
    if(!thumbnailLocalPath){
        throw new apiError(400, "thumbnail is required")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!videoFile){
        throw new apiError(400, "Error while uploading video on cloudinary")
    }
    if(!thumbnail){
        throw new apiError(400, "Error while uploading thumbnail on cloudinary")
    }

    const videoObject = await Video.create({
        title, 
        description,
        videoFile : videoFile?.url,
        thumbnail : thumbnail?.url,
        duration: videoFile?.duration
    })

    const video = await Video.findById(videoObject._id).select("-views -isPublished -owner")
    
    return res.status(200)
    .json(new apiResponse(200, video, "Published successfully"))
})

export const getVideoById = asyncHandler(async (req, res) => {
   
    //TODO: get video by id
    const {videoId} = req.params
    if(!videoId){
        throw new apiError(401, "Unauthorised request")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new apiError(400, "Video not found")
    }
    return res.status(200)
    .json(new apiResponse(200, video.videoFile, "Video fetched successfully"))
    
})

export const updateVideo = asyncHandler(async (req, res) => {
    
    //TODO: update video details like title, description, thumbnail
    try {
        
            const {videoId} = req.params
            if(!videoId){
                throw new apiError(401, "Video ID is required")
            }
            
            const {title, description} = req.body
            if(!title || !description){
                throw new apiError(401, "Fields not given properly")
            }
            const thumbnailLocalPath = req.file?.path
            if(!thumbnailLocalPath ){
                throw new apiError(401, "Thumbnail is required")
            }
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
            if(!thumbnail?.url){
                throw new apiError(401, "Error while uploading on cloudinary")
            }
            const video = await Video.findByIdAndUpdate(
                videoId,
                {
                    $set:{
                        title: title,
                        thumbnail: thumbnail?.url,
                        description: description
                    }
                },
                {
                    new: true 
                }     
            ).select("-isPublished")
        
            if(!video){
                throw new apiError(400, "Video not found")
            }
        
            return res.status(200)
            .json(new apiResponse(200, video, "Video details updated"))
    } 
    catch (error) {
        throw new apiError(400, error.message)
    }

})

export const deleteVideo = asyncHandler(async (req, res) => {
    
    //TODO: delete video
})

export const togglePublishStatus = asyncHandler(async (req, res) => {
    
})









