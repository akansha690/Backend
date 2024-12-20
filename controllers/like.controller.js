import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Video} from "../models/video.model.js"
import {apiError} from "../utils/apiErrors.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

export const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params
    const userId = req.user._id
    if(!videoId){
        throw new apiError(400, "VideoId is required")
    }
    const liked_video = await Video.findById(videoId)
    
    if(!liked_video){
        throw new apiError(400, "Video not found")
    }
    const existLike = await Like.findOne({
        // $or:[{videoId}, {userId}]
        video: videoId,
        likedBy: userId
    })

    try {
        if(existLike){
            await Like.findByIdAndDelete(existLike._id);
            return res.status(200)
            .json(new apiResponse(200, {}, "Video has been disliked"))
        }
        else{
            const likeObj = await Like.create({
                video: videoId,
                likedBy: userId
            })
            const like = await Like.findById(likeObj._id)
            return res.status(200)
            .json(new apiResponse(200, like, "Video has been liked"))
        }
    } catch (error) {
        throw new apiError(error);
    }
    
})

export const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const {commentId} = req.params
    const userId = req.user._id
    if(!commentId){
        throw new apiError(400, "CommentId is required")
    }
    const liked_comment = await Comment.findById(commentId)
    
    if(!liked_comment){
        throw new apiError(400, "comment not found")
    }
    const existLike = await Like.findOne({
        // $or:[{commentId}, {userId}] // donot user $or as it will check either of them but we dont both of these conditions as true
        comment: commentId,
        likedBy: userId
    })

    try {
        if(existLike){
            await Like.findByIdAndDelete(existLike._id);
            return res.status(200)
            .json(new apiResponse(200, {}, "Comment has been disliked"))
        }
        else{
    
            const likeObj = await Like.create({
                comment: commentId,
                likedBy: userId
            })
            const like = await Like.findById(likeObj._id)
            return res.status(200)
            .json(new apiResponse(200, like, "Comment has been liked"))
        }
    } catch (error) {
        throw new apiError(error)
    }

})

export const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const {tweetId} = req.params
    const userId = req.user._id
    if(!tweetId){
        throw new apiError(400, "TweetId is required")
    }
    const liked_tweet = await Tweet.findById(tweetId)
    
    if(!liked_tweet){
        throw new apiError(400, "Tweet not found")
    }
    const existLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    try {
        if(existLike){
            await Like.findByIdAndDelete(existLike._id);
            return res.status(200)
            .json(new apiResponse(200, {}, "Tweet has been disliked"))
        }
        else{
    
            const likeObj = await Like.create({
                tweet: tweetId,
                likedBy: userId
            })
            const like = await Like.findById(likeObj._id)
            return res.status(200)
            .json(new apiResponse(200, like, "Tweet has been liked"))
        }
    } catch (error) {
        throw new apiError(error)
    }
}
)

export const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;
    if(!userId){
        throw new apiError(400, "Invalid request")
    }
    const likedVideos = await Like.find({
        likedBy: userId
    }).populate("video").select("video -_id")
    if(!likedVideos){
        throw new apiError(400, "No liked videos")
    }

    // console.log(likedVideos[0].video.title);
    return res.status(200)
    .json(new apiResponse(200, likedVideos, "All liked videos"))

})