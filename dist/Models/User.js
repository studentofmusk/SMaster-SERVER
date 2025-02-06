import mongoose, { Schema } from "mongoose";
export var Gender;
(function (Gender) {
    Gender[Gender["MALE"] = 0] = "MALE";
    Gender[Gender["FEMALE"] = 1] = "FEMALE";
    Gender[Gender["OTHER"] = 2] = "OTHER";
})(Gender || (Gender = {}));
const userSchema = new Schema({
    first_name: {
        type: String,
        required: [true, "First Name is required!"],
        trim: true,
        validate: {
            validator: (value) => /^[A-Za-z\s]+$/.test(value),
            message: "First name should contain only alphabets",
        },
    },
    last_name: {
        type: String,
        required: [true, "Last Name is required!"],
        trim: true,
        validate: {
            validator: (value) => /^[A-Za-z\s]+$/.test(value),
            message: "Last name should contain only alphabets",
        },
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        trim: true,
        unique: true, // Ensures email uniqueness
        validate: {
            validator: (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value), // Email regex
            message: "Invalid email format",
        },
    },
    age: {
        type: Number,
        required: [true, "Age is required!"],
        validate: {
            validator: (value) => value >= 5 && value <= 100,
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
    gender: {
        type: Number,
        enum: Gender,
        default: Gender.MALE
    }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
