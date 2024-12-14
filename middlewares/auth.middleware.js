import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {apiError} from "../utils/apiErrors.js"

export const verifyJWT = asyncHandler(async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("bearer ", "")
        if(!token){
            throw new apiError(400, "Token not found")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new apiError(401, "Invalid token")
        } 
        //creation of new object named user
        req.user = user
        next()
    } catch (error) {
        throw new apiError(402, "Invalid access token")
    }
})