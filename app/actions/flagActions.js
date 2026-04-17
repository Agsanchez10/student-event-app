"use server";

import { getFlags, getUnresolvedFlags, getFlag, createFlag, deleteFlag, updateFlag } from "@/services/flagService";
import { requireAuth, requireAdmin, getCurrentUser } from "@/lib/authMiddleware";

export async function fetchFlags() {
  try {
    // Only admins can fetch all flags
    await requireAdmin();
    
    const flags = await getFlags();
    return { success: true, data: flags };
  } catch (error) {
    console.error("Error fetching flags:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchUnresolvedFlags() {
  try {
    // Only admins can fetch unresolved flags
    await requireAdmin();
    
    const flags = await getUnresolvedFlags();
    return { success: true, data: flags };
  } catch (error) {
    console.error("Error fetching unresolved flags:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchFlag(flagId) {
  try {
    // Only admins can fetch specific flags
    await requireAdmin();
    
    const flag = await getFlag(flagId);
    return { success: true, data: flag };
  } catch (error) {
    console.error("Error fetching flag:", error);
    return { success: false, error: error.message };
  }
}

export async function addFlag(flagData) {
  try {
    // Any authenticated user can report content
    const currentUser = await requireAuth();
    
    const flagWithReporter = { ...flagData, flaggedById: currentUser._id };
    const flag = await createFlag(flagWithReporter);
    return { success: true, data: flag };
  } catch (error) {
    console.error("Error creating flag:", error);
    return { success: false, error: error.message };
  }
}

export async function removeFlag(flagId) {
  try {
    // Only admins can delete flags
    await requireAdmin();
    
    const result = await deleteFlag(flagId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting flag:", error);
    return { success: false, error: error.message };
  }
}

export async function modifyFlag(flagId, flagData) {
  try {
    // Only admins can update flags (typically for resolution)
    await requireAdmin();
    
    const result = await updateFlag(flagId, flagData);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating flag:", error);
    return { success: false, error: error.message };
  }
}
