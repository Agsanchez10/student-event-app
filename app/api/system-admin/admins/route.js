import { NextResponse } from "next/server";
import { getAllAdmins } from "@/services/userService";
import { verifySystemAdmin } from "@/lib/authMiddleware";

export async function GET(req) {
    try {
        // Verify SystemAdmin access
        const auth = await verifySystemAdmin(req);
        if (!auth.isValid) {
            return NextResponse.json({ message: auth.error }, { status: 403 });
        }

        const admins = await getAllAdmins();
        return NextResponse.json(admins, { status: 200 });
    } catch (error) {
        console.error("Error fetching admins:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch admins" },
            { status: 500 }
        );
    }
}
