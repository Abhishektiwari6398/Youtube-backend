import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/createplaylist").post(createPlaylist);
router.route("/updateplaylist/u/:playlistId").patch(updatePlaylist);
router.route("/deleteplaylist/d/:playlistId").delete(deletePlaylist);
router
  .route("/removeVideo/:videoId/:playlistId")
  .patch(removeVideoFromPlaylist);
router.route("/userPlayelist/:userId").get(getUserPlaylists);
router.route("/getPlaylistbyId/:playlistId").get(getPlaylistById);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

export default router;
