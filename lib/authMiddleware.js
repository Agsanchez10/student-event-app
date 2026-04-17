import jwt from "jsonwebtoken";
import { getUser } from "@/services/userService";
import { cookies } from "next/headers";

/**
 * SERVER ACTION: Get the current user from JWT token in cookies
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUser(decoded.id);
        return user;
    } catch (error) {
        console.error("Auth error:", error);
        return null;
    }
}

/**
 * SERVER ACTION: Verify user is authenticated
 * @throws {Error} If not authenticated
 */
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized: Please log in");
    }
    return user;
}

/**
 * SERVER ACTION: Verify user has specific role
 * @param {string} requiredRole - The role required (e.g., "Admin", "Student")
 * @throws {Error} If user doesn't have required role
 */
export async function requireRole(requiredRole) {
    const user = await requireAuth();
    
    if (user.role !== requiredRole) {
        throw new Error(`Forbidden: ${requiredRole} access required`);
    }
    
    return user;
}

/**
 * SERVER ACTION: Verify user is admin (SystemAdmin or CollegeAdmin)
 * @throws {Error} If not an admin
 */
export async function requireAdmin() {
    const user = await requireAuth();
    
    const isAdmin = user.role === "SystemAdmin" || user.role === "CollegeAdmin";
    
    if (!isAdmin) {
        throw new Error("Forbidden: Admin access required");
    }

    if (!user.isActive) {
        throw new Error("Forbidden: Admin account is inactive");
    }
    
    return user;
}

/**
 * SERVER ACTION: Verify user is system admin
 * @throws {Error} If not a system admin
 */
export async function requireSystemAdmin() {
    const user = await requireAuth();
    
    if (user.role !== "SystemAdmin") {
        throw new Error("Forbidden: SystemAdmin access required");
    }

    if (!user.isActive) {
        throw new Error("Forbidden: Admin account is inactive");
    }
    
    return user;
}

/**
 * SERVER ACTION: Verify user owns a specific resource
 * @param {number|string} ownerId - The owner ID to check against
 * @throws {Error} If user doesn't own the resource
 */
export async function requireOwnership(ownerId) {
    const user = await requireAuth();
    
    if (Number(user._id) !== Number(ownerId)) {
        throw new Error("Forbidden: You don't have access to this resource");
    }
    
    return user;
}

// ============================================
// API ROUTE MIDDLEWARE (Existing)
// ============================================

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
