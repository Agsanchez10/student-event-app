import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
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

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-semibold text-slate-950">Welcome, {user.firstName}!</h1>
                        <p className="mt-2 text-slate-700">Manage your clubs and explore events.</p>
                    </div>
                    <Link
                        href="/dashboard/clubs"
                        className="rounded-full bg-[#d4b18b] text-white px-6 py-3 font-semibold transition hover:bg-[#c8a882]"
                    >
                        🔍 Find Clubs
                    </Link>
                </div>

                {/* My Clubs Section */}
                <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                    <h2 className="text-2xl font-semibold text-slate-950">My Clubs</h2>
                    <p className="mt-2 text-slate-700">Clubs you are a member of</p>

                    {clubs_json.length === 0 ? (
                        <div className="mt-6 rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center text-slate-700">
                            <p className="mb-4">You are not a member of any clubs yet.</p>
                            <Link href="/dashboard/clubs" className="inline-block rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]">
                                Explore Clubs
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {clubs_json.map((club) => (
                                <Link
                                    key={club._id}
                                    href={`/dashboard/clubs/${club._id}`}
                                    className="group rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10 transition hover:bg-[#f8e7ce] hover:border-[#d4b18b]/60 hover:shadow-md hover:shadow-[#b9955d]/20"
                                >
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-slate-950 group-hover:text-[#a33b3b] transition">
                                            {club.name}
                                        </h3>
                                        <p className="text-sm text-slate-700 line-clamp-2">
                                            {club.description || "No description available"}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#e05c5c]">
                                            View Club
                                            <span className="transition group-hover:translate-x-1">→</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
