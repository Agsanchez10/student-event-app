import { withDB } from "@/lib/mongodb";
import Club from "@/models/Club";
import Event from "@/models/Event";
import Announcement from "@/models/Announcement";

// return all clubs
export const getClubs = withDB(async () => {
    const clubs = await Club.find({});
    return clubs;
});

// find and return a club with the specified id
export const getClub = withDB(async (clubid) => {
    const club = await Club.findOne({ _id: Number(clubid) });
    if (!club) {
      throw new Error("404: Club not found");
    }
    return club;       
});

export const createClub = withDB(async (body) => {
    const lastID = await Club.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const club = await Club.create({ ...body, _id: newId });
    return club;
});

export const deleteClub = withDB(async (clubid) => {
    const club = await Club.findByIdAndDelete(clubid);
    if (!club) {
        throw new Error("404: Club not found");
    }
    
    // Delete all events associated with this club
    await Event.deleteMany({ clubId: Number(clubid) });
    
    // Delete all announcements associated with this club
    await Announcement.deleteMany({ clubID: Number(clubid) });
    
    return club;
});

export const updateClub = withDB(async (clubid, body) => {
    const club = await Club.findByIdAndUpdate(clubid, body, { new: true });
    if (!club) {
        throw new Error("404: Club not found");
    }
    return club;
});


