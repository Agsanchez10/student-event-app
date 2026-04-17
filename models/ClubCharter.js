import mongoose from "mongoose";

const ClubCharterSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    purpose: { type: String },
    proposedOwner: { type: String },
    initiatorId: { type: Number, required: true },
    signatures: [{ type: Number }],
    clubId: { type: Number },
    status: {
        type: String,
        enum: ["draft", "collecting", "submitted", "approved", "rejected"],
        default: "collecting",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.ClubCharter;
export default mongoose.model("ClubCharter", ClubCharterSchema);
