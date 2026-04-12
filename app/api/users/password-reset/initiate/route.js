import { NextResponse } from "next/server";
import { initiatePasswordReset } from "@/services/userService";

export async function POST(req) {
    try {
        const body = await req.json();
        
        if (!body.userId) {
            return NextResponse.json(
                { message: "userId is required" },
                { status: 400 }
            );
        }

        const result = await initiatePasswordReset(body.userId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error initiating password reset:", error);
        return NextResponse.json(
            { message: error.message || "Failed to initiate password reset" },
            { status: 500 }
        );
    }
}
