import { NextResponse } from "next/server";
import { getEvent, deleteEvent, updateEvent } from "@/services/eventService";


export async function GET(req, { params }) {
    const { eventid } = await params;
    try {
        const event = await getEvent(eventid);
        if (event.error) {
            return NextResponse.json({ error: event.error }, { status: 404 });
        }
        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred while fetching the event" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { eventid } = await params;
    try { 
        const result = await deleteEvent(eventid);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while deleting the event" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {    
    const { eventid } = await params;
    const body = await req.json();

    try {
        const result = await updateEvent(eventid, body);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while updating the event" }, { status: 500 });
    }   
    
}