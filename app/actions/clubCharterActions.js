"use server";

import { createClubCharter, getClubChartersForUser, signClubCharter, deleteClubCharter, getPendingChartersForAdmin, getAllCharters, removeSignatureFromCharter, approveCharter, rejectCharter } from "@/services/clubCharterService";
import { requireAuth, requireAdmin, getCurrentUser } from "@/lib/authMiddleware";

export async function addClubCharter(charterData) {
  try {
    // Any authenticated user can create a charter
    const currentUser = await requireAuth();
    
    const charterWithInitiator = { ...charterData, initiatorId: currentUser._id };
    const charter = await createClubCharter(charterWithInitiator);
    return { success: true, data: charter };
  } catch (error) {
    console.error("Error creating club charter:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchUserCharters(userId) {
  try {
    const currentUser = await requireAuth();
    
    // Users can only fetch their own charters unless they're admin
    if (Number(currentUser._id) !== Number(userId) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: You can only access your own charters");
    }
    
    const charters = await getClubChartersForUser(userId);
    return { success: true, data: charters };
  } catch (error) {
    console.error("Error fetching user charters:", error);
    return { success: false, error: error.message };
  }
}

export async function signCharterAction(charterId, userId) {
  try {
    const currentUser = await requireAuth();
    
    // User can only sign with their own ID
    if (Number(currentUser._id) !== Number(userId)) {
      throw new Error("Forbidden: You can only sign charters with your own account");
    }
    
    const charter = await signClubCharter(charterId, userId);
    return { success: true, data: charter };
  } catch (error) {
    console.error("Error signing charter:", error);
    return { success: false, error: error.message };
  }
}

export async function removeCharterAction(charterId, userId) {
  try {
    const currentUser = await requireAuth();
    
    // Only the charter initiator or admin can delete
    if (Number(currentUser._id) !== Number(userId) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Only the charter initiator or admin can delete charters");
    }
    
    const result = await deleteClubCharter(charterId, userId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting charter:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchPendingCharters() {
  try {
    // Only admins can fetch pending charters
    await requireAdmin();
    
    const charters = await getPendingChartersForAdmin();
    return { success: true, data: charters };
  } catch (error) {
    console.error("Error fetching pending charters:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchAllCharters() {
  try {
    // Only admins can fetch all charters
    await requireAdmin();
    
    const charters = await getAllCharters();
    return { success: true, data: charters };
  } catch (error) {
    console.error("Error fetching all charters:", error);
    return { success: false, error: error.message };
  }
}

export async function removeSignatureAction(charterId, userId) {
  try {
    const currentUser = await requireAuth();
    
    // User can only remove their own signature
    if (Number(currentUser._id) !== Number(userId)) {
      throw new Error("Forbidden: You can only remove your own signature");
    }
    
    const charter = await removeSignatureFromCharter(charterId, userId);
    return { success: true, data: charter };
  } catch (error) {
    console.error("Error removing signature:", error);
    return { success: false, error: error.message };
  }
}

export async function approveCharterAction(charterId) {
  try {
    // Only admins can approve charters
    await requireAdmin();
    
    const charter = await approveCharter(charterId);
    return { success: true, data: charter };
  } catch (error) {
    console.error("Error approving charter:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectCharterAction(charterId) {
  try {
    // Only admins can reject charters
    await requireAdmin();
    
    const charter = await rejectCharter(charterId);
    return { success: true, data: charter };
  } catch (error) {
    console.error("Error rejecting charter:", error);
    return { success: false, error: error.message };
  }
}
