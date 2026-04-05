import { getEvents } from "@/services/eventService";
import EventListClient from "./EventListClient";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { withDB } from "@/lib/mongodb";
import { redirect } from "next/navigation";


const normalizeEvent = (event) => ({
    _id: event._id,
    name: event.name,
    description: event.description,
    date: event.date ? event.date.toISOString() : null,
    location: event.location,
    ownerId: event.ownerId,
    registrationList: event.registrationList,
    createdAt: event.createdAt ? event.createdAt.toISOString() : null,
});

const getCurrentUser = withDB(async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findOne({ _id: Number(decoded.id) });
    } catch (error) {
        return null;
    }
});

export default async function EventList() {
    const events = await getEvents();
    const eventsData = events.map(normalizeEvent);

    // Get current user
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? await getCurrentUser(token) : null;
    const plainUser = user ? JSON.parse(JSON.stringify(user)) : null;

    if (!user) {
        redirect("/login");
        return null;
    }

    return <EventListClient events={eventsData} currentUser={plainUser} />;
}
