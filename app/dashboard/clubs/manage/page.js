import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import ClubCharter from "@/models/ClubCharter";
import ClubsManagementClient from "./ClubsManagementClient";

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

const getAllClubs = withDB(async () => {
    return await Club.find({}).sort({ createdAt: -1 }).lean();
});

const getPendingCharters = withDB(async () => {
    return await ClubCharter.find({ status: "submitted" }).sort({ createdAt: -1 }).lean();
});

export default async function ClubsManagementPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const rawUser = await getCurrentUser(token);
    const user = rawUser ? {
        _id: rawUser._id,
        ...JSON.parse(JSON.stringify(rawUser))
    } : null;

    if (!user) redirect("/login");

    const isAdmin = user.role === "CollegeAdmin";

    if (!isAdmin) redirect("/dashboard");

    const clubs = await getAllClubs();
    const pendingCharters = await getPendingCharters();

    return (
        <ClubsManagementClient
            clubs={clubs}
            pendingCharters={pendingCharters}
            currentUserId={user._id}
            isAdmin={isAdmin}
        />
    );
}
