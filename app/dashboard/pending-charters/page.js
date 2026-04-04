import { getPendingChartersForAdmin } from "@/services/clubCharterService";
import PendingChartersClient from "./PendingChartersClient";
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

export default async function PendingChartersPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await getCurrentUser(token);
    const charters = await getPendingChartersForAdmin();

    return <PendingChartersClient charters={charters} currentUser={user} />;
}
