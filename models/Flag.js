import mongoose from "mongoose";

const FlagSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    flaggedById: { type: Number, required: true },
    contentId: { type: Number, required: true },
    type: { type: String, enum: ["user", "club", "announcement", "event", "charter"], required: true },
    reason: { type: String, enum: ["spam", "harassment", "inappropriate", "misinformation", "other"], required: true },
    description: String,
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Number },
    resolution: String,
    adminNotes: String,
    dateResolved: Date,
    reportedAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.Flag;
export default mongoose.model("Flag", FlagSchema);