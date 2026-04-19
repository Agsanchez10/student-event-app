import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import StudentDashboardClient from "./StudentDashboardClient";

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

const getStudentClubs = withDB(async (clubIds) => {
    if (!clubIds || clubIds.length === 0) return [];
    return await Club.find({ _id: { $in: clubIds } }).lean();
});

export default async function StudentDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const rawUser = await getCurrentUser(token);
    const user = rawUser ? {
        _id: rawUser._id,
        ...JSON.parse(JSON.stringify(rawUser))
    } : null;

    if (!user) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10">
                <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-[1.8rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                        <h1 className="text-3xl font-semibold text-slate-950">Student Dashboard</h1>
                        <p className="mt-3 text-slate-600">
                            Please sign in to access the student dashboard.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    const clubs = await getStudentClubs(user.clubMemberships);
    const clubs_json = JSON.parse(JSON.stringify(clubs));

    return <StudentDashboardClient user={user} clubs={clubs_json} />;
}
