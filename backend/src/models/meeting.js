import {Schema} from "mongoose";
const meeting=new Schema({
    user_id:{
        type:String,
    },
    meetingCode:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
        required:true,
    }

})
const Meeting=mongoose.model("Meeting",meeting);
export {Meeting};  //i want to export most of the things...