import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import Announcement from "@/models/Announcement";
import Event from "@/models/Event";
import MembershipApplication from "@/models/MembershipApplication";
import { getClub } from "@/services/clubService";
import ClubDashboardClient from "./ClubDashboardClient";

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

const getClubAnnouncements = withDB(async (clubID) => {
    const announcements = await Announcement.find({ clubID: Number(clubID) })
        .sort({ createdAt: -1 })
        .lean();
    return announcements;
});

const getClubEvents = withDB(async (clubId) => {
    const events = await Event.find({ clubId: Number(clubId) })
        .sort({ date: 1 })
        .lean();
    return events;
});

const getMembershipApplications = withDB(async (clubID) => {
    const applications = await MembershipApplication.find({
        clubID: Number(clubID),
        status: "pending",
    }).lean();
    return applications;
});

export default async function ClubOwnerManagement({ params }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const rawUser = await getCurrentUser(token);
    const user = rawUser ? {
        _id: rawUser._id,
        ...JSON.parse(JSON.stringify(rawUser))
    } : null;

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
                <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Club Management</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Please sign in to access the club dashboard.</p>
                </main>
            </div>
        );
    }

    const resolve_params = await params;
    const clubId = Number(resolve_params.clubid);
    const clubInfo = await getClub(clubId);
    const club = JSON.parse(JSON.stringify(clubInfo));

    // Check if user is admin of this club
    const isAdmin = String(club.ownerID) === String(user._id); 

    // Check if user is a member of this club
    const isMember = user.clubMemberships && user.clubMemberships.includes(clubId);

    // Allow access if user is admin or member
    if (user.role !== "CollegeAdmin" && !isMember && !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
                <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Access Denied</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">
                        You do not have permission to access this club.
                    </p>
                </main>
            </div>
        );
    }

    const announcements = await getClubAnnouncements(clubId);
    const events = await getClubEvents(clubId);
    const membershipApplications = await getMembershipApplications(clubId);

    return (
        <ClubDashboardClient
            club={club}
            currentUserId={user._id}
            userRole={user.role}
            isAdmin={isAdmin}
            isMember={isMember}
            announcements={announcements}
            events={events}
            membershipApplications={membershipApplications}
        />
    );
}
