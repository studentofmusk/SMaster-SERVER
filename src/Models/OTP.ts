import mongoose, {Schema, Document} from "mongoose";


export interface IOTP extends Document{
    email: string;
    otp: string;
    expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>({
   otp:{
    type: String,
    required: [true, "OTP is required!"]
   },
   email:{
    type: String,
    required: [true, "Email is required!"]
   },
   expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        index: { expires: 300 }, // TTL index (300 seconds = 5 minutes)
    },
}, {timestamps:true});


const OTP = mongoose.model<IOTP>("OTP", OTPSchema);
export default OTP;