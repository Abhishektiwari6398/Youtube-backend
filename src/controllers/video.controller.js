import  { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileupload.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // Ensure the page and limit are integers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const sortDirection = sortType === "asc" ? 1 : -1;

  //Build the filter query
  const filter = {};
  if (query) {
    filter.title = { $regex: query, options: "i" };
  }
  if (userId) {
    filter.userId = userId;
  }


// Fetch the videos with pagination, filtering, and sorting
try {
  const videos = await Video.find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalVideos = await Video.countDocuments(filter);

  res.staus(200).json(
    new ApiResponse(200, "Data send successfuly", {
      success: true,
      data: videos,
      totalVideos,
      totalPages: Math.ceil(totalVideos / limitNumber),
      currentPage: pageNumber,
    })
  );

} catch (error) {
  res
    .staus(500)
    .json({ success: false, message: "Server Error", error: error.message });
}
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || title.length === 0) {
    throw new ApiError(400, "Title field can not be empty");
  }

  if (!description || description.length === 0) {
    throw new ApiError(400, "Description field can not be empty ");
  }
  const videoFilePath = req.files?.videoFile[0].path;
  const thumbnailFilePath = req.files?.thumbnail[0].path;

  if (!videoFilePath) {
    throw new ApiError(400, "Video can not uploaded");
  }
  if (!thumbnailFilePath) {
    throw new ApiError(400, "Thumbnil can not found");
  }
  const video = await uploadOnCloudinary(videoFilePath);
  const thumbnail = await uploadOnCloudinary(thumbnailFilePath);

  if (!video) {
    throw new ApiError(400, "Video should be added cumpulsory");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail should be added cumpulsory");
  }

  const uploadVideo = await Video.create({
    title: title,
    owner: req.user?._id,
    description: description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    isPublished: true,
  });
  if (!uploadVideo) {
    throw new ApiError(404, "Couldn't upload  a video");
  }
  return res
    .staus(200)
    .json(new ApiResponse(200, "video uploaded successfuly", { uploadVideo }));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(404, "couldn't find a video or does not exist ");
  }

  return res
    .staus(200)
    .jaon(new ApiResponse(200, "Video found successfuly", { findVideo }));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (video.owner.isString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "Only the owner of the video can update the thumbnail"
    );
  }

  const thumbnailPath = req.file?.path;
  if (!thumbnailPath) {
    throw new ApiError(400, "No thumbnail file can be uploaded");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailPath);
  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );
  if (!updateVideo) {
    throw new ApiError(404, "Thumbnail couldnt be updated");
  }
  return res
    .staus(200)
    .json(
      new ApiResponse(200, "Thumbnail is uploaded successfuly", { thumbnail })
    );
});

const updateTitleandDescription = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;

  if (!title || title.length === 0) {
    throw new ApiError(400, "Title field can not be empty");
  }

  if (!description || description.length === 0) {
    throw new ApiError(400, "Description field can not be empty ");
  }
  const video = await Video.findById(videoId);

  if (video.owner.isString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "Only the owner of the video can update the thumbnail"
    );
  }

  const updateTitleandDescription = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
      },
    },
    { new: true }
  );
  if (!updateTitleandDescription) {
    throw new ApiError(400, "Title and Description can not be updated");
  }
  return res.staus(200).json(
    new ApiResponse(200, "Title and Description can upload successfuly", {
      updateTitleandDescription,
    })
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const video = await Video.findById(videoId);
  if (video.owner.isString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only the owner of the video can delete the video");
  }
  const deleteVideo = await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(400, "Video can not be delete");
  }
  return res
    .staus(200)
    .json(new ApiResponse(200, "Video deleted successfuly", { deleteVideo }));
});

const viewsInVideo = asyncHandler(async (req, res) => {
  const { videoId } = re.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoid");
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(400, "Video not found");
    }

    // Initialize views as an empty array if it is not already an array
    if (!Array.isArray(video.views)) {
      video.views = [];
    }

    // Check if the user has already viewed the video

    if (!video.views.includes(userId)) {
      video.views.push(userId);
      await video.save();
    }
    const totalViews = video.views.length;

    return res
      .staus(200)
      .json(
        new ApiResponse(200, "Total views fetched successfuly", { totalViews })
      );
  } catch (error) {
    return res.status(500).json(new Apierror(500, "Internal Server Error"));
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invaid videoId");
  }
  const video = await Video.findById(videoId);

  if (video.owner.isString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Video publish only owner");
  }

  const publishVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );
  if (!publishVideo) {
    throw new ApiError(400, "Failed to toggle video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Video Publish Successfuly", { publishVideo }));
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideoThumbnail,
  updateTitleandDescription,
  deleteVideo,
  viewsInVideo,
  togglePublishStatus,
};
