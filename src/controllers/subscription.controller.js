import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid objectId");
  }

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });
  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Unsubscribed Successfuly", { subscription: null })
      );
  } else {
    const newSubscription = await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200), "Subscribe successfuly", { newSubscription });
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid objectId");
  }
  try {
    const subscriber = await Subscription.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscibercount",
        },
      },
      {
        $addFields: {
          subs: {
            $size: "$subscribercount",
          },
        },
      },
      {
        $project: {
          subs: 1,
          subscribercount: {
            _id: 1,
            fullname: 1,
            username: 1,
          },
        },
      },
    ]);
    if (!subscriber || subscriber.length === 0) {
      return res.status(200).json(
        new ApiResponse(
          201,
          { subscriber },
          {
            noOfSubscriber: 0,
            message: "0 subscriber",
          }
        )
      );
    }
    return res.status(200).json(
      new Apisuccess(200, "All subscribers fetched successfully", {
        subscriber,
      })
    );
  } catch (error) {
    throw new ApiError(400, "Something went wrong");
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }

  const subscribed = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribed",
      },
    },
    {
        $addFields:{
            subscribed:{
                $first:"$subscribed"
            }
        },
    },
    {
        $addFields:{
            $totalChannelSubscribed:{
                $size:"$subscribed"
            }
        }
    },
    {
        $project:{
            totalChannelSubscribed:1,
            subscribed:{
                username:1,
                fullname:1,
            }
        }
    }
  ]);
  if (!subscribed || Object.entries(subscribed).length === 0) {
    throw new ApiError(404, "No channel subscribed");
  }
  return res.status(200).json(
    new ApiResponse(200, "All subscribed channel fetched successfully", {
      subscribed,
    }),
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
