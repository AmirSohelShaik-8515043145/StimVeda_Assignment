const mongoose = require("mongoose");
const habitSchema = new mongoose.Schema({
    habitName: {
        type: String,
        required: true,
        trim: true
    },
    startedAt: {
        type: String
    },
    totalTargetDays: {
        type: Number
    },
    totalDaysCount: {
        type: Number,
        default :0
    },
    totalPracticeDays: [],
    habitCompletion: {
        type: String,
        default: "Not Completed",
        enum: ["Completed", "Not Completed"]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { versionKey: false })

module.exports = mongoose.model("habits", habitSchema)