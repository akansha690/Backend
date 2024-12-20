
import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos} from "../controllers/like.controller.js"

const router = Router()

router.route("/toggle-like-video/:videoId").patch(verifyJWT, toggleVideoLike)
router.route("/toggle-like-comment/:commentId").patch(verifyJWT, toggleCommentLike)
router.route("/toggle-like-tweet/:tweetId").patch(verifyJWT, toggleTweetLike)
router.route("/liked-videos").get(verifyJWT, getLikedVideos)


export default router
