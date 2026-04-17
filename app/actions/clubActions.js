"use server";

import { getClubs, getClub, createClub, deleteClub, updateClub, joinClub, leaveClub } from "@/services/clubService";
import { requireAuth, requireAdmin, getCurrentUser } from "@/lib/authMiddleware";

export async function fetchClubs() {
  try {
    // Any authenticated user can fetch clubs
    await requireAuth();
    
    const clubs = await getClubs();
    return { success: true, data: clubs };
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchClub(clubId) {
  try {
    // Any authenticated user can fetch a club
    await requireAuth();
    
    const club = await getClub(clubId);
    return { success: true, data: club };
  } catch (error) {
    console.error("Error fetching club:", error);
    return { success: false, error: error.message };
  }
}

export async function addClub(clubData) {
  try {
    // Any authenticated user can create a club
    const currentUser = await requireAuth();
    
    // Add the creator as the club owner
    const clubWithOwner = { ...clubData, ownedBy: currentUser._id };
    const club = await createClub(clubWithOwner);
    return { success: true, data: club };
  } catch (error) {
    console.error("Error creating club:", error);
    return { success: false, error: error.message };
  }
}

export async function removeClub(clubId) {
  try {
    const currentUser = await requireAuth();
    const club = await getClub(clubId);
    
    // Only club owner or admin can delete club
    if (Number(club.ownedBy) !== Number(currentUser._id) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Only club owner or admin can delete this club");
    }
    
    const result = await deleteClub(clubId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting club:", error);
    return { success: false, error: error.message };
  }
}

export async function modifyClub(clubId, clubData) {
  try {
    const currentUser = await requireAuth();
    const club = await getClub(clubId);
    
    // Only club owner or admin can update club
    if (Number(club.ownedBy) !== Number(currentUser._id) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Only club owner or admin can update this club");
    }
    
    const result = await updateClub(clubId, clubData);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating club:", error);
    return { success: false, error: error.message };
  }
}

export async function joinClubAction(clubId, studentId) {
  try {
    const currentUser = await requireAuth();
    
    // User can only join with their own ID
    if (Number(currentUser._id) !== Number(studentId)) {
      throw new Error("Forbidden: You can only join clubs with your own account");
    }
    
    const result = await joinClub(clubId, studentId);
    if (result.error) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("Error joining club:", error);
    return { success: false, error: error.message };
  }
}

export async function leaveClubAction(clubId, studentId) {
  try {
    const currentUser = await requireAuth();
    
    // User can only leave with their own ID
    if (Number(currentUser._id) !== Number(studentId)) {
      throw new Error("Forbidden: You can only leave clubs with your own account");
    }
    
    const result = await leaveClub(clubId, studentId);
    if (result.error) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("Error leaving club:", error);
    return { success: false, error: error.message };
  }
}
