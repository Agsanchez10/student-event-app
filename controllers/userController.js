import { withDB} from "@/lib/mongodb";
import User from "@/models/User";

export const getUsers = withDB(async (request) => {
    const body = await request.json().catch(() => ({}));

    if (body.id) {
        const user = await User.findById(body.id);
        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }
        return Response.json(user);
    }
    const users = await User.find({});
    return Response.json(users);
});

export const createUser = withDB(async (request) => {
    const body = await request.json();

    const lastID = await User.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;
    
    const user = await User.create({ ...body, _id: newId });
    return Response.json(user);
});

export const deleteUser = withDB(async (request) => {
    const body = await request.json();
    const user = await User.findByIdAndDelete(body.id);
    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
    }  
    return Response.json({ message: "User deleted successfully" });
});

export const updateUser = withDB(async (request) => {
    const body = await request.json();
    const user = await User.findByIdAndUpdate(body.id, body, { returnDocument: "after" });
    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json(user);
});