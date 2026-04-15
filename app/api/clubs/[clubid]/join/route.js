// API call to join a student to a club

import { NextResponse } from "next/server";
import { joinClub } from "@/services/clubService";

export async function POST(req, { params }) {
    const { clubid } = await params;
    const body = await req.json();
    const { studentId } = body;
    if (!studentId) {
        return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }
    try {
        const result = await joinClub(clubid, studentId);
        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }   
        return NextResponse.json({ message: "Successfully joined the club" }, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while joining the club" }, { status: 500 });
    }
}