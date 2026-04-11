import { withDB } from "@/lib/mongodb";
import User, { Student } from "@/models/User";
import { getUserByEmail } from "@/services/userService";

export const POST = withDB(async (req) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = await req.json();

        // Validate input
        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
            return Response.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return Response.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return Response.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return Response.json(
                { error: "Email already in use" },
                { status: 409 }
            );
        }

        // Get next user ID
        const lastUser = await User.findOne().sort({ _id: -1 });
        const newId = lastUser ? lastUser._id + 1 : 1;

        // Create new student user
        const newUser = new Student({
            _id: newId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            role: "Student",
        });

        await newUser.save();

        return Response.json(
            { message: "Registration successful. Please log in." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return Response.json(
            { error: "Registration failed" },
            { status: 500 }
        );
    }
});
