import { withDB } from "@/lib/mongodb";
import MembershipApplication from "@/models/MembershipApplication";
import Club from "@/models/Club";

export const getMembershipApplications = withDB(async (clubID) => {
    const applications = await MembershipApplication.find({
        clubID: Number(clubID),
        status: "pending",
    }).lean();
    return applications;
});

export const createMembershipApplication = withDB(async (clubID, userId, userName, userEmail) => {
    const lastID = await MembershipApplication.findOne().sort({ _id: -1 }).lean();
    const newId = lastID ? lastID._id + 1 : 1;

    const application = await MembershipApplication.create({
        _id: newId,
        clubID: Number(clubID),
        userId: Number(userId),
        userName,
        userEmail,
        status: "pending",
    });

    // Add to club's membership applications
    await Club.findOneAndUpdate(
        { _id: Number(clubID) },
        { $addToSet: { membershipApplications: newId } },
        { returnDocument: "after" }
    );

    return application.toObject();
});

export const approveMembershipApplication = withDB(async (applicationID, userId, clubID) => {
    const application = await MembershipApplication.findOneAndUpdate(
        { _id: Number(applicationID) },
        { status: "approved" },
        { returnDocument: "after" }
    ).lean();

    if (!application) {
        throw new Error("Application not found");
    }

    // Add user to club membership
    await Club.findOneAndUpdate(
        { _id: Number(clubID) },
        { $addToSet: { memberList: Number(userId) } },
        { returnDocument: "after" }
    );

    return application;
});

export const rejectMembershipApplication = withDB(async (applicationID, clubID) => {
    const application = await MembershipApplication.findOneAndDelete({ _id: Number(applicationID) }).lean();
    
    if (!application) {
        throw new Error("Application not found");
    }

    // Remove from club's membership applications
    await Club.findOneAndUpdate(
        { _id: Number(clubID) },
        { $pull: { membershipApplications: Number(applicationID) } },
        { returnDocument: "after" }
    );

    return application;
});
