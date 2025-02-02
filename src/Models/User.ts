import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document{
    first_name: string;
    last_name: string;
    email: string;
    age: number;
    password: string;
    current:{[key: string]: string};
    createdAt: Date;
    updatedAt: Date;
}


const userSchema = new Schema<IUser>({
    first_name:{
        type: String,
        required: [true, "First Name is required!"],
        validate:{
            validator: (value: string)=> /^[A-Za-z\s]+$/.test(value),
            message:"First name should contain only alphabets"
        }
    },
    last_name:{
        type: String,
        required: [true, "Last Name is required!"],
        validate:{
            validator: (value: string)=> /^[A-Za-z\s]+$/.test(value),
            message:"Last name should contain only alphabets"
        }
    },
    email:{
        type: String,
        required: [true, "Age is required!"],
        validate: {
            validator: (value: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value), // Email regex
            message: "Invalid email format",
        },
    },
    age:{
        type: Number,
        required: [true, "Age is required!"],
        validate:{
            validator: (value: number) => (value >= 5 && value <= 100),
            message: "Invalid Age! Age should be more than 5 or less than 100"
        }
    },
    password:{
        type: String,
        required: true
    },
    current:{
        type:Map,
        of: String,
        required: true,
        default:{
            "ASL":"0.0.0"
        }
    }    
},{timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;