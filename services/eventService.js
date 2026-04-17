import { withDB } from "@/lib/mongodb";
import Event from "@/models/Event";



export const getEvents = withDB(async () => {
    const events = await Event.find({}).lean();
    return events;
});

export const getEvent = withDB(async (eventId) => {     
    const event = await Event.findOne({ _id: Number(eventId) }).lean();
    if (!event) {
        throw new Error("404: Event not found");
    }
    return event;
    
});

export const createEvent = withDB(async (body) => {    
    const lastID = await Event.findOne().sort({ _id: -1 }).lean();
    const newId = lastID ? lastID._id + 1 : 1;

    const event = await Event.create({ ...body, _id: newId });
    return event.toObject();
});

export const deleteEvent = withDB(async (eventId) => {    
    const event = await Event.findOneAndDelete({ _id: Number(eventId) }).lean();
    if (!event) {
        throw new Error("404: Event not found");
    }
    return event;
}); 

export const updateEvent = withDB(async (eventId, body) => {
    const event = await Event.findOneAndUpdate({ _id: Number(eventId) }, body, { returnDocument: "after" }).lean();
    if (!event) {
        throw new Error("404: Event not found");
    }
    return event;
});

export const registerForEvent = withDB(async (eventId, userId) => {
    // Use updateOne directly to avoid fetching and saving which triggers middleware
    const result = await Event.findOneAndUpdate(
        { 
            _id: Number(eventId),
            registrationList: { $ne: Number(userId) }
        },
        { $push: { registrationList: Number(userId) } },
        { returnDocument: "after" }
    ).lean();
    
    if (!result) {
        // Check if it's because user is already registered
        const event = await Event.findOne({ _id: Number(eventId) }).lean();
        if (!event) {
            throw new Error("404: Event not found");
        }
        if (event.registrationList.includes(Number(userId))) {
            throw new Error("User is already registered for this event");
        }
        throw new Error("Failed to register for event");
    }

    return result;
});

export const unregisterFromEvent = withDB(async (eventId, userId) => {
    const result = await Event.findOneAndUpdate(
        { _id: Number(eventId) },
        { $pull: { registrationList: Number(userId) } },
        { returnDocument: "after" }
    ).lean();
    
    if (!result) {
        throw new Error("404: Event not found");
    }

    return result;
});

export const getUserEvents = withDB(async (userId) => {
    const events = await Event.find({
        registrationList: { $in: [Number(userId)] }
    }).lean();
    return events;
});

export const getPublicEvents = withDB(async () => {
    const events = await Event.find({ visibility: "public" }).sort({ date: 1 }).lean();
    return events;
});