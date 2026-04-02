import { withDB } from "@/lib/mongodb";
import Club from "@/models/Club";

export const getClubs = withDB(async (request) => {
    const body = await request.json().catch(() => ({}));
    
    if (body.id) {
        const club = await Club.findById(body.id);
        if (!club) {
            return Response.json({ error: "Club not found" }, { status: 404 });
        }
        return Response.json(club);
    }
    const clubs = await Club.find({});
    return Response.json(clubs);
});

export const createClub = withDB(async (request) => {
    const body = await request.json();

    const lastID = await Club.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const club = await Club.create({ ...body, _id: newId });
    return Response.json(club);
});

export const deleteClub = withDB(async (request) => {
    const body = await request.json();
    const club = await Club.findByIdAndDelete(body.id);
    if (!club) {
        return Response.json({ error: "Club not found" }, { status: 404 });
    }   
    return Response.json({ message: "Club deleted successfully" });
});

export const updateClub = withDB(async (request) => {
    const body = await request.json();
    const club = await Club.findByIdAndUpdate(body.id, body, { returnDocument: "after" });
    if (!club) {
        return Response.json({ error: "Club not found" }, { status: 404 });
    }  
    return Response.json(club);
});