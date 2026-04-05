import { NextResponse } from "next/server";
import { createCollegeAdmin } from "@/services/userService";

export async function POST(req) {
    try {
        const body = await req.json();
        
        // Validate required fields
        if (!body.firstName || !body.lastName || !body.email || !body.password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const admin = await createCollegeAdmin(body);
        return NextResponse.json(admin, { status: 201 });
    } catch (error) {
        console.error("Error creating college admin:", error);
        return NextResponse.json(
            { message: error.message || "Failed to create admin" },
            { status: 500 }
        );
    }
}
