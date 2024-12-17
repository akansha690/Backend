import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import {apiError} from "../utils/apiErrors.js"
import {apiResponse} from "../utils/apiResponse.js"



export const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

export const addComment = asyncHandler(async (req, res) => {

    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params
    const user = req.user._id
    if(!content){
        throw new apiError(400, "content is required")
    }
    if(!videoId){
        throw new apiError(400, "VideoId is required")
    }

    //find Video by videoId
    const videoTocomment = await Video.findById(videoId)
    if(!videoTocomment){
        throw new apiError(400, "Video is not found")
    }
    const commentObj = await Comment.create({
        content: content,
        video: videoTocomment,
        owner: user 
    })
    const comment = await Comment.findById(commentObj._id).populate([
        {           
            path:"owner",
            select : "fullname"  
        },
        {
            path: "video",
            select:"title"
        }
    ])

    if(!comment){
        throw new apiError(400, "Comment is not found")
    }
    return res. status(200)
    .json(new apiResponse(200, comment, "Comment added successfully"))

})

export const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params
    if(!content){
        throw new apiError(400, "content is required")
    }
    if(!commentId){
        throw new apiError(400, "CommentID is required")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content: content 
            }
        },
        {
            new:true
        }
    )
    return res. status(200)
    .json(new apiResponse(200, comment, "Comment updated successfully"))
})

export const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId){
        throw new apiError(400, "CommentID is required")
    }
    const comment = await Comment.findByIdAndDelete(
        commentId
    )
    return res. status(200)
    .json(new apiResponse(200, {}, "Comment deleted successfully"))
})