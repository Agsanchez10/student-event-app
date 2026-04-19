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
        role: { type: String, enum: ["Student", "CollegeAdmin", "SystemAdmin", "ClubOwner"], default: "Student", required: true },        
        // One-time password for password reset
        otp: { type: String, default: null },
        otpExpiry: { type: Date, default: null },
        requiresOTP: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
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
            clubMemberships:    [{ type: Number }],
            eventRegistrations: [{ type: Number }],
        })
    );

// CollegeAdmin fields
export const CollegeAdmin = mongoose.models.CollegeAdmin ??
    User.discriminator(
        "CollegeAdmin", 
        new mongoose.Schema({            
            pastActions: [{ type: String }]
        })
    );

// SystemAdmin fields
export const SystemAdmin = mongoose.models.SystemAdmin ??
    User.discriminator(
        "SystemAdmin",
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