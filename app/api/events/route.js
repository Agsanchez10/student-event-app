import { NextResponse } from "next/server";
import { getEvents, createEvent } from "@/services/eventService";

export async function GET(req) {
    const events = await getEvents();
    return NextResponse.json(events, { status: 200 });
}

export async function POST(req) {
    const body = await req.json();
    const event = await createEvent(body);
    return NextResponse.json(event, { status : 201 });
}

