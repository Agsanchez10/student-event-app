import { withDB } from "@/lib/mongodb";
import ClubCharter from "@/models/ClubCharter";

export const createClubCharter = withDB(async (body) => {
    const lastID = await ClubCharter.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    

    const charter = await ClubCharter.create({ ...body, _id: newId, signatures: [body.initiatorId], status: "collecting" });
    return charter;
});

export const getClubChartersForUser = withDB(async (userId) => {
    return await ClubCharter.find({
        $or: [
            { initiatorId: Number(userId) },
            { signatures: Number(userId) },
        ],
    }).sort({ createdAt: -1 }).lean();
});

export const signClubCharter = withDB(async (charterId, userId) => {
    const charter = await ClubCharter.findOne({ _id: Number(charterId) });
    if (!charter) {
        throw new Error("404: Charter not found");
    }

    const signerId = Number(userId);
    if (!charter.signatures.includes(signerId)) {
        charter.signatures.push(signerId);
    }

    if (charter.signatures.length >= 10 && charter.status === "collecting") {
        charter.status = "submitted";
    }

    await charter.save();
    return charter;
});

export const deleteClubCharter = withDB(async (charterId, userId) => {
    const charter = await ClubCharter.findOne({ _id: Number(charterId) });
    if (!charter) {
        throw new Error("404: Charter not found");
    }

    if (String(charter.initiatorId) !== String(userId)) {
        throw new Error("403: Unauthorized to delete this charter");
    }

    await ClubCharter.deleteOne({ _id: Number(charterId) });
    return { deleted: true };
});

export const getPendingChartersForAdmin = withDB(async () => {
    return await ClubCharter.find({
        status: { $in: ["draft", "collecting", "submitted"] }
    }).sort({ createdAt: -1 }).lean();
});

// remove this before deployment - only for testing purposes
export const getAllCharters = withDB(async () => {
    return await ClubCharter.find({}).sort({ createdAt: -1 }).lean();
});

export const removeSignatureFromCharter = withDB(async (charterId, userId) => {
    const charter = await ClubCharter.findOne({ _id: Number(charterId) });
    if (!charter) {
        throw new Error("404: Charter not found");
    }

    const signerId = Number(userId);
    const index = charter.signatures.indexOf(signerId);
    if (index > -1) {
        charter.signatures.splice(index, 1);
    }

    if (charter.signatures.length < 10 && charter.status === "submitted") {
        charter.status = "collecting";
    }

    await charter.save();
    return charter;
});
