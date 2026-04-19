import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import ClubCharter from "@/models/ClubCharter";
import User, { CollegeAdmin } from "@/models/User";

export async function POST(req) {
    try {
        const { charterId } = await req.json();

        if (!charterId) {
            return new Response(
                JSON.stringify({ error: "Charter ID is required" }),
                { status: 400 }
            );
        }

        // Verify authentication and role
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await connectDB();

        const user = await User.findById(decoded.id);
        if (!user || (user.role !== "CollegeAdmin" && user.role !== "SystemAdmin")) {
            return new Response(
                JSON.stringify({ error: "Only admins can reject charters" }),
                { status: 403 }
            );
        }

        // Update charter status to rejected
        const charter = await ClubCharter.findByIdAndUpdate(
            Number(charterId),
            { status: "rejected" },
            { new: true }
        );

        if (!charter) {
            return new Response(
                JSON.stringify({ error: "Charter not found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, charter }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error rejecting charter:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
