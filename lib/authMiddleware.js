import jwt from "jsonwebtoken";
import { getUser } from "@/services/userService";

/**
 * Middleware to verify that the user is a SystemAdmin
 * Checks JWT token and verifies admin role and status
 */
export const verifySystemAdmin = async (req) => {
    try {
        const token = req.cookies.get("token")?.value;
        
        if (!token) {
            return {
                isValid: false,
                error: "No authentication token found"
            };
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return {
                isValid: false,
                error: "Invalid or expired token"
            };
        }

        // Get user from database
        const user = await getUser(decoded.id);
        
        // Verify user is an admin and is active
        if (user.role !== "SystemAdmin" || !user.isActive) {
            return {
                isValid: false,
                error: "Unauthorized access. SystemAdmin privileges required."
            };
        }

        return {
            isValid: true,
            user: user
        };
    } catch (error) {
        console.error("Error verifying SystemAdmin:", error);
        return {
            isValid: false,
            error: "Authentication verification failed"
        };
    }
};

/**
 * Middleware to verify that the user is any admin (College or System)
 */
export const verifyAdmin = async (req) => {
    try {
        const token = req.cookies.get("token")?.value;
        
        if (!token) {
            return {
                isValid: false,
                error: "No authentication token found"
            };
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return {
                isValid: false,
                error: "Invalid or expired token"
            };
        }

        // Get user from database
        const user = await getUser(decoded.id);
        
        // Verify user is an admin and is active
        if ((user.role !== "SystemAdmin" && user.role !== "CollegeAdmin") || !user.isActive) {
            return {
                isValid: false,
                error: "Unauthorized access. Admin privileges required."
            };
        }

        return {
            isValid: true,
            user: user
        };
    } catch (error) {
        console.error("Error verifying Admin:", error);
        return {
            isValid: false,
            error: "Authentication verification failed"
        };
    }
};
