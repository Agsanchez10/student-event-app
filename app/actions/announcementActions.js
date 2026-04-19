"use server";

import { revalidatePath } from "next/cache";
import { getClubAnnouncements, getRecentAnnouncementsByClubIds, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/services/announcementService";
import { requireAuth, getClub } from "@/lib/authMiddleware";
import { getClub as getClubService } from "@/services/clubService";

export async function fetchClubAnnouncements(clubId) {
  try {
    // Any authenticated user can fetch club announcements
    await requireAuth();
    
    const announcements = await getClubAnnouncements(clubId);
    return { success: true, data: announcements };
  } catch (error) {
    console.error("Error fetching club announcements:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchRecentAnnouncements(clubIds) {
  try {
    // Any authenticated user can fetch recent announcements
    await requireAuth();
    
    const announcements = await getRecentAnnouncementsByClubIds(clubIds);
    return { success: true, data: announcements };
  } catch (error) {
    console.error("Error fetching recent announcements:", error);
    return { success: false, error: error.message };
  }
}

export async function addAnnouncement(clubId, announcementData) {
  try {
    const currentUser = await requireAuth();
    
    // Get club to verify user is owner/admin
    const club = await getClubService(clubId);
    
    // Only club owner, admins of the club, or site admins can post
    const isClubAdmin = currentUser.role === "Admin";
    const isClubOwner = Number(club.ownerID) === Number(currentUser._id);
    
    if (!isClubAdmin && !isClubOwner) {
      throw new Error("Forbidden: Only club owner or admin can post announcements");
    }
    
    const announcement = await createAnnouncement(clubId, announcementData);
    
    // Revalidate club page to show new announcement
    revalidatePath(`/dashboard/clubs/${clubId}`);
    
    return { success: true, data: announcement };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message };
  }
}

export async function modifyAnnouncement(announcementId, clubId, announcementData) {
  try {
    const currentUser = await requireAuth();
    
    // Get club to verify user is owner/admin
    const club = await getClubService(clubId);
    
    // Only club owner, CollegeAdmin, or SystemAdmin can edit
    const isClubAdmin = currentUser.role === "CollegeAdmin" || currentUser.role === "SystemAdmin";
    const isClubOwner = Number(club.ownerID) === Number(currentUser._id);
    
    if (!isClubAdmin && !isClubOwner) {
      throw new Error("Forbidden: Only club owner or admin can edit announcements");
    }
    
    const result = await updateAnnouncement(announcementId, announcementData);
    
    // Revalidate club page to reflect updated announcement
    revalidatePath(`/dashboard/clubs/${clubId}`);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { success: false, error: error.message };
  }
}

export async function removeAnnouncement(announcementId, clubId) {
  try {
    const currentUser = await requireAuth();
    
    // Get club to verify user is owner/admin
    const club = await getClubService(clubId);
    
    // Only club owner, CollegeAdmin, or SystemAdmin can delete
    const isClubAdmin = currentUser.role === "CollegeAdmin" || currentUser.role === "SystemAdmin";
    const isClubOwner = Number(club.ownerID) === Number(currentUser._id);
    
    if (!isClubAdmin && !isClubOwner) {
      throw new Error("Forbidden: Only club owner or admin can delete announcements");
    }
    
    const result = await deleteAnnouncement(announcementId, clubId);
    
    // Revalidate club page to reflect deleted announcement
    revalidatePath(`/dashboard/clubs/${clubId}`);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message };
  }
}
