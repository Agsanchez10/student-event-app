"use server";

import { revalidatePath } from "next/cache";
import { createClubCharter, getClubChartersForUser, signClubCharter, deleteClubCharter, getPendingChartersForAdmin, getAllCharters, removeSignatureFromCharter, rejectCharter as rejectCharterService } from "@/services/clubCharterService";
import { requireAuth, requireAdmin, getCurrentUser } from "@/lib/authMiddleware";
import { withDB } from "@/lib/mongodb";
import ClubCharter from "@/models/ClubCharter";
import Club from "@/models/Club";
import User, { ClubOwner } from "@/models/User";
import { sendEmail } from "@/services/emailService";

// Generate a random password
function generatePassword(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

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

export async function approveCharter(charterId, initiatorId) {
  try {
    const currentUser = await requireAuth();
    
    // Only CollegeAdmin can approve
    if (currentUser.role !== "CollegeAdmin") {
      throw new Error("Only College Admins can approve charters");
    }

    const result = await withDB(async () => {
      // Fetch the charter
      const charter = await ClubCharter.findOne({ _id: Number(charterId) });
      if (!charter) {
        throw new Error("Charter not found");
      }

      // Fetch the initiator (original user) to get their email
      const initiator = await User.findOne({ _id: Number(initiatorId) }).lean();
      if (!initiator) {
        throw new Error("Initiator not found");
      }

      // Generate bullepin.xyz email and password
      let clubNameSlug = charter.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      let bullepinEmail = `${clubNameSlug}@bullepin.xyz`;
      
      // Check if email already exists, and if so, add a number suffix to make it unique
      let emailCounter = 1;
      let emailExists = await User.findOne({ email: bullepinEmail });
      while (emailExists) {
        emailCounter++;
        bullepinEmail = `${clubNameSlug}-${emailCounter}@bullepin.xyz`;
        emailExists = await User.findOne({ email: bullepinEmail });
      }
      
      const generatedPassword = generatePassword();

      // Get next user ID
      const lastUser = await User.findOne().sort({ _id: -1 });
      const newId = lastUser ? lastUser._id + 1 : 1;

      // Create ClubOwner account
      const clubOwner = new ClubOwner({
        _id: newId,
        firstName: charter.proposedOwner?.split(" ")[0] || "Club",
        lastName: charter.proposedOwner?.split(" ")[1] || "Owner",
        email: bullepinEmail,
        password: generatedPassword,
        role: "ClubOwner",
        isActive: true,
        ownedClubs: [],
      });

      await clubOwner.save();

      // Get next club ID
      const lastClub = await Club.findOne().sort({ _id: -1 });
      const clubId = lastClub ? lastClub._id + 1 : 1;

      // Create Club
      const club = new Club({
        _id: clubId,
        name: charter.name,
        description: charter.description,
        ownerID: newId,
        memberList: charter.signatures || [],
        eventList: [],
        admin: [newId],
        announcements: [],
        isPrivate: false,
        membershipApplications: [],
      });

      await club.save();

      // Update ClubOwner with owned club
      await ClubOwner.findOneAndUpdate(
        { _id: newId },
        { ownedClubs: [clubId] }
      );

      // Update charter
      charter.status = "approved";
      charter.clubId = clubId;
      await charter.save();

      // Send email to original email with new credentials
      await sendEmail({        
        to: initiator.email,
        subject: `Your Club "${charter.name}" Has Been Approved!`,
        html: `
          <h1>Congratulations!</h1>
          <p>Your club charter for <strong>${charter.name}</strong> has been approved by the College Admin!</p>
          
          <h2>Your Club Owner Account</h2>
          <p>A new account has been created for you to manage your club.</p>
          
          <h3>Account Credentials:</h3>
          <p><strong>Email:</strong> ${bullepinEmail}</p>
          <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
          
          <p><strong>Important:</strong> Please log in and change your password immediately.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Manage club members</li>
            <li>Create and manage events</li>
            <li>Post announcements</li>
            <li>View club statistics</li>
          </ul>
          
          <p>Welcome to Bullepin!</p>
        `,
      });

      return { 
        success: true, 
        club: JSON.parse(JSON.stringify(club)),
        clubOwner: JSON.parse(JSON.stringify(clubOwner))
      };
    })();

    // Revalidate the dashboard to show updated charter list
    revalidatePath("/dashboard/new-club-charters");

    return result;
  } catch (error) {
    console.error("Error approving charter:", error);
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
    
    const charter = await rejectCharterService(charterId);
    return { success: true, data: charter };
  } catch (error) {
    console.error("Error rejecting charter:", error);
    return { success: false, error: error.message };
  }
}
