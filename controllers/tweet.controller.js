import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

export const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    
})

export const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

export const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

export const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})