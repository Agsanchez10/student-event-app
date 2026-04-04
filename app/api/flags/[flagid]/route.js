import { NextResponse } from "next/server";
import { getFlag, deleteFlag, updateFlag } from "@/services/flagService";


export async function GET(req, { params }) {
    const { flagid } = await params;
    try {
        const flag = await getFlag(flagid);
        if (flag.error) {
            return NextResponse.json({ error: flag.error }, { status: 404 });
        }
        return NextResponse.json(flag, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred while fetching the flag" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { flagid } = await params;
    try { 
        const result = await deleteFlag(flagid);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while deleting the flag" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {    
    const { flagid } = await params;
    const body = await req.json();

    try {
        const result = await updateFlag(flagid, body);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while updating the flag" }, { status: 500 });
    }   
    
}