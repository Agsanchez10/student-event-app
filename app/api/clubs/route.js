import { NextResponse } from "next/server";
import { getClubs, createClub } from "@/services/clubService";

export async function GET(req) {
    const clubs = await getClubs();
    return NextResponse.json(clubs, { status: 200 });
}

export async function POST(req) {
    const body = await req.json();
    const club = await createClub(body);
    return NextResponse.json(club, { status : 201 });
}

