import { NextResponse } from "next/server";
import { getUser, deleteUser, updateUser } from "@/services/userService";


export async function GET(req, { params }) {
    const { userid } = await params;
    try {
        const user = await getUser(userid);
        if (user.error) {
            return NextResponse.json({ error: user.error }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred while fetching the user" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { userid } = await params;
    try { 
        const result = await deleteUser(userid);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while deleting the user" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {    
    const { userid } = await params;
    const body = await req.json();

    try {
        const result = await updateUser(userid, body);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error.message.includes("404")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        return NextResponse.json({ error: "An error occurred while updating the user" }, { status: 500 });
    }   
    
}