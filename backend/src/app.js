import express from "express"
import {createServer} from "node:http"  //socket server and express server connecter
import {Server} from "socket.io"
import mongoose from "mongoose"
import dotenv from "dotenv"

import cors from "cors"
import intializeSocket from "./controllers/socketManage.js"
dotenv.config();

const app=express();
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb"}));


app.get("/home",(req,res)=>{
    return res.json({
        message:"Hello World",
    })
})

const server=createServer(app);
const io=intializeSocket(server);
app.set("port",(process.env.PORT || 8080));


const start=async()=>{
    const connectDb=await mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("Successfully Connected");
    })
    .catch(()=>{
        console.log("Server Error");
    })
    server.listen(app.get("port"),()=>{   //my app is in server
        console.log("Listening on the port");
       
    })
}
start();
