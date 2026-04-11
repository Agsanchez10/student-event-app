import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getClubChartersForUser, createClubCharter, getAllCharters } from "@/services/clubCharterService";
import User from "@/models/User";
import { withDB } from "@/lib/mongodb";

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});



 export async function GET(req) {
     const cookie = req.headers.get("cookie") || "";
     const tokenMatch = cookie.match(/token=([^;]+)/);
     const token = tokenMatch ? tokenMatch[1] : null;
     const user = await getCurrentUser(token);

     if (!user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const charters = await getClubChartersForUser(user._id);
     return NextResponse.json(charters, { status: 200 });
 }


export async function POST(req) {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    const user = await getCurrentUser(token);
    
    

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const charter = await createClubCharter({
        ...body,
        initiatorId: user._id,
        signatures: [user._id],
    });

    return NextResponse.json(charter, { status: 201 });
}
