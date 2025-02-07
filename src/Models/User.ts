import mongoose, { Document, Schema } from "mongoose";

export enum Gender {
    MALE,
    FEMALE,
    OTHER,
}

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    age: number;
    gender: Gender;
    current: { [key: string]: string };
    token: string;
    update_token: (token: string)=> Promise<any>;
    change_password: (password: string)=>Promise<any>;
}

const userSchema = new Schema<IUser>(
    {
        first_name: {
            type: String,
            required: [true, "First Name is required!"],
            trim: true,
            validate: {
                validator: (value: string) => /^[A-Za-z\s]+$/.test(value),
                message: "First name should contain only alphabets",
            },
        },
        last_name: {
            type: String,
            required: [true, "Last Name is required!"],
            trim: true,
            validate: {
                validator: (value: string) => /^[A-Za-z\s]+$/.test(value),
                message: "Last name should contain only alphabets",
            },
        },
        email: {
            type: String,
            required: [true, "Email is required!"],
            trim: true,
            unique: true, // Ensures email uniqueness
            validate: {
                validator: (value: string) =>
                    /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value), // Email regex
                message: "Invalid email format",
            },
        },
        age: {
            type: Number,
            required: [true, "Age is required!"],
            validate: {
                validator: (value: number) => value >= 5 && value <= 100,
                message: "Invalid Age! Age should be more than 5 or less than 100",
            },
        },
        password: {
            type: String,
            required: [true, "Password is required!"],
        },
        current: {
            type: Object, 
            of: String, 
            required: true,
            default: {
                ASL: "0.0.0",
            },
        },
        gender:{
            type: Number,
            enum: Gender,
            default: Gender.MALE
        },
        token:{
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);


userSchema.methods.update_token = function (token: string){
    this.token = token;
    return this.save();
}
userSchema.methods.change_password = function (password: string){
    this.password = password;
    return this.save();
}


const User = mongoose.model<IUser>("User", userSchema);
export default User;
