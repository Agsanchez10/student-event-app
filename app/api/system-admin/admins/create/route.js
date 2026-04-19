import { withDB } from "@/lib/mongodb";
import User, { CollegeAdmin, SystemAdmin } from "@/models/User";
import { requireAuth } from "@/lib/authMiddleware";
import { getUserByEmail } from "@/services/userService";

export const POST = withDB(async (req) => {
    try {
        // Require authentication and SystemAdmin role
        const currentUser = await requireAuth();
        if (currentUser.role !== "SystemAdmin") {
            return Response.json(
                { message: "Forbidden: Only system admins can create admins" },
                { status: 403 }
            );
        }

        const { firstName, lastName, email, password, role } = await req.json();

        // Validate input
        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
            return Response.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return Response.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Validate role
        if (!["CollegeAdmin", "SystemAdmin"].includes(role)) {
            return Response.json(
                { message: "Invalid role. Must be CollegeAdmin or SystemAdmin" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return Response.json(
                { message: "Email already in use" },
                { status: 409 }
            );
        }

        // Get next user ID
        const lastUser = await User.findOne().sort({ _id: -1 });
        const newId = lastUser ? lastUser._id + 1 : 1;

        // Create admin based on role
        let newAdmin;
        if (role === "CollegeAdmin") {
            newAdmin = new CollegeAdmin({
                _id: newId,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.toLowerCase().trim(),
                password: password,
                role: "CollegeAdmin",
                isActive: true,
                pastActions: [],
            });
        } else {
            newAdmin = new SystemAdmin({
                _id: newId,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.toLowerCase().trim(),
                password: password,
                role: "SystemAdmin",
                isActive: true,
                pastActions: [],
            });
        }

        await newAdmin.save();

        // Return created user without password
        return Response.json(
            {
                message: "Admin created successfully",
                user: {
                    _id: newAdmin._id,
                    firstName: newAdmin.firstName,
                    lastName: newAdmin.lastName,
                    email: newAdmin.email,
                    role: newAdmin.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating admin:", error);
        return Response.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
});
