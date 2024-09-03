import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getAllTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router=Router();
router.use(verifyJWT)
router.route("/tweet").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/deletetweet/d/:tweetId").delete(deleteTweet)
router.route("/updatetweet/d/:tweetId").post(updateTweet)
router.route("/getAllTweet").get(getAllTweet)

export default router