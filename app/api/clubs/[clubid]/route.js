import { NextResponse } from "next/server";
import { getClub, deleteClub, updateClub } from "@/services/clubService";


export async function GET(req, { params }) {
    const { clubid } = await params;
    try {
        const club = await getClub(clubid);
        if (club.error) {
            return NextResponse.json({ error: club.error }, { status: 404 });
        }
        return NextResponse.json(club, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred while fetching the club" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { clubid } = await params;
    try { 
        const result = await deleteClub(clubid);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while deleting the club" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {    
    const { clubid } = await params;
    const body = await req.json();

    try {
        const result = await updateClub(clubid, body);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while updating the club" }, { status: 500 });
    }   
    
}