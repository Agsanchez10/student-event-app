import { NextResponse } from "next/server";
import { deactivateUser, activateUser, initiatePasswordReset } from "@/services/userService";
import { verifySystemAdmin } from "@/lib/authMiddleware";

export async function POST(req) {
    try {
        // Verify SystemAdmin access
        const auth = await verifySystemAdmin(req);
        if (!auth.isValid) {
            return NextResponse.json({ message: auth.error }, { status: 403 });
        }

        const body = await req.json();
        const { action, userId } = body;

        if (!action || !userId) {
            return NextResponse.json(
                { message: "action and userId are required" },
                { status: 400 }
            );
        }

        if (action === "deactivate") {
            const user = await deactivateUser(userId);
            return NextResponse.json(
                { message: "Account deactivated successfully", user },
                { status: 200 }
            );
        } else if (action === "activate") {
            const user = await activateUser(userId);
            return NextResponse.json(
                { message: "Account activated successfully", user },
                { status: 200 }
            );
        } else if (action === "reset-password") {
            const result = await initiatePasswordReset(userId);
            return NextResponse.json(
                {
                    message: "Password reset initiated",
                    result: result
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { message: "Invalid action. Use: deactivate, activate, or reset-password" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error managing account:", error);
        return NextResponse.json(
            { message: error.message || "Failed to manage account" },
            { status: 500 }
        );
    }
}
