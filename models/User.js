import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["student", "admin", "club_owner"], default: "student" },
    
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });

delete mongoose.models.User;
export default mongoose.model("User", UserSchema);

// student fields
const Student = User.discriminator("Student", new mongoose.Schema({
    clubMemberships: [{ type: Number, ref: "Club" }],
    eventRegistrations: [{ type: Number, ref: "Event" }],
}));

// admin fields
const Admin = User.discriminator("Admin", new mongoose.Schema({
    pastActions: [{ type: String }]
}));

// club owner fields
const ClubOwner = User.discriminator("ClubOwner", new mongoose.Schema({
    onwnedClubs: [{ type: Number, ref: "Club" }],
}));