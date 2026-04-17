import { withDB } from "@/lib/mongodb";
import ClubCharter from "@/models/ClubCharter";

export const createClubCharter = withDB(async (body) => {
    const lastID = await ClubCharter.findOne().sort({ _id: -1 }).lean();
    const newId = lastID ? lastID._id + 1 : 1;

    const charter = await ClubCharter.create({ ...body, _id: newId, signatures: [body.initiatorId], status: "collecting" });
    return charter.toObject();
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
    const charter = await ClubCharter.findOne({ _id: Number(charterId) }).lean();
    if (!charter) {
        throw new Error("404: Charter not found");
    }

    const signerId = Number(userId);
    const alreadySigned = charter.signatures.includes(signerId);
    const newLength = alreadySigned ? charter.signatures.length : charter.signatures.length + 1;
    const newStatus = newLength >= 10 && charter.status === "collecting" ? "submitted" : charter.status;
    
    const update = {};
    if (!alreadySigned) {
        update.$push = { signatures: signerId };
    }
    update.$set = { status: newStatus };

    const result = await ClubCharter.findOneAndUpdate(
        { _id: Number(charterId) },
        update,
        { returnDocument: "after" }
    ).lean();
    
    return result;
});

export const deleteClubCharter = withDB(async (charterId, userId) => {
    const charter = await ClubCharter.findOne({ _id: Number(charterId) }).lean();
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
    const charter = await ClubCharter.findOne({ _id: Number(charterId) }).lean();
    if (!charter) {
        throw new Error("404: Charter not found");
    }

    const signerId = Number(userId);
    const hadSignature = charter.signatures.includes(signerId);
    const newLength = hadSignature ? charter.signatures.length - 1 : charter.signatures.length;
    const newStatus = newLength < 10 && charter.status === "submitted" ? "collecting" : charter.status;
    
    const update = {};
    if (hadSignature) {
        update.$pull = { signatures: signerId };
    }
    update.$set = { status: newStatus };

    const result = await ClubCharter.findOneAndUpdate(
        { _id: Number(charterId) },
        update,
        { returnDocument: "after" }
    ).lean();
    
    return result;
});

export const approveCharter = withDB(async (charterId) => {
    const result = await ClubCharter.findOneAndUpdate(
        { _id: Number(charterId) },
        { status: "approved" },
        { returnDocument: "after" }
    ).lean();
    
    if (!result) {
        throw new Error("404: Charter not found");
    }
    
    return result;
});

export const rejectCharter = withDB(async (charterId) => {
    const result = await ClubCharter.findOneAndUpdate(
        { _id: Number(charterId) },
        { status: "rejected" },
        { returnDocument: "after" }
    ).lean();
    
    if (!result) {
        throw new Error("404: Charter not found");
    }
    
    return result;
});
