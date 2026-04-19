import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: String,
    description: String,
    date: Date,
    location: String,

    clubId: { type: Number, ref: "Club" },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    category: { 
        type: String, 
        enum: ["music", "tech", "sports", "social", "academic", "arts", "wellness", "gaming", "networking", "professional", "community-service", "fundraising", "other"],
        default: "other"
    },
    isFree: { type: Boolean, default: true },
    price: { 
        type: Number, 
        default: null,
        validate: {
            validator: function(v) {
                // If isFree is false, price must be provided and positive
                if (!this.isFree && !v) return false;
                if (v && v <= 0) return false;
                return true;
            },
            message: 'Price must be provided and positive when event is not free'
        }
    },
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