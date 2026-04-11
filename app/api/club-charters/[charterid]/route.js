import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { deleteClubCharter } from "@/services/clubCharterService";
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

export async function DELETE(req, { params }) {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    const user = await getCurrentUser(token);

    const paramData = await params;
    const charterId = paramData.charterid;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await deleteClubCharter(charterId, user._id);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        const message = error?.message || "Unable to delete charter.";
        const status = message.includes("Unauthorized") ? 403 : message.includes("not found") ? 404 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
