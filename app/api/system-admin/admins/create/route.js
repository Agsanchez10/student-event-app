import { NextResponse } from "next/server";
import { createCollegeAdmin, createSystemAdmin } from "@/services/userService";
import { verifySystemAdmin } from "@/lib/authMiddleware";

export async function POST(req) {
    try {
        // Verify SystemAdmin access
        const auth = await verifySystemAdmin(req);
        if (!auth.isValid) {
            return NextResponse.json({ message: auth.error }, { status: 403 });
        }

        const body = await req.json();
        
        // Validate required fields
        if (!body.firstName || !body.lastName || !body.email || !body.password) {
            return NextResponse.json(
                { message: "Missing required fields (firstName, lastName, email, password)" },
                { status: 400 }
            );
        }

        // Determine admin type (default to CollegeAdmin)
        const adminType = body.adminType || "CollegeAdmin";
        
        if (adminType === "SystemAdmin") {
            const admin = await createSystemAdmin(body);
            return NextResponse.json(
                { message: "SystemAdmin created successfully", admin },
                { status: 201 }
            );
        } else {
            const admin = await createCollegeAdmin(body);
            return NextResponse.json(
                { message: "CollegeAdmin created successfully", admin },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Error creating admin:", error);
        return NextResponse.json(
            { message: error.message || "Failed to create admin" },
            { status: 500 }
        );
    }
}
