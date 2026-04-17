import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: String,
    description: String,
    date: Date,
    location: String,
    clubId: { type: Number, ref: "Club" },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    ownerId: { type: Number, ref: "User" },
    createdBy: { type: Number },
    registrationList: [{ type: Number }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.Event;
export default mongoose.model("Event", EventSchema);