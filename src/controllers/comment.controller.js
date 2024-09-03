import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // Get all comments for a video with pagination
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoId");
  }

  const skip = (page - 1) * limit;
  const commentsPipeline = [
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "comment",
      },
    },
    {
      $addFields: {
        totalcomment: {
          $size: "$comment",
        },
      },
    },
    {
      $project: {
        video: 1,
        totalcomment: 1,
        comment: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const allcommentinvideo = await Comment.aggregate(commentsPipeline);

  if (!allcommentinvideo || allcommentinvideo.length === 0) {
    throw new ApiError(404, "Couldn't find comments");
  }

  const totalCount = await Comment.countDocuments({
    video: mongoose.Types.ObjectId(videoId),
  });
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(200, "Fetched all comments successfully", {
      comments: allcommentinvideo,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
      },
    })
  );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(404, "Couldnt comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Commented Successfully", comment));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Content can not be empty");
  }
  const verifyComment = await Comment.findById(commentId);
  if (!verifyComment) {
    throw new ApiError(400, "Couldnt find the comment");
  }
  if (!verifyComment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only valid user can update comment");
  }
  const comment = await Comment.create(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );
  if (!comment) {
    throw new ApiError(404, "Couldnt update the comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(402, "Couldnt find the comment");
  }
  if (comment.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only the owner can delete comment");
  }
  const newcomment = await Comment.findByIdAndDelete(commentId);
  if (!newcomment) {
    throw new ApiError(500, "Couldnt delete the comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully", newcomment));
});

export { getVideoComments, addComment, updateComment, deleteComment };
