

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
    const studentEventPages = Math.max(1, Math.ceil(studentEvents.length / ITEMS_PER_PAGE));
    const ownedClubPages = Math.max(1, Math.ceil(ownedClubs.length / ITEMS_PER_PAGE));
    const initiatedCharters = userCharters.filter((charter) => String(charter.initiatorId) === String(user._id));
    const signedCharters = userCharters.filter((charter) => String(charter.initiatorId) !== String(user._id));
    

    if (role === "ClubOwner" && ownedClubs.length === 1) {
        redirect(`/dashboard/clubs/${ownedClubs[0]._id}`);
    }

    return (
        <div className="h-bg-slate-50 py-10 dark:bg-slate-950">
            <main className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
                <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Dashboard</h1>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Your personalized dashboard based on your role as {role}.</p>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Account details</h2>
                        <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            <p><span className="font-semibold text-slate-900 dark:text-white">Name:</span> {user.firstName} {user.lastName}</p>
                            <p><span className="font-semibold text-slate-900 dark:text-white">Email:</span> {user.email}</p>
                            <p><span className="font-semibold text-slate-900 dark:text-white">Role:</span> {role}</p>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quick actions</h2>
                        <div className="mt-5 flex flex-col gap-3">
                            <Link href="/dashboard/events" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">Browse all events</Link>
                            <Link href="/dashboard/pending-charters" className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">View Pending Charters</Link>
                            {role === "Admin" ? (
                                <>
                                    <Link href="/dashboard/flags" className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">Flagged Content</Link>
                                    <Link href="/dashboard/new-club-charters" className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">New Club Charters</Link>
                                    <Link href="/dashboard/clubs" className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Manage clubs</Link>
                                </>
                            ) : null}
                            {role === "ClubOwner" ? (
                                <Link href="/dashboard/clubs" className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">View clubs you manage</Link>
                            ) : null}
                        </div>
                    </div>
                </section>

                {role === "Student" ? (
                    <section className="space-y-6">
                        <RegisteredEventsClient
                            registeredEvents={studentEvents}
                            clubPage={clubPage}
                            eventPage={eventPage}
                            currentUser={String(user._id)}
                        />

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Clubs you belong to</h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View the clubs where you are a member.</p>
                            </div>

                            {memberClubs.length === 0 ? (
                                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">You are not a member of any clubs yet.</div>
                            ) : (
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {memberClubs.slice(clubPageStart, clubPageStart + ITEMS_PER_PAGE).map((club) => (
                                        <div key={club._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{club.name || "Unnamed Club"}</h3>
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{club.description || "No description available."}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <ClubCharterActivityClient
                            charters={userCharters}
                            currentPage={charterPage}
                            itemsPerPage={ITEMS_PER_PAGE}
                            currentUserId={String(user._id)}
                        />
                    </section>
                ) : null}

                {role === "Admin" ? (
                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Admin controls</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Quick access to the tools you need to moderate clubs, review flagged content, and approve new charters.</p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <Link href="/dashboard/flags" className="rounded-3xl bg-amber-500 px-4 py-5 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-400">Flagged Content</Link>
                            <Link href="/dashboard/new-club-charters" className="rounded-3xl bg-cyan-500 px-4 py-5 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">New Club Charters</Link>
                            <Link href="/dashboard/clubs" className="rounded-3xl bg-emerald-500 px-4 py-5 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Manage Clubs</Link>
                        </div>
                    </section>
                ) : null}

                {role === "ClubOwner" ? (
                    <section className="space-y-6">
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Clubs you manage</h2>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Navigate directly to club management for each club you own.</p>
                                </div>
                            </div>

                            {ownedClubs.length === 0 ? (
                                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">You are not currently assigned to manage any clubs.</div>
                            ) : (
                                <>
                                    <div className="mt-6 space-y-4">
                                        {ownedClubs.slice(clubPageStart, clubPageStart + ITEMS_PER_PAGE).map((club) => (
                                            <div key={club._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{club.name || "Unnamed Club"}</h3>
                                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{club.description || "No description available."}</p>
                                                    </div>
                                                    <Link href={`/dashboard/clubs/${club._id}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">Manage club</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {ownedClubPages > 1 ? (
                                        <div className="mt-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                                            <Link
                                                href={`/dashboard?clubPage=${Math.max(1, clubPage - 1)}&eventPage=${eventPage}`}
                                                className={`rounded-full px-4 py-2 transition ${clubPage === 1 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"}`}
                                            >
                                                Previous
                                            </Link>
                                            <span>Page {clubPage} of {ownedClubPages}</span>
                                            <Link
                                                href={`/dashboard?clubPage=${Math.min(ownedClubPages, clubPage + 1)}&eventPage=${eventPage}`}
                                                className={`rounded-full px-4 py-2 transition ${clubPage === ownedClubPages ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"}`}
                                            >
                                                Next
                                            </Link>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </section>
                ) : null}
            </main>
        </div>
    );
}
