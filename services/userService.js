import { withDB} from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const getUsers = withDB(async () => {
    const users = await User.find({}).lean();
    return users;
});

export const getUser = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) }).lean();
    if (!user) {
        throw new Error("404: User not found");
    }   
    return user;
});

export const createUser = withDB(async (body) => {
    const lastID = await User.findOne().sort({ _id: -1 }).lean();
    const newId = lastID ? lastID._id + 1 : 1;
    
    const user = await User.create({ ...body, _id: newId });
    return user.toObject();
});

export const deleteUser = withDB(async (body) => {
    const user = await User.findOneAndDelete({ _id: Number(body.id) }).lean();
    if (!user) {
        throw new Error("404: User not found");
    }
    return user;
});
    

export const updateUser = withDB(async (userid, body) => {
    
    if(body.ownedClubs) {
        const user = await User.findOneAndUpdate(
            { _id: Number(userid) },
            { $push: { ownedClubs: { $each: body.ownedClubs } } },
            { returnDocument: "after", strict: false }
        ).lean();
        if(!user) {
            throw new Error("404: User not found");
        }
        return user;
    }  
    else if(body.clubMemberships) {
        const user = await User.findOneAndUpdate(
            { _id: Number(userid) },
            { $push: { clubMemberships: { $each: body.clubMemberships } } },
            { returnDocument: "after", strict: false }
        ).lean();
        if(!user) {
            throw new Error("404: User not found");
        }
        return user;
    }  

    
    const user = await User.findOneAndUpdate({ _id: Number(userid) }, body, { returnDocument: "after" }).lean();    
        if (!user) {
            throw new Error("404: User not found");
        }
        return user;
    });

export const getUserByEmail = withDB(async (email) => {
    const user = await User.findOne({ email: email }).lean();
    return user;
});

export const createCollegeAdmin = withDB(async (body) => {
    const lastID = await User.findOne().sort({ _id: -1 }).lean();
    const newId = lastID ? lastID._id + 1 : 1;
    
    const adminData = {
        ...body,
        _id: newId,
        role: "Admin",
        adminType: "CollegeAdmin",
        isActive: true
    };
    
    const user = await User.create(adminData);
    return user.toObject();
});

export const deactivateUser = withDB(async (userId) => {
    const user = await User.findOneAndUpdate(
        { _id: Number(userId) },
        { isActive: false },
        { returnDocument: "after" }
    ).lean();
    
    if (!user) {
        throw new Error("404: User not found");
    }
    
    if (user.role !== "Admin") {
        throw new Error("Only admin accounts can be deactivated");
    }
    
    return user;
});

export const activateUser = withDB(async (userId) => {
    const user = await User.findOneAndUpdate(
        { _id: Number(userId) },
        { isActive: true },
        { returnDocument: "after" }
    ).lean();
    
    if (!user) {
        throw new Error("404: User not found");
    }
    
    if (user.role !== "Admin") {
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
    // Generate OTP valid for 15 minutes
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const hashedOtp = await bcrypt.hash(otp, 10);

    const user = await User.findOneAndUpdate(
        { _id: Number(userId) },
        { otp: hashedOtp, otpExpiry: otpExpiry, requiresOTP: true },
        { returnDocument: "after" }
    ).lean();
    
    if (!user) {
        throw new Error("404: User not found");
    }
    
    // Send OTP via email
    try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: user.email,
            subject: 'Password Reset - One Time Password',
            html: `
                <h2>Password Reset Request</h2>
                <p>Your one-time password (OTP) is:</p>
                <h1 style="color: #e05c5c; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 15 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            `,
        });
    } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        // Don't fail the entire operation if email fails
    }
    
    return {
        success: true,
        message: "OTP has been sent to the user's email",
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