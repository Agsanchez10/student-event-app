

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import Event from "@/models/Event";
import Club from "@/models/Club";
import ClubCharterActivityClient from "./ClubCharterActivityClient";
import { getClubChartersForUser } from "@/services/clubCharterService";
import RegisteredEventsClient from "./RegisteredEventsClient";
import StudentDashboardClient from "./StudentDashboardClient";
import { getRecentAnnouncementsByClubIds } from "@/services/announcementService";


const ITEMS_PER_PAGE = 10;

const formatDate = (value) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const formatTime = (value) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

const getEventsByUserId = withDB(async (userId) => {
    
    return await Event.find({ registrationList: { $in: [Number(userId)] } }).sort({ date: 1 }).lean();
});

const getEventsByIds = withDB(async (ids) => {
    if (!ids?.length) return [];
    return await Event.find({ _id: { $in: ids } }).sort({ date: 1 }).lean();
});

const getClubsByIds = withDB(async (ids) => {
    if (!ids?.length) return [];
    return await Club.find({ _id: { $in: ids } }).lean();
});


export default async function Dashboard({ searchParams }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const rawUser = await getCurrentUser(token);
    const user = rawUser ? JSON.parse(JSON.stringify(rawUser)) : null;
    const params = await searchParams;

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
                <main className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Dashboard</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Please sign in to view your dashboard and role-based controls.</p>
                </main>
            </div>
        );
    }

    const role = user.role;
    const eventPage = parseInt(params?.eventPage ?? "1", 10) || 1;
    const clubPage = parseInt(params?.clubPage ?? "1", 10) || 1;
    const eventPageStart = (eventPage - 1) * ITEMS_PER_PAGE;
    const clubPageStart = (clubPage - 1) * ITEMS_PER_PAGE;
    const userCharters = await getClubChartersForUser(user._id);
    const charterPages = Math.max(1, Math.ceil(userCharters.length / ITEMS_PER_PAGE));    
    const charterPage = parseInt(params?.charterPage ?? "1", 10) || 1;    
    const charterPageStart = (charterPage - 1) * ITEMS_PER_PAGE;
    const studentEvents = await getEventsByUserId(user._id);
    const memberClubs = await getClubsByIds(user.clubMemberships || []);
    const ownedClubs = await getClubsByIds(user.ownedClubs || []);
    const recentAnnouncements = await getRecentAnnouncementsByClubIds(user.clubMemberships || []);
    const studentEventPages = Math.max(1, Math.ceil(studentEvents.length / ITEMS_PER_PAGE));
    const ownedClubPages = Math.max(1, Math.ceil(ownedClubs.length / ITEMS_PER_PAGE));
    const initiatedCharters = userCharters.filter((charter) => String(charter.initiatorId) === String(user._id));
    const signedCharters = userCharters.filter((charter) => String(charter.initiatorId) !== String(user._id));
    

    if (role === "ClubOwner" && ownedClubs.length === 1) {
        redirect(`/dashboard/clubs/${ownedClubs[0]._id}`);
    }

    return (
        <main className="flex-1 min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
            <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Dashboard</h1>
                    <p className="mt-2 text-base text-slate-700 sm:text-lg">Your personalized dashboard based on your role as {role}.</p>
                </div>

                {/* Account Details & Quick Actions */}
                <div className="mb-8 grid gap-6 lg:grid-cols-2">
                    {/* Account Details Card */}
                    <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                        <p className="text-sm uppercase tracking-[0.24em] font-semibold text-[#a33b3b]">Account Details</p>
                        <div className="mt-6 space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5f3a]">Name</p>
                                <p className="mt-2 text-lg font-semibold text-slate-950">{user.firstName} {user.lastName}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5f3a]">Email</p>
                                <p className="mt-2 text-sm text-slate-700">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5f3a]">Role</p>
                                <p className="mt-2 inline-flex rounded-full bg-[#e05c5c]/15 px-3 py-1 text-sm font-semibold text-[#a33b3b]">
                                    {role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                        <p className="text-sm uppercase tracking-[0.24em] font-semibold text-[#a33b3b]">Quick Actions</p>
                        <div className="mt-6 flex flex-col gap-3">
                            {role !== "ClubOwner" ? (
                                <>
                                    <Link href="/dashboard/events" className="rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]">
                                        Browse all events
                                    </Link>
                                    <Link href="/dashboard/clubs" className="rounded-full bg-[#d4975a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b8805f]">
                                        Browse all clubs
                                    </Link>
                                    <Link href="/dashboard/pending-charters" className="rounded-full bg-[#c8a882] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a68963]">
                                        View Pending Charters
                                    </Link>
                                </>
                            ) : null}
                            {role === "Admin" ? (
                                <>
                                    <Link href="/dashboard/admin/flagged-content" className="rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]">
                                        Flagged Content
                                    </Link>
                                    <Link href="/dashboard/new-club-charters" className="rounded-full bg-[#d4975a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b8805f]">
                                        New Club Charters
                                    </Link>
                                    <Link href="/dashboard/clubs" className="rounded-full bg-[#c8a882] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a68963]">
                                        Manage clubs
                                    </Link>
                                </>
                            ) : null}
                            {role === "ClubOwner" ? (
                                <p> *********************************************<br/> POSSIBLY REMOVE THIS <br/> *********************************************</p>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Student Section */}
                {role === "Student" ? (
                    <StudentDashboardClient
                        studentEvents={studentEvents}
                        memberClubs={memberClubs}
                        userCharters={userCharters}
                        recentAnnouncements={recentAnnouncements}
                        clubPage={clubPage}
                        eventPage={eventPage}
                        charterPage={charterPage}
                        currentUser={String(user._id)}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                ) : null}

                {role === "Admin" ? (
                    <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                        <h2 className="text-2xl font-semibold text-slate-950">Admin Dashboard</h2>
                        <p className="mt-2 text-slate-700">Quick access to the tools you need to moderate clubs, review flagged content, and approve new charters.</p>
                        <div className="mt-8 grid gap-6 sm:grid-cols-3">
                            <Link href="/dashboard/admin/flagged-content" className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center font-semibold text-slate-950 transition hover:bg-[#f8e7ce] hover:border-[#d4b18b]/60">
                                🚩 Flagged Content
                            </Link>
                            <Link href="/dashboard/new-club-charters" className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center font-semibold text-slate-950 transition hover:bg-[#f8e7ce] hover:border-[#d4b18b]/60">
                                📋 New Club Charters
                            </Link>
                            <Link href="/dashboard/clubs" className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center font-semibold text-slate-950 transition hover:bg-[#f8e7ce] hover:border-[#d4b18b]/60">
                                🏢 Manage Clubs
                            </Link>
                        </div>
                    </div>
                ) : null}

                {role === "ClubOwner" ? (
                    <div className="space-y-6">
                        <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                            <h2 className="text-2xl font-semibold text-slate-950">Clubs you manage</h2>
                            <p className="mt-2 text-slate-700">Navigate directly to club management for each club you own.</p>

                            {ownedClubs.length === 0 ? (
                                <div className="mt-6 rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center text-slate-700">
                                    You are not currently assigned to manage any clubs.
                                </div>
                            ) : (
                                <>
                                    <div className="mt-6 space-y-4">
                                        {ownedClubs.slice(clubPageStart, clubPageStart + ITEMS_PER_PAGE).map((club) => (
                                            <div key={club._id} className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-950">{club.name || "Unnamed Club"}</h3>
                                                        <p className="mt-2 text-sm text-slate-700">{club.description || "No description available."}</p>
                                                    </div>
                                                    <Link href={`/dashboard/clubs/${club._id}`} className="rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a] whitespace-nowrap">
                                                        Manage club
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {ownedClubPages > 1 ? (
                                        <div className="mt-6 flex items-center justify-between rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-4 text-sm text-slate-700">
                                            <Link
                                                href={`/dashboard?clubPage=${Math.max(1, clubPage - 1)}&eventPage=${eventPage}`}
                                                className={`rounded-full px-4 py-2 transition ${clubPage === 1 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"}`}
                                            >
                                                Previous
                                            </Link>
                                            <span className="font-semibold">Page {clubPage} of {ownedClubPages}</span>
                                            <Link
                                                href={`/dashboard?clubPage=${Math.min(ownedClubPages, clubPage + 1)}&eventPage=${eventPage}`}
                                                className={`rounded-full px-4 py-2 transition ${clubPage === ownedClubPages ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"}`}
                                            >
                                                Next
                                            </Link>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </main>
    );
}
