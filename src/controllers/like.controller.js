import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const videolikealready = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (videolikealready) {
    await Like.findByIdAndDelete(videolikealready._id);

    return res.status(200).json(new ApiResponse(200, "Already liked", {}));
  } else {
    await Like.create({
      video: videoId,
      likedby: req.user?._id,
    });
  }
  return res.status(200).json(new ApiResponse(200, "Video liked", {}));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }
  const commentLikedAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (commentLikedAlready) {
    await Like.findByIdAndDelete(commentLikedAlready?._id);
    return res.status(200).json(new ApiResponse(200, "comment alredy liked"));
  } else {
    await Like.create({
      comment: commentId,
      likedby: req.user?._id,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked successfully", {}));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }
  const alredytweetlike = await Like.findOne({
    tweetlike: tweetId,
    likedby: req.user?._id,
  });
  if (alredytweetlike) {
    await Like.findByIdAndDelete(alredytweetlike?._id);
    return res.status(200).json(new ApiResponse(200, "Already tweet like"));
  } else {
    Like.create({
      tweetlike: tweetId,
      likedby: req.user?._id,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet liked successfully", {}));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedby: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "like",
      },
    },
    {
      $addFields: {
        totalLikedbyuser: {
          $size: "$like",
        },
      },
    },
    {
      $project: {
        likedby: 1,
        totalLikedbyuser: 1,
        like: 1,
      },
    },
  ]);
  if(!likedVideos || likedVideos.length===0){
    throw new ApiError(404, "Couldn't find liked videos");
  }
  return res.status(200)
  .json(new ApiResponse(200,"Fetched all the liked video successfully",{likedVideos}))
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
