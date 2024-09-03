import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))//This middleware serves static files from the "public" directory. 
//Any files in the "public" directory can be accessed directly via the URL.
app.use(cookieParser())


//routes import 

import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import subscribeRouter from './routes/subscribe.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import likedRouter from './routes/like.routes.js'
import commentRouter from "./routes/comment.routes.js"

//routes declartion
app.use("/api/v1/users",userRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/subscribed",subscribeRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/liked",likedRouter)
app.use("/api/v1/comment",commentRouter)




// http://localhost:8000/api/v1/users/register  :example for how to routes work in the server

export {app}

