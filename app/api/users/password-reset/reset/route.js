import { NextResponse } from "next/server";
import { resetPasswordWithOTP } from "@/services/userService";

export async function POST(req) {
    try {
        const body = await req.json();
        
        if (!body.userId || !body.otp || !body.newPassword) {
            return NextResponse.json(
                { message: "userId, otp, and newPassword are required" },
                { status: 400 }
            );
        }

        const result = await resetPasswordWithOTP(body.userId, body.otp, body.newPassword);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error resetting password:", error);
        return NextResponse.json(
            { message: error.message || "Failed to reset password" },
            { status: 500 }
        );
    }
}
