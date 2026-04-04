import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const baseOptions = {
    versionKey: false,
    discriminatorKey: "role",
    timestamps: true,
};

const UserSchema = new mongoose.Schema(
    {
        _id: { type: Number, required: true },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true }, //, minlength: 6 },
        role: { type: String, enum: ["Student", "Admin", "ClubOwner"], default: "Student", required: true },            
    }, baseOptions
);

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) 
        return;
    this.password = await bcrypt.hash(this.password, 10);    
});

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);
export default User;

// student fields
export const Student = mongoose.models.Student ??
    User.discriminator(
        "Student", 
        new mongoose.Schema({
            clubMemberships:    [{ type: Number, ref: "Club" }],
            eventRegistrations: [{ type: Number, ref: "Event" }],
        })
    );

// admin fields
export const Admin = mongoose.models.Admin ??
    User.discriminator(
        "Admin", 
        new mongoose.Schema({
            pastActions: [{ type: String }]
        })
    );

// club owner fields
export  const ClubOwner = mongoose.models.ClubOwner ??
    User.discriminator(
        "ClubOwner", 
        new mongoose.Schema({
            ownedClubs: [{ type: Number, ref: "Club" }],
        })
    );