import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and Description is required");
  }

  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath || !thumbnailFilePath) {
    throw new ApiError(400, "Video and Thumbnail files are required");
  }

  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnailFile = await uploadOnCloudinary(thumbnailFilePath);

  if (!videoFile || !thumbnailFile) {
    throw new ApiError(400, "Error while uploading Video and thumbnail");
  }

  console.log(
    "Video and Thumbnail after Cloudinary upload",
    videoFile,
    thumbnailFile
  );

  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnailFile?.url,
    title,
    description,
    duration: videoFile?.duration,
    owner: req.user?._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video Published Successfully!!"));

  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  //TODO: get video by id
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.views += 1;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not Found");
  }

  if (video.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError("You are not authorized to update this video");
  }

  const thumbnailLocalPath = req.file?.path;

  let thumbnail;

  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url) {
      throw new ApiError(400, "Error while Uploading Thumbnail");
    }

    if (video.thumbnail) {
      console.log("Old Thumbnail URL:", video.thumbnail);
      const oldPublicId = video.thumbnail.split("/").pop().split(".")[0];
      console.log("Old Public ID for Thumbnail Deletion:", oldPublicId);
      await deleteFromCloudinary(oldPublicId);
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        ...(title && { title }),
        ...(description && { description }),
        ...(thumbnail?.url && { thumbnail: thumbnail?.url }),
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video Updated Successfully"));
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not Found");
  }

  if (video.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError("You are not authorized to delete this video");
  }

  await Video.findByIdAndDelete(videoId);

  if (video.videoFile) {
    const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
    await deleteFromCloudinary(videoPublicId, "video");
  }

  if (video.thumbnail) {
    const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
    await deleteFromCloudinary(thumbnailPublicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted Successfully"));
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not Found");
  }

  if (video.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError("You are not authorized to modify this video");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Publish status Toggled Successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
