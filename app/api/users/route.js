import { NextResponse } from "next/server";
import { getUsers, createUser } from "@/services/userService";

export async function GET(req) {
    const users = await getUsers();
    return NextResponse.json(users, { status: 200 });
}

export async function POST(req) {
    const body = await req.json();
    const user = await createUser(body);
    return NextResponse.json(user, { status : 201 });
}

