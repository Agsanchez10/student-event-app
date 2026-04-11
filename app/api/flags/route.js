import { NextResponse } from "next/server";
import { getFlags, getUnresolvedFlags, createFlag } from "@/services/flagService";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const unresolved = searchParams.get("unresolved");
    
    try {
        const flags = unresolved === "true" ? await getUnresolvedFlags() : await getFlags();
        return NextResponse.json(flags, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred while fetching flags" }, { status: 500 });
    }
}

export async function POST(req) {
    const body = await req.json();
    const flag = await createFlag(body);
    return NextResponse.json(flag, { status : 201 });
}

