import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: String,
    description: String,    
    eventList: [{ type: Number }],
    memberList: [{ type: Number }],   
    ownerID: { type: Number },
    admin: { type: Number },
    announcements: [{ type: Number }],
    isPrivate: { type: Boolean, default: false },
    membershipApplications: [{ type: Number }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.Club;
export default mongoose.model("Club", ClubSchema);