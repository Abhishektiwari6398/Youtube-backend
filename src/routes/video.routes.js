import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishVideo,
    togglePublishStatus,
    updateTitleandDescription,
    updateVideoThumbnail,
    viewsInVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishVideo
    );
    router.route("/publishvideo").post(
        upload.fields([
          {
            name: "videoFile",
            maxCount: 1,
          },
          {
            name: "thumbnail",
            maxCount: 1,
          },
        ]),
        publishVideo,
      );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideoThumbnail)
    .patch(updateTitleandDescription)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
router.route("/video").get(getAllVideos);
router.route("/views/:videoId").get(viewsInVideo);

export default router