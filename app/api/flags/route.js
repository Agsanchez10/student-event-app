import { NextResponse } from "next/server";
import { getFlags, createFlag } from "@/services/flagService";

export async function GET(req) {
    const flags = await getFlags();
    return NextResponse.json(flags, { status: 200 });
}

export async function POST(req) {
    const body = await req.json();
    const flag = await createFlag(body);
    return NextResponse.json(flag, { status : 201 });
}

