import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors"

export const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

app.use(express.json({
    limit : "15kb"
}))
app.use(cookieParser())
app.use(express.urlencoded({extended: true, limit: "15kb"}))
app.use(express.static("public"))

//Routes... 
import userRouter from "../routes/user.route.js"
import videoRouter from "../routes/video.route.js"
import commentRouter from "../routes/comment.route.js"

//Route declaration...
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)