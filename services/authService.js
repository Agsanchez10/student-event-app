import { withDB } from "@/lib/mongodb";
 import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";
 import { getUser, getUserByEmail } from "./userService";

export const authenticateUser = withDB(async (email, password) => {
    const user = await getUserByEmail(email);
    if (!user) {
        return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return null;
    }

    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role},
        process.env.JWT_SECRET,
        { expiresIn: "7d" } 
    );

    return { 
        token, 
        user: {
            id: user._id,
            email: user.email,
            role: user.role,            
        } };
});