import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUser, updateUser } from "@/services/userService";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { otp, newPassword } = await req.json();
        const tempToken = req.cookies.get("tempToken")?.value;

        if (!otp || !newPassword || !tempToken) {
            return NextResponse.json({ error: "OTP, new password, and temporary token are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Verify the temporary token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: "Invalid or expired temporary token" }, { status: 401 });
        }

        if (!decoded.requiresOTP) {
            return NextResponse.json({ error: "OTP verification not required" }, { status: 400 });
        }

        // Get user and verify OTP
        const user = await getUser(decoded.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify OTP - it should be stored as plaintext since it was just generated and emailed
        if (!user.otp || !(await bcrypt.compare(otp, user.otp))) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
        }

        // Check if OTP has expired
        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            // Clear expired OTP
            await User.findOneAndUpdate(
                { _id: user._id }, 
                { otp: null, otpExpiry: null },
                { new: true }
            );
            return NextResponse.json({ error: "OTP has expired" }, { status: 401 });
        }

        // Update password and clear OTP
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            {
                password: hashedPassword,
                otp: null,
                otpExpiry: null,
                requiresOTP: false
            },
            { new: true }
        ).lean();

        // Create permanent token
        const token = jwt.sign(
            { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const response = NextResponse.json(
            {
                message: "Password set successfully",
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    role: updatedUser.role,
                }
            },
            { status: 200 }
        );

        // Clear temporary token and set permanent token
        response.cookies.set("tempToken", "", {
            maxAge: 0,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Set new password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
