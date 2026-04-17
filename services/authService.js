import { withDB } from "@/lib/mongodb";
 import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";
 import { getUser, getUserByEmail } from "./userService";

export const authenticateUser = withDB(async (email, password) => {
    const user = await getUserByEmail(email);
    if (!user) {
        console.log(`Authentication failed: No user found with email ${email}`);
        return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && !(user.otp && user.otpExpiry && new Date() < new Date(user.otpExpiry))) {
        console.log(`Authentication failed: Incorrect password for email ${email}`);
        return null;
    }

    // Check if user has a valid OTP
    const hasValidOTP = user.otp && user.otpExpiry && new Date() < new Date(user.otpExpiry);
    
    if (hasValidOTP) {
        // Return a temporary token for OTP verification (short expiry)
    
        const tempToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role, requiresOTP: true },
            process.env.JWT_SECRET,
            { expiresIn: "15m" } 
        );
        
        return {
            tempToken,
            requiresOTP: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            }
        };
    }

    // Normal login flow if no OTP is required
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role},
        process.env.JWT_SECRET,
        { expiresIn: "7d" } 
    );

    return { 
        token, 
        requiresOTP: false,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,            
        } };
});

// Verify OTP and complete login
export const verifyOTPAndLogin = withDB(async (userId, otp) => {
    const user = await getUser(userId);
    if (!user) {
        return null;
    }

    // Check if OTP is valid
    const isOTPValid = user.otp === otp && user.otpExpiry && new Date() < new Date(user.otpExpiry);
    if (!isOTPValid) {
        return null;
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Create full login token
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
        }
    };
});