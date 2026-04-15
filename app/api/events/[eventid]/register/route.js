// API call to register a student for an event
import { NextResponse } from "next/server";
import { registerForEvent } from "@/services/eventService";

export async function POST(req, { params }) {
    const { eventid } = await params;
    const body = await req.json();
    const { studentId } = body;
    if (!studentId) {
        return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }
    try {
        const result = await registerForEvent(eventid, studentId);
        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }   
        return NextResponse.json({ message: "Successfully registered for event" }, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while registering for the event" }, { status: 500 });
    }
}