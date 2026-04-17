import { NextResponse } from "next/server";
import { verifyOTPAndLogin } from "@/services/authService";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        const { otp } = await req.json();
        const tempToken = req.cookies.get("tempToken")?.value;

        if (!otp || !tempToken) {
            return NextResponse.json({ error: "OTP and temporary token are required" }, { status: 400 });
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

        // Verify OTP and complete login
        const result = await verifyOTPAndLogin(decoded.id, otp);

        if (!result) {
            return NextResponse.json({ error: "Invalid OTP or OTP expired" }, { status: 401 });
        }

        const { token, user } = result;

        const response = NextResponse.json(
            {
                message: "OTP verified, login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
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
        console.error("OTP verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
