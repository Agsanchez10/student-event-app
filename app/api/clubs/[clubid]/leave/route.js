import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

export async function POST(request, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await getCurrentUser(token);

        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const resolve_params = await params;
        const clubId = Number(resolve_params.clubid);

        // Check if user is a member of the club
        if (!user.clubMemberships || !user.clubMemberships.includes(clubId)) {
            return new Response(JSON.stringify({ error: "Not a member of this club" }), { status: 400 });
        }

        // Remove the club from user's clubMemberships
        user.clubMemberships = user.clubMemberships.filter((id) => id !== clubId);
        await user.save();

        return new Response(JSON.stringify({ message: "Successfully left the club" }), { status: 200 });
    } catch (error) {
        console.error("Error leaving club:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
