import { withDB } from "@/lib/mongodb";
import Flag from "@/models/Flag";

export const getFlags = withDB(async () => {
    const flags = await Flag.find({});
    return flags;
});

export const getFlag = withDB(async (flagid) => {
    const flag = await Flag.findOne({ _id: Number(flagid) });
    if (!flag) {
        throw new Error("404: Flag not found");
    }
    return flag;
});

export const createFlag = withDB(async (body) => {
    const lastID = await Flag.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const flag = await Flag.create({ ...body, _id: newId });
    return flag;
});

export const deleteFlag = withDB(async (flagid) => {
    const flag = await Flag.findByIdAndDelete(flagid);
    if (!flag) {
        throw new Error("404: Flag not found");
    }
    return flag;
});

export const updateFlag = withDB(async (flagid, body) => {
    const flag = await Flag.findByIdAndUpdate(flagid, body, { new: true });
    if (!flag) {
        throw new Error("404: Flag not found");
    }
    return flag;
});