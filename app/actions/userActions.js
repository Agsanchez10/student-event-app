"use server";

import { getUsers, getUser, createUser, deleteUser, updateUser, getUserByEmail, createCollegeAdmin, deactivateUser } from "@/services/userService";
import { requireAuth, requireAdmin, requireSystemAdmin, getCurrentUser } from "@/lib/authMiddleware";

export async function fetchUsers() {
  try {
    // Only admins can fetch all users
    await requireAdmin();
    
    const users = await getUsers();
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchUser(userId) {
  try {
    const currentUser = await requireAuth();
    
    // Users can only fetch their own info unless they're admin
    if (Number(currentUser._id) !== Number(userId) && (currentUser.role !== "SystemAdmin" || currentUser.role !== "CollegeAdmin")) {
      throw new Error("Forbidden: You can only access your own information");
    }
    
    const user = await getUser(userId);
    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: error.message };
  }
}

export async function addUser(userData) {
  try {
    // Only system admin can create users (besides registration)
    await requireSystemAdmin();
    
    const user = await createUser(userData);
    return { success: true, data: user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message };
  }
}

export async function removeUser(userId) {
  try {
    // Only system admin can delete users
    await requireSystemAdmin();
    
    const result = await deleteUser({ id: userId });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}

export async function modifyUser(userId, userData) {
  try {
    const currentUser = await requireAuth();
    
    // Users can only modify their own info unless they're admin
    if (Number(currentUser._id) !== Number(userId) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: You can only modify your own information");
    }
    
    const result = await updateUser(userId, userData);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchUserByEmail(email) {
  try {
    // Only admins can fetch users by email
    await requireAdmin();
    
    const user = await getUserByEmail(email);
    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return { success: false, error: error.message };
  }
}

export async function createAdminUser(adminData) {
  try {
    // Only system admin can create new admins
    await requireSystemAdmin();
    
    const user = await createCollegeAdmin(adminData);
    return { success: true, data: user };
  } catch (error) {
    console.error("Error creating admin:", error);
    return { success: false, error: error.message };
  }
}

export async function deactivateUserAccount(userId) {
  try {
    // Only system admin can deactivate users
    await requireSystemAdmin();
    
    const result = await deactivateUser(userId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deactivating user:", error);
    return { success: false, error: error.message };
  }
}
