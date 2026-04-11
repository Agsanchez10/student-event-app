import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
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
    const user = rawUser ? JSON.parse(JSON.stringify(rawUser)) : null;

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
                <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Club Management</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Please sign in to access club management.</p>
                </main>
            </div>
        );
    }

    const isAdmin = user.role === "Admin";

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
                <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Access Denied</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">
                        You do not have permission to access this page. Only College Admins can manage clubs.
                    </p>
                </main>
            </div>
        );
    }

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
