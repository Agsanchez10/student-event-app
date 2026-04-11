import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUser } from "@/services/userService";

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token || !process.env.JWT_SECRET) {
            return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUser(decoded.id);

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(
            JSON.stringify({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }
}
