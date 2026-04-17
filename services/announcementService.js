import { withDB } from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import Club from "@/models/Club";

export const getClubAnnouncements = withDB(async (clubID) => {
    const announcements = await Announcement.find({ clubID: Number(clubID) })
        .sort({ createdAt: -1 })
        .lean();
    return announcements;
});

export const getRecentAnnouncementsByClubIds = withDB(async (clubIds) => {
    if (!clubIds?.length) return [];
    
    // Calculate date 2 weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const announcements = await Announcement.find({
        clubID: { $in: clubIds.map(id => Number(id)) },
        createdAt: { $gte: twoWeeksAgo }
    })
        .sort({ createdAt: -1 })
        .lean();
    
    return announcements;
});

export const createAnnouncement = withDB(async (clubID, data) => {
    const lastID = await Announcement.findOne().sort({ _id: -1 }).lean();
    const newId = lastID ? lastID._id + 1 : 1;

    const announcement = await Announcement.create({
        ...data,
        _id: newId,
        clubID: Number(clubID),
    });

    // Add to club's announcements
    await Club.findOneAndUpdate(
        { _id: Number(clubID) },
        { $addToSet: { announcements: newId } },
        { returnDocument: "after" }
    );

    return announcement.toObject();
});

export const updateAnnouncement = withDB(async (announcementID, data) => {
    const announcement = await Announcement.findOneAndUpdate(
        { _id: Number(announcementID) },
        data,
        { returnDocument: "after" }
    ).lean();

    if (!announcement) {
        throw new Error("Announcement not found");
    }

    return announcement;
});

export const deleteAnnouncement = withDB(async (announcementID, clubID) => {
    const announcement = await Announcement.findOneAndDelete({ _id: Number(announcementID) }).lean();

    if (!announcement) {
        throw new Error("Announcement not found");
    }

    // Remove from club's announcements
    await Club.findOneAndUpdate(
        { _id: Number(clubID) },
        { $pull: { announcements: Number(announcementID) } },
        { returnDocument: "after" }
    );

    return announcement;
});
