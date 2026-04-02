import mongoose from "mongoose";

const FlagSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    ownderId: { type: Number, ref: "User" },
    posterId: { type: Number, ref: "User" },
    notes: String,
    isResolved: { type: Boolean, default: false },
    dateResolved: Date,
    type: { type: String, enum: ["user", "club", "announcement", "event"], required: true },    
    reportedAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.Flag;
export default mongoose.model("Flag", FlagSchema);