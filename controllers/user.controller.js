
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiErrors.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"

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

