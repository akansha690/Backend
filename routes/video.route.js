import { Router } from "express"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { publishAVideo , getVideoById, updateVideo } from "../controllers/video.controller.js"



const router = Router()

router.route("/publish-video").post(verifyJWT, 
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo
)
router.route("/vd/:videoId").get(verifyJWT, getVideoById)
router.route("update/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)


export default router