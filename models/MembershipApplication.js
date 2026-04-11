import mongoose from "mongoose";

const MembershipApplicationSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    clubID: { type: Number, ref: "Club", required: true },
    userId: { type: Number, ref: "User", required: true },
    userName: String,
    userEmail: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.MembershipApplication;
export default mongoose.model("MembershipApplication", MembershipApplicationSchema);
