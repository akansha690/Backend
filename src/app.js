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
import router from '../routes/user.route.js'

//Route declaration...
app.use("/api/v1/users", router)