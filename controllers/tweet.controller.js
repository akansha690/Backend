import {Tweet} from "../models/tweet.model.js"
import {apiError} from "../utils/apiErrors.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

export const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const user = req.user._id
    if(!content){
        throw new apiError(400, "Tweet content not found")
    }
    const tweetObj = await Tweet.create({
        content : content,
        owner: user
    })

    const tweet = await Tweet.findById(tweetObj._id).populate({
        path:"owner",
        select: "fullname"
    })
    if(!tweet){
        throw new apiError(400, "Tweet is not found")
    }
    return res.status(200)
    .json(new apiResponse(200, tweet, "Tweet has been added"))
    
})

export const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id
    if(!userId){
        throw new apiError(400, "user not found")
    }
    const tweets = await Tweet.find({
        owner: userId
    }).select("-owner")

    if(!tweets){
        throw new apiError(400, "Tweet by this user is not found")
    }
    // console.log(tweets);
    return res.status(200)
    .json(new apiResponse(200, tweets, "Got all tweets"))   
})

export const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {content} = req.body
    // const tweetId = req.params.tweetId;
    const {tweetId}=req.params
    if(!content){
        throw new apiError(400, "Tweet content is required")
    }
    if(!tweetId){
        throw new apiError(400, "Unauthorised request")
    }
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content : content
            }
        },
        {
            new: true
        }
    )
    if(!tweet){
        throw new apiError(400, "Tweet is not found")
    }
    return res.status(200)
    .json(new apiResponse(200, tweet, "Tweet has been updated"))
})

export const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    // const tweetId = req.params.tweetId;
    const {tweetId}=req.params

    if(!tweetId){
        throw new apiError(400, "Unauthorised request")
    }
    const tweet = await Tweet.findByIdAndDelete(
        tweetId,
    )
    if(!tweet){
        throw new apiError(400, "Tweet is not found")
    }
    return res.status(200)
    .json(new apiResponse(200, {}, "Tweet has been deleted"))
})