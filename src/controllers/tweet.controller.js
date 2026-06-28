import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
});
const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});
const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update Tweet
});
const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete Tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
