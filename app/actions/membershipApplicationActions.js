"use server";

import { getMembershipApplications, createMembershipApplication, approveMembershipApplication, rejectMembershipApplication } from "@/services/membershipApplicationService";
import { requireAuth, getCurrentUser } from "@/lib/authMiddleware";
import { getClub } from "@/services/clubService";

export async function fetchMembershipApplications(clubId) {
  try {
    const currentUser = await requireAuth();
    
    // Only club owner or admin can fetch applications
    const club = await getClub(clubId);
    if (Number(club.ownedBy) !== Number(currentUser._id) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Only club owner or admin can view membership applications");
    }
    
    const applications = await getMembershipApplications(clubId);
    return { success: true, data: applications };
  } catch (error) {
    console.error("Error fetching membership applications:", error);
    return { success: false, error: error.message };
  }
}

export async function addMembershipApplication(clubId, userId, userName, userEmail) {
  try {
    const currentUser = await requireAuth();
    
    // User can only apply with their own account
    if (Number(currentUser._id) !== Number(userId)) {
      throw new Error("Forbidden: You can only apply to join clubs with your own account");
    }
    
    const application = await createMembershipApplication(clubId, userId, userName, userEmail);
    return { success: true, data: application };
  } catch (error) {
    console.error("Error creating membership application:", error);
    return { success: false, error: error.message };
  }
}

export async function approveMembershipApp(applicationId, userId, clubId) {
  try {
    const currentUser = await requireAuth();
    
    // Only club owner or admin can approve
    const club = await getClub(clubId);
    if (Number(club.ownedBy) !== Number(currentUser._id) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Only club owner or admin can approve applications");
    }
    
    const result = await approveMembershipApplication(applicationId, userId, clubId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error approving membership application:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectMembershipApp(applicationId, clubId) {
  try {
    const currentUser = await requireAuth();
    
    // Only club owner or admin can reject
    const club = await getClub(clubId);
    if (Number(club.ownedBy) !== Number(currentUser._id) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Only club owner or admin can reject applications");
    }
    
    const result = await rejectMembershipApplication(applicationId, clubId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error rejecting membership application:", error);
    return { success: false, error: error.message };
  }
}
