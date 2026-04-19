import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    ownerId: { type: Number },
    title: String,
    description: String,
    clubID: { type: Number },
    eventId: { type: Number, default: null },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.Announcement;
export default mongoose.model("Announcement", AnnouncementSchema);