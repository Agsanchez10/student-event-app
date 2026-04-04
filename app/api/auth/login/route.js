import { NextResponse } from "next/server";
import { authenticateUser } from "@/services/authService";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const token = await authenticateUser(email, password);

        if (!token) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
        const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

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
