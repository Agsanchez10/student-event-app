import { withDB } from "@/lib/mongodb";
import Club from "@/models/Club";
import Event from "@/models/Event";
import Announcement from "@/models/Announcement";
import User from "@/models/User";


// return all clubs
export const getClubs = withDB(async () => {
    const clubs = await Club.find({}).lean();
    return clubs;
});

// find and return a club with the specified id
export const getClub = withDB(async (clubid) => {
    const club = await Club.findOne({ _id: Number(clubid) }).lean();
    if (!club) {
      throw new Error("404: Club not found");
    }
    return club;       
});

// create a new club with the provided details
export const createClub = withDB(async (body) => {
    const lastID = await Club.findOne().sort({ _id: -1 }).lean();
    const newId = lastID ? lastID._id + 1 : 1;

    const club = await Club.create({ ...body, _id: newId });
    return club.toObject();
});

// delete a club and all associated events and announcements
export const deleteClub = withDB(async (clubid) => {
    const club = await Club.findOneAndDelete({ _id: Number(clubid) }).lean();
    if (!club) {
        throw new Error("404: Club not found");
    }
    
    // Delete all events associated with this club
    await Event.deleteMany({ clubId: Number(clubid) });
    
    // Delete all announcements associated with this club
    await Announcement.deleteMany({ clubID: Number(clubid) });
    
    return club;
});

// update a club's details
export const updateClub = withDB(async (clubid, body) => {
    const club = await Club.findOneAndUpdate({ _id: Number(clubid) }, body, { returnDocument: "after" }).lean();
    if (!club) {
        throw new Error("404: Club not found");
    }
    return club;
});

// add a student to a club's member list
export const joinClub = withDB(async (clubid, studentId) => {
    const club = await Club.findOneAndUpdate(
        { 
            _id: Number(clubid),
            memberList: { $ne: Number(studentId) }
        },
        { $push: { memberList: Number(studentId) } },
        { returnDocument: "after" }
    ).lean();
    
    if (!club) {
        const existingClub = await Club.findOne({ _id: Number(clubid) }).lean();
        if (!existingClub) {
            throw new Error("404: Club not found");
        }
        if (existingClub.memberList.includes(Number(studentId))) {
            return { error: "User is already a member of this club" };
        }
        throw new Error("Failed to join club");
    }
    
    // Also update user's club memberships
    await User.findOneAndUpdate(
        { _id: Number(studentId) },
        { $push: { clubMemberships: Number(club._id) } },
        { returnDocument: "after" }
    );
    
    return club;
});

// Remove a student from a club's member list
export const leaveClub = withDB(async (clubid, studentId) => {
    const club = await Club.findOneAndUpdate(
        { 
            _id: Number(clubid),
            memberList: Number(studentId)
        },
        { $pull: { memberList: Number(studentId) } },
        { returnDocument: "after" }
    ).lean();
    
    if (!club) {
        const existingClub = await Club.findOne({ _id: Number(clubid) }).lean();
        if (!existingClub) {
            throw new Error("404: Club not found");
        }
        if (!existingClub.memberList.includes(Number(studentId))) {
            return { error: "User is not a member of this club" };
        }
        throw new Error("Failed to leave club");
    }
    
    // Also update user's club memberships
    await User.findOneAndUpdate(
        { _id: Number(studentId) },
        { $pull: { clubMemberships: Number(club._id) } },
        { returnDocument: "after" }
    );
    
    return club;
});

