import bcrypt,{hash} from "bcrypt";
import httpStatus from "http-status";
import { User } from "../models/usermodel.js";
import crypto from "crypto";
const login=async(req,res)=>{
     const {username,password}=req.body;
       if(!username || !password){
            return res.status(400).json({
                message:"PLease enter details"
            })

        }
    try{
        const user=await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({
                message:"User Not found..."
            });
        }
        if(bcrypt.compare(password,user.password)){
            let token=crypto.randomBytes(20).toString("hex");
            user.token=token; 
            await user.save();
            return res.status(httpStatus.OK).json({
                token:token,
            }) 
        }
    }
    catch(err){
        return res.status(500).json({
            message:"Something went wrong",
        })

    }
}
const register=async(req,res)=>{
    const {name,username,password}=req.body;
    if (!name || !username || !password) {
    return res.status(400).json({
        message: "All fields are required",
    });
}
    try{
        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({
                message:"User already exist",
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser=new User({
            name:name,
            username:username,
            password:hashedPassword,
        })

        await newUser.save();
        res.status(httpStatus.CREATED).json({message:"User Registered"})



    }catch(error){
        console.log(error);
        res.json({
            message:"Something went wrong",
        })

    }
}

export {login,register};