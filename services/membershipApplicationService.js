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
    const lastID = await MembershipApplication.findOne().sort({ _id: -1 });
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
    await Club.findByIdAndUpdate(
        clubID,
        { $addToSet: { membershipApplications: newId } },
        { new: true }
    );

    return application;
});

export const approveMembershipApplication = withDB(async (applicationID, userId, clubID) => {
    const application = await MembershipApplication.findByIdAndUpdate(
        applicationID,
        { status: "approved" },
        { new: true }
    );

    if (!application) {
        throw new Error("Application not found");
    }

    // Add user to club membership
    await Club.findByIdAndUpdate(
        clubID,
        { $addToSet: { memberList: Number(userId) } },
        { new: true }
    );

    return application;
});

export const rejectMembershipApplication = withDB(async (applicationID, clubID) => {
    const application = await MembershipApplication.findByIdAndDelete(applicationID);
    
    if (!application) {
        throw new Error("Application not found");
    }

    // Remove from club's membership applications
    await Club.findByIdAndUpdate(
        clubID,
        { $pull: { membershipApplications: applicationID } },
        { new: true }
    );

    return application;
});
