const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    habits: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "habits"
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { versionKey: false })

module.exports = mongoose.model("users", userSchema)