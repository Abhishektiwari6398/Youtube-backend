import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body

      if(!content || content.trim().length===0){
        throw new ApiError(400,"Enter valid content")
      }
       const user=await User.findById(req.user?._id);
       if(!user){
        throw new ApiError(400,"Couldn't find the user")
       }

     const tweet =  Tweet.create({
        content,
        owner:req.user?._id
       })
       if(!tweet){
        throw new ApiError(400,"Try again later")
       }
       return res
       .status(200)
       .json(new ApiResponse(200,"Tweeted Successfuly",{tweet}))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {UserId}=req.params
    if(!isValidObjectId(UserId)){
        throw new ApiError(400,"Invalid userId")
    }
     const user= await User.findById(UserId);
     if(!user){
        throw new ApiError(400,"User doesn't exist")
     }
   const allTweets=  await Tweet.find({
        owner:UserId
     })
     if(allTweets.length===0){
        throw new ApiError(400,"No tweets by the user")
     }
     return res
     .status(200)
     .json(new ApiResponse(200,"All tweets can fetched successfuly",{allTweets}))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {content}=req.body

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Id")
    }
    if(!content || content.trim().length==0){
        throw new ApiError(400,"Content field is empty")
    }
    const newTweet=await Tweet.findById(tweetId);

    if(!newTweet){
        throw new ApiError(400,"Tweet not find")
    }

   
    if(newTweet?.owner.isString() !== req.user?._id.toString()){
        throw new ApiError(400,"only owner can tweet and edit")
    }
  const tweet=  Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content
        }
    },{new:true})

     if(!tweet){
        throw new ApiError(500,"Try again later")
     }

     return res
     .status(200)
     .json(new ApiResponse(200,"Tweet update uccessfyly",{tweet}))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid ID")
    }
    const tweet= await Tweet.findById(tweetId);
    if(tweet?.owner.isString() !== req.user?._id.toString()){
        throw new ApiError(400,"Only owner can delete the tweet")
    }
   const deleteTweet=  await Tweet.findByIdAndDelete(tweetId)
    if(!deleteTweet){
        throw new ApiError(500,"Try again later")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,"Tweet deleted succssfuly",{deleteTweet}))
})

const getAllTweet=asyncHandler(async(req,res)=>{
    const alltweets=await Tweet.aggregate([
        {
            $lookup:{
                from:'users',
                localField:'owner',
                foreignField:'_id',
                as:"user"

            }
        },
        {
            $unwind:'$user'
        },{
            $project:{
                _id:1,
                content:1,
                createdAt:1,
                'user.username':1,
            }
        }
        
    ])
    return res.status(200).json(new Apisuccess(200, 'All Tweets fetched', { alltweets }));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweet
}