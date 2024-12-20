
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiErrors.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

//Method that returns tokens...
const generateAccessAndRefreshToken = async(UserId)=>{
    try {
        const user =await User.findById(UserId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
        user.refreshToken = refreshToken
        
        //to save in db... 
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken}
    } catch (error) {
        console.log(error);
        throw new apiError(500, "something went wrong");
    }
}

export const registerUser = asyncHandler( async(req, res)=>{
    // get user details from frontend....
    const {fullname, email, username, password} = req.body
    // validations....
    if([fullname, email, username, password].some((field)=>
        field?.trim() === ""
    )){
        throw new apiError(400,"All fields are required")
    }
    // check if this user already exits....
    const userExists = await User.findOne({$or: [{username}, {email}]})
    if(userExists){
        throw new apiError(400, "User already exists");     
    } 
    // images 

    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new apiError(400, "avatar image is required")
    }
    let coverImageLocalPath=null;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new apiError(400, "avatar image is required")
    }

    //creation of user object 
    const user = await User.create({
        fullname,
        email,
        username : username.toLowerCase(),
        password,
        avatar : avatar?.url,
        coverImage : coverImage?.url || ""
    })
    // find user and remove password and refreshtoken field...
    const userCreated = await User.findById(user._id)?.select("-password -refreshToken")
    if(!userCreated){
        throw new apiError(500, "Error while registering");    
    }

    //send response
    return res.status(200).json(
        new apiResponse(200,userCreated, "User registered successfully")
    )

}) 

export const loginUser= asyncHandler( async(req, res, err)=>{
    //req body->data
    const {email, username, password} = req.body
    
    if(!email && !username){
        throw new apiError(400, "email or password is required")
    }
    //username or email
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    //find user
    if(!user){
        throw new apiError(402, "User has not registered")
    }

    //check password 
    const validPassword = await user.isPasswordCorrect(password)
    if(!validPassword){
        throw new apiError(401, "Password is incorrect")
    }

    //tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //send cookie and send response
    const options = {
        httpsOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200, {
                user: loggedInUser,
                refreshToken,
                accessToken
            },
            "User loggedIn successfully"
        )
    )
})

export const logoutUser = asyncHandler(async(req, res, err)=>{
    //delete refreshToken from db
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{refreshToken : 1}
        },
        {
            new: true  //updated info is returned
        }
    )
    // delete cookies
    const options = {
        httpOnly:true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new apiResponse(200, {}, "Logged out successfully"))
})

export const generateNewRefreshToken = asyncHandler(async(req, res)=>{
    try {
        const incomingToken = req.cookies?.refreshToken || req.body.refreshToken
        if(!incomingToken){
            throw new apiError(400, "Unauthorized request error")
        }
        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id) 
        if(!user){
            throw new apiError(401, "Invalid Refresh Token")
        }
        if(incomingToken !== user?.refreshToken){
            throw new apiError(401, "Token has expired")    
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly : true,
            secure : true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(new apiResponse(200, {accessToken, refreshToken : newrefreshToken} ))
    } catch (error) {
        throw new apiError(401, error.message || "Invalid Refresh Token")
    }
})

export const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const verifyPassword = await user.isPasswordCorrect(oldPassword)
    if(!verifyPassword){
        throw new apiError(402, "Incorrect password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res.status(200)
    .json(new apiResponse(200, {}, "Password has changed"))
})

export const getCurrentUser = asyncHandler(async(req, res)=>{ 
    const user = await User.findById(req.user?._id)
    res.status(200)
    .json(new apiResponse(200, user, "User fetched successfully"))
})

export const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullname, username, email} = req.body
    if(!username || !fullname || !email){
        throw new apiError(401, "All fields are required")
    }
    const user = await User.findById(req.user?._id).select("-password")
    user.fullname= fullname
    user.email =email
    user.username = username
    await user.save({validateBeforeSave: false})
    return res.status(200)
    .json(new apiResponse(200, user, "Details updated successfully"))

})

export const updateAvatar = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new apiError(401,"Avatar file not found")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new apiError(401,"Error while uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{avatar : avatar?.url} 
        },
        {
            new: true
        }.select("-password")
    )
    return res.status(200)
    .json(new apiResponse(200, user, "Avatar updated successfully"))
})

export const updatecoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new apiError(401,"coverImage file not found")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new apiError(401,"Error while uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{coverImage : coverImage?.url} 
        },
        {
            new: true
        }.select("-password")
    )
    return res.status(200)
    .json(new apiResponse(200, user, "coverImage updated successfully"))
})

export const getUserChannelProfile = asyncHandler(async(req, res)=>{

    const {username} = req.params
    if(!username?.trim()){
        throw new apiError(400, "Username is missing")
    }
    //aggregate pipelines......
    const channel = await User.aggregate([
        {
            $match:{ //to find documents
                username: username?.toLowerCase()
            }
        },   
        {
            //to find subscribers
            $lookup:{
                from:"subscriptions",  //Subscription in mongodb saved as subscriptions
                localField: "_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {    
            //to find subscribedTo
            $lookup:{ 
                from:"subscriptions",  //Subscription in mongodb saved as subscriptions
                localField: "_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {    
            //add both these fields in user model.
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                subscribedToCount:{
                    $size:"$subscribedTo"
                },
                //flag to know if you have subscribed to a channel or not.
                isSubscribed:{
                    $cond:{
                        if:{$in : [req.user?._id , "$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },    
        {
            $project:{
                fullname:1,
                email:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                
            }
        }    
    ])  // returns an array
    if(!channel?.length){
        throw new apiError(404, "Channel doesnot exists")
    }

    return res.status(200)
    .json(new apiResponse(200, channel[0], "User channel fetched successfully"))
})

export const getUserWatchHistory = asyncHandler(async(req, res)=>{

    const user = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    //this subpipelines will return owner as array
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"  //will return 1st element of array ie object with fullname, email, avatar.
                            }
                        }
                    }
                ] 
            }
        },
        
    ])
    return res.status(200)
    .json(new apiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})