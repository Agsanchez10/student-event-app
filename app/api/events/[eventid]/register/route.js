import { NextResponse } from "next/server";
import { registerForEvent, unregisterFromEvent } from "@/services/eventService";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const getUserFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
};

export async function POST(req, { params }) {
    const { eventid } = await params;

    try {
        // Get user from token
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = getUserFromToken(token);

        // Register user for event
        const event = await registerForEvent(eventid, user.id);
        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error.message.includes("already registered")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "An error occurred while registering for the event" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { eventid } = await params;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if(!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = getUserFromToken(token);

        // Unregister user from event
        const event = await unregisterFromEvent(eventid, user.id);
        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while unregistering from the event" }, { status: 500 });
    }
}