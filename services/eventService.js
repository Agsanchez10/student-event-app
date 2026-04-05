import { withDB } from "@/lib/mongodb";
import Event from "@/models/Event";



export const getEvents = withDB(async () => {
    const events = await Event.find({});
    return events;
});

export const getEvent = withDB(async (eventId) => {     
    const event = await Event.findOne({ _id: Number(eventId) });
    if (!event) {
        throw new Error("404: Event not found");
    }
    return event;
    
});

export const createEvent = withDB(async (body) => {    
    const lastID = await Event.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const event = await Event.create({ ...body, _id: newId });
    return event;
});

export const deleteEvent = withDB(async (eventId) => {    
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
        throw new Error("404: Event not found");
    }
    return event;
}); 

export const updateEvent = withDB(async (eventId, body) => {
    const event = await Event.findByIdAndUpdate(eventId, body, { returnDocument: "after" });
    if (!event) {
        throw new Error("404: Event not found");
    }
    return event;
});

export const registerForEvent = withDB(async (eventId, userId) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new Error("404: Event not found");
    }

    // Check if user is already registered
    if (event.registrationList.includes(userId)) {
        throw new Error("User is already registered for this event");
    }

    // Add user to registration list
    event.registrationList.push(userId);
    await event.save();

    return event;
});

export const unregisterFromEvent = withDB(async (eventId, userId) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new Error("404: Event not found");
    }

    // Remove user from registration list
    event.registrationList = event.registrationList.filter(id => id !== userId);
    await event.save();

    return event;
});

export const getUserEvents = withDB(async (userId) => {
    const events = await Event.find({
        registrationList: { $in: [Number(userId)] }
    });
    return events;
});

export const getPublicEvents = withDB(async () => {
    const events = await Event.find({ visibility: "public" }).sort({ date: 1 });
    return events;
});