import { NextResponse } from "next/server";
import { getUsers } from "@/services/userService";
import { verifySystemAdmin } from "@/lib/authMiddleware";

export async function GET(req) {
    try {
        // Verify SystemAdmin access
        const auth = await verifySystemAdmin(req);
        if (!auth.isValid) {
            return NextResponse.json({ message: auth.error }, { status: 403 });
        }

        const users = await getUsers();
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch users" },
            { status: 500 }
        );
    }
}
