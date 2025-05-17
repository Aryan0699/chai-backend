import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { publishAVideo, updateVideo,getVideoByID, deleteVideo } from "../controllers/video.controller.js";


const videoRouter=Router();

videoRouter.use(verifyJWT)//sirf logged in hi use kar sakte hai to sare routes pe apply ho jaye isliye ek sath kar diya

videoRouter
        .route("/")
        .post(
            upload.fields([
                {
                    name:"videoFile",
                    maxCount:1
                },
                {
                    name:"thumbnail",
                    maxCount:1
                }
            ]),publishAVideo);

videoRouter.route("/:videoId")
            .get(getVideoByID)
            .patch(upload.single("thumbnail"),updateVideo)
            .delete(deleteVideo)

export {videoRouter}