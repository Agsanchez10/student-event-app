import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";
import Event from "@/models/Event";
import RegisteredEventsListClient from "./RegisteredEventsListClient";

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
    return await Event.find({ registrationList: { $in: [Number(userId)] } })
        .sort({ date: 1 })
        .lean();
});

const normalizeEvent = (event) => ({
    _id: event._id,
    name: event.name,
    description: event.description,
    date: event.date ? (typeof event.date === 'string' ? event.date : event.date.toISOString()) : null,
    location: event.location,
    ownerId: event.ownerId,
    registrationList: event.registrationList,
    createdAt: event.createdAt ? (typeof event.createdAt === 'string' ? event.createdAt : event.createdAt.toISOString()) : null,
});

export default async function RegisteredEventsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const rawUser = await getCurrentUser(token);
    const user = rawUser ? {
        _id: rawUser._id,
        ...JSON.parse(JSON.stringify(rawUser))
    } : null;

    if (!user) {
        redirect("/login");
        return null;
    }

    const registeredEvents = await getEventsByUserId(user._id);
    const normalizedEvents = registeredEvents.map(normalizeEvent);

    return (
        <RegisteredEventsListClient 
            registeredEvents={normalizedEvents} 
            currentUser={user}
        />
    );
}
