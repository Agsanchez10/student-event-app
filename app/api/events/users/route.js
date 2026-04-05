import { NextResponse } from "next/server";
import { getUserEvents } from "@/services/eventService";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId query parameter is required" },
                { status: 400 }
            );
        }

        const events = await getUserEvents(userId);
        return NextResponse.json(events, { status: 200 });
    } catch (error) {
        console.error("Error fetching user events:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
