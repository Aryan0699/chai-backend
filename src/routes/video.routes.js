import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { publishAVideo, updateVideo,getVideoByID, deleteVideo,togglePublishStatus, getALLVideos } from "../controllers/video.controller.js";


const videoRouter=Router();

videoRouter.use(verifyJWT)//sirf logged in hi use kar sakte hai to sare routes pe apply ho jaye isliye ek sath kar diya

videoRouter
        .route("/")
        .get(getALLVideos)
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

videoRouter.route("/toggle/publish/:videoId")
            .patch(togglePublishStatus);

export {videoRouter}

// 68287cc65a505fd6c024a14f
// 682ad0e3f47b8d4ff6168f5f