import { withDB} from "@/lib/mongodb";
import User from "@/models/User";

export const getUsers = withDB(async () => {
    const users = await User.find({});
    return users;
});

export const getUser = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }   
    return user;
});

export const createUser = withDB(async (body) => {
    const lastID = await User.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;
    
    const user = await User.create({ ...body, _id: newId });
    return user;
});

export const deleteUser = withDB(async (body) => {
    const user = await User.findByIdAndDelete(body.id);
    if (!user) {
        throw new Error("404: User not found");
    }
    return user;
});
    

export const updateUser = withDB(async (body) => {
    const user = await User.findByIdAndUpdate(body.id, body, { new: true });
    if (!user) {
        throw new Error("404: User not found");
    }
    return user;
});

export const getUserByEmail = withDB(async (email) => {
    const user = await User.findOne({ email: email });
    return user;
});

export const createCollegeAdmin = withDB(async (body) => {
    const lastID = await User.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;
    
    const adminData = {
        ...body,
        _id: newId,
        role: "Admin",
        adminType: "CollegeAdmin",
        isActive: true
    };
    
    const user = await User.create(adminData);
    return user;
});

export const deactivateUser = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }
    
    if (user.role === "Admin") {
        user.isActive = false;
        await user.save();
    } else {
        throw new Error("Only admin accounts can be deactivated");
    }
    
    return user;
});

export const activateUser = withDB(async (userId) => {
    const user = await User.findOne({ _id: Number(userId) });
    if (!user) {
        throw new Error("404: User not found");
    }
    
    if (user.role === "Admin") {
        user.isActive = true;
        await user.save();
    } else {
        throw new Error("Only admin accounts can be activated");
    }
    
    return user;
});