import { withDB } from "@/lib/mongodb";
import Flag from "@/models/Flag";

export const getFlags = withDB(async (request) => {
    const body = await request.json().catch(() => ({}));

    if (body.id) {
        const flag = await Flag.findById(body.id);
        if (!flag) {
            return Response.json({ error: "Flag not found" }, { status: 404 });
        }
        return Response.json(flag);
    }
    const flags = await Flag.find({});
    return Response.json(flags);
});

export const createFlag = withDB(async (request) => {
    const body = await request.json();

    const lastID = await Flag.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const flag = await Flag.create({ ...body, _id: newId });
    return Response.json(flag);   
});

export const deleteFlag = withDB(async (request) => {
    const body = await request.json();
    const flag = await Flag.findByIdAndDelete(body.id);
    if (!flag) {
        return Response.json({ error: "Flag not found" }, { status: 404 });
    }
    return Response.json({ message: "Flag deleted successfully" });
});

export const updateFlag = withDB(async (request) => {
    const body = await request.json();
    const flag = await Flag.findByIdAndUpdate(body.id, body, { returnDocument: "after" });
    if (!flag) {
        return Response.json({ error: "Flag not found" }, { status: 404 });
    } 
    return Response.json(flag);
});