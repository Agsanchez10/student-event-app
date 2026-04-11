import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

const getClub = withDB(async (clubId) => {
    return await Club.findOne({ _id: Number(clubId) });
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
        const club = await getClub(clubId);

        if (!club) {
            return new Response(JSON.stringify({ error: "Club not found" }), { status: 404 });
        }

        if (club.isPrivate) {
            return new Response(JSON.stringify({ error: "Cannot directly join private clubs. Please submit an application." }), { status: 400 });
        }

        // Check if user is already a member
        if (club.memberList && club.memberList.includes(user._id)) {
            return new Response(JSON.stringify({ error: "Already a member of this club" }), { status: 400 });
        }

        // Add user to club memberList
        const updatedClub = await Club.findByIdAndUpdate(
            clubId,
            { $addToSet: { memberList: Number(user._id) } },
            { returnDocument: "after" }
        );

        // Add club to user's clubMemberships
        await User.findByIdAndUpdate(
            user._id,
            { $push: { clubMemberships: { $each: [Number(clubId)] } } },
            { returnDocument: "after", strict: false }
        );;

        return new Response(JSON.stringify({ message: "Successfully joined the club", club: updatedClub }), { status: 200 });
    } catch (error) {
        console.error("Error joining club:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
