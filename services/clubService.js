import { withDB } from "@/lib/mongodb";
import Club from "@/models/Club";
import Event from "@/models/Event";
import Announcement from "@/models/Announcement";
import User from "@/models/User";


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

// create a new club with the provided details
export const createClub = withDB(async (body) => {
    const lastID = await Club.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const club = await Club.create({ ...body, _id: newId });
    return club;
});

// delete a club and all associated events and announcements
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

// update a club's details
export const updateClub = withDB(async (clubid, body) => {
    const club = await Club.findByIdAndUpdate(clubid, body, { new: true });
    if (!club) {
        throw new Error("404: Club not found");
    }
    return club;
});

// add a student to a club's member list
export const joinClub = withDB(async (clubid, studentId) => {
    const club = await Club.findById(clubid);
    const user = await User.findById(studentId);
    if (!club) {
        throw new Error("404: Club not found");
    }   

    // Check if user is already a member
    if (club.memberList.includes(studentId)) {
        return { error: "User is already a member of this club" };
    }

    // Add user to members list
    club.memberList.push(studentId);
    user.clubMemberships.push(club._id);
    await club.save();
    await user.save();
    return club;
});

// Remove a student from a club's member list
export const leaveClub = withDB(async (clubid, studentId) => {
    const club = await Club.findById(clubid);
    const user = await User.findById(studentId);
    if (!club) {
        throw new Error("404: Club not found");
    }

    // Check if user is a member
    if (!club.memberList.includes(studentId)) {
        return { error: "User is not a member of this club" };
    }

    // Remove user from members list
    club.memberList = club.memberList.filter((id) => id !== studentId);   
    user.clubMemberships = user.clubMemberships.filter((id) => id !== club._id);
    await club.save();
    await user.save();
    return club;
});

