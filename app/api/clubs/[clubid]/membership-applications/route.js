import { getMembershipApplications, createMembershipApplication } from "@/services/membershipApplicationService";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
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

export async function GET(request, { params }) {
    try {
        const resolve_params = await params;
        const clubID = resolve_params.clubid;
        const applications = await getMembershipApplications(clubID);
        return new Response(JSON.stringify(applications), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await getCurrentUser(token);

        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const resolve_params = await params;
        const clubID = Number(resolve_params.clubid);

        const application = await createMembershipApplication(
            clubID,
            user._id,
            `${user.firstName} ${user.lastName}`,
            user.email
        );

        return new Response(JSON.stringify(application), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

