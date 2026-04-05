import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import ClubCharterForm from "./ClubCharterForm";
import Link from "next/link";
import { redirect} from "next/navigation";

const getCurrentUser = withDB(async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

export default async function ClubCharterPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await getCurrentUser(token);

    if(!user) {        
        redirect("/login");
        return null;
    }

    return <ClubCharterForm user={user} />;
}