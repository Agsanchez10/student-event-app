import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: String,
    description: String,    
    eventList: [{ type: Number, ref: "Event" }],
    memberList: [{type: Number, ref: "User" }],   
    ownerID: { type: Number, ref: "User" },
    admin: { type: Number, ref: "User" },
    announcements: [{ type: String }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.Club;
export default mongoose.model("Club", ClubSchema);