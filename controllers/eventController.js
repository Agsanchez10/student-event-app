import { withDB } from "@/lib/mongodb";
import Event from "@/models/Event";



export const getEvents = withDB(async (request) => {
    const body = await request.json().catch(() => ({}));

    if (body.id) {
        const event = await Event.findById(body.id);
        if (!event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }
        return Response.json(event);
    }
    const events = await Event.find({});
    return Response.json(events);
});


export const createEvent = withDB(async (request) => {
    const body = await request.json();

    const lastID = await Event.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const event = await Event.create({ ...body, _id: newId });
    return Response.json(event);   
});

export const deleteEvent = withDB(async (request) => {
    const body = await request.json();
    const event = await Event.findByIdAndDelete(body.id);
    if (!event) {
        return Response.json({ error: "Event not found" }, { status: 404 });
    }
    return Response.json({ message: "Event deleted successfully" });
}); 

export const updateEvent = withDB(async (request) => {
    const body = await request.json();
    const event = await Event.findByIdAndUpdate(body.id, body, { returnDocument: "after" });
    if (!event) {
        return Response.json({ error: "Event not found" }, { status: 404 });
    }
    return Response.json(event);    
});