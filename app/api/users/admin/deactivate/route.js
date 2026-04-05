import { NextResponse } from "next/server";
import { deactivateUser } from "@/services/userService";

export async function POST(req) {
    try {
        const body = await req.json();
        
        if (!body.userId) {
            return NextResponse.json(
                { message: "userId is required" },
                { status: 400 }
            );
        }

        const user = await deactivateUser(body.userId);
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error deactivating user:", error);
        return NextResponse.json(
            { message: error.message || "Failed to deactivate user" },
            { status: 500 }
        );
    }
}
