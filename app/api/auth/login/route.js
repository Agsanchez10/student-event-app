import { NextResponse } from "next/server";
import { authenticateUser } from "@/services/authService";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const result = await authenticateUser(email, password);

        if (!result) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const { token, tempToken, requiresOTP, user } = result;

        // If OTP is required, return temporary token and indication
        if (requiresOTP) {
            const response = NextResponse.json(
                { 
                    message: "OTP verification required",
                    requiresOTP: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    }
                }, { status: 200 });

            response.cookies.set("tempToken", tempToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 15, // 15 minutes
            });

            return response;
        }

        // Normal login successful
        const response = NextResponse.json(
            { 
                message: "Login successful",
                requiresOTP: false,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,                    
                }
            }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;        
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
