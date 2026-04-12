import { withDB} from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const getUsers = withDB(async () => {
    const users = await User.find({});
    return users;
});

export const getUser = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }   
    return user;
});

export const createUser = withDB(async (body) => {
    const lastID = await User.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;
    
    const user = await User.create({ ...body, _id: newId });
    return user;
});

export const deleteUser = withDB(async (body) => {
    const user = await User.findByIdAndDelete(body.id);
    if (!user) {
        throw new Error("404: User not found");
    }
    return user;
});
    

export const updateUser = withDB(async (userid, body) => {
    
    if(body.ownedClubs) {
        const user = await User.findByIdAndUpdate(
            userid, 
            { $push: { ownedClubs: { $each: body.ownedClubs } } },
            { returnDocument: "after", strict: false }
        );
        if(!user) {
            throw new Error("404: User not found");
        }
        return user;
    }  
    else if(body.clubMemberships) {
        const user = await User.findByIdAndUpdate(
            userid,
            { $push: { clubMemberships: { $each: body.clubMemberships } } },
            { returnDocument: "after", strict: false }
        );
        if(!user) {
            throw new Error("404: User not found");
        }
        return user;
    }  

    
    const user = await User.findByIdAndUpdate(userid, body, { returnDocument: "after" });    
        if (!user) {
            throw new Error("404: User not found");
        }
        return user;
    });

export const getUserByEmail = withDB(async (email) => {
    const user = await User.findOne({ email: email });
    return user;
});

export const createCollegeAdmin = withDB(async (body) => {
    const lastID = await User.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;
    
    const adminData = {
        ...body,
        _id: newId,
        role: "Admin",
        adminType: "CollegeAdmin",
        isActive: true
    };
    
    const user = await User.create(adminData);
    return user;
});

export const deactivateUser = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }
    
    if (user.role === "Admin") {
        user.isActive = false;
        await user.save();
    } else {
        throw new Error("Only admin accounts can be deactivated");
    }
    
    return user;
});

export const activateUser = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }
    
    if (user.role === "Admin") {
        user.isActive = true;
        await user.save();
    } else {
        throw new Error("Only admin accounts can be activated");
    }
    
    return user;
});

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Initiate password reset by generating OTP
export const initiatePasswordReset = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }
    
    // Generate OTP valid for 15 minutes
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    // Return OTP to be sent via email (in a real app, this would be sent via email service)
    return {
        success: true,
        message: "OTP generated successfully",
        otp: otp, // In production, don't return OTP directly to frontend
        expiresIn: "15 minutes"
    };
});

// Reset password using OTP
export const resetPasswordWithOTP = withDB(async (userId, otp, newPassword) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }
    
    // Verify OTP
    if (!user.otp || user.otp !== otp) {
        throw new Error("Invalid OTP");
    }
    
    // Check if OTP has expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        throw new Error("OTP has expired");
    }
    
    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    
    return {
        success: true,
        message: "Password reset successfully"
    };
});

// Get all admins (for SystemAdmin dashboard)
export const getAllAdmins = withDB(async () => {
    const admins = await User.find({ role: "Admin" });
    return admins;
});

// Create a SystemAdmin
export const createSystemAdmin = withDB(async (body) => {
    const lastID = await User.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;
    
    const adminData = {
        ...body,
        _id: newId,
        role: "Admin",
        adminType: "SystemAdmin",
        isActive: true
    };
    
    const user = await User.create(adminData);
    return user;
});