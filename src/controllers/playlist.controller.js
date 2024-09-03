import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const createPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });
  if (!createPlaylist) {
    throw new ApiError(400, "Playlist not created");
  }
  return res
    .status(200)
    .res(
      new ApiResponse(200, "Playlist created successfuly", { createPlaylist })
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const playlist = await Playlist.find({
    owner: userId,
  });
  if (!playlist || playlist.length === 0) {
    throw new ApiError(400, "playlist not found");
  }
  return res
    .status(200)
    .json(new Apisuccess(200, "Playlists fetched successfully", { playlist }));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "Couldn't find the playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Plylist found", { findPlaylist }));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid PlaylsitId");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoId");
  }
  const playlist = await Playlist.findById(playlistId);
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(200, "Only the valid user can add video from playlist");
  }
  const video = await Playlist.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  Playlist.videos.push(videoId);
  await Playlist.save();
  res.status(201).json({
    message: "Video added to playlist successfully",
    playlistId,
    videoId,
  });
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playlist = await Playlist.findById(playlistId);
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      200,
      "Only the valid user can delete video from playlist"
    );
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: "videoId",
      },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(404, "Video couldn't be removed from the playlist");
  }
  return res
    .status(200)
    .json(
      new Apisuccess(
        200,
        "Video removed from the playlist successfully",
        updatedPlaylist
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const playlist = await Playlist.findById(playlistId);
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      200,
      "Only the valid user can delete video from playlist"
    );
  }
  const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletePlaylist) {
    throw new ApiError(400, "Couldn't delete Playlist. Try again later");
  }
  return res
    .status(200)
    .json(new Apisuccess(200, "Playlist deleted successfully", {}));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  if (!description || description.length === 0) {
    throw new ApiError(400, "Description cannot be empty");
  }
  if (!name || name.length === 0) {
    throw new ApiError(400, "Playlist name cannot be empty");
  }
  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }
  if (findPlaylist.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "Only the valid owner can change playlist");
  }

  const updated = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  if (!updated) {
    throw new ApiError(500, "Playlist cannot be updated now. Try again later");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist updated successfully", {}));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
