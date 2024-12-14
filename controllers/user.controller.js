
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiErrors.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

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
    const {email, username, password} = req. body
    
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
    // console.log(`expiryDate : is ${process.env.REFRESH_TOKEN_EXPIRY}`);   
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
            $set:{refreshToken : undefined}
        },
        {
            new: true
        }
    )
    // delete cookies
    const options ={
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
        const decodedToken = verify.jwt(incomingToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id) 
        if(!user){
            throw new apiError(401, "Invalid Refresh Token")
        }
        if(decodedToken !== user?.refreshToken){
            throw new apiError(401, "Token has expired")    
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
        const options:{
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(new apiResponse(200, {accessToken, refreshToken : newrefreshToken} ))
    } catch (error) {
        throw new apiError(401, error.message || "Invalid Refresh Token")
    }
})