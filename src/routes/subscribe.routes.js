import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/sub/:channelId").post(toggleSubscription);
router.route("/getchannel/sub/:channelId").get(getUserChannelSubscribers);
router
  .route("/getsubscribedchannel/sub/:subscriberId")
  .get(getSubscribedChannels);

export default router;
