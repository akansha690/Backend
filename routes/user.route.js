import {Router} from "express"
import { registerUser, loginUser, logoutUser, generateNewRefreshToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar , updatecoverImage, getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router()

router.route("/register").post(
    //middleware
    upload.fields([
        {
            name: "avatar",
            maxCount : 1
        },
        {
            name: "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(generateNewRefreshToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar") ,updateAvatar)
router.route("/update-coverimage").patch(verifyJWT, upload.single("coverimage"), updatecoverImage)
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getUserWatchHistory)

export default router;