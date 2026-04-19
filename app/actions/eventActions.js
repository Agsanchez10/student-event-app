"use server";

import { revalidatePath } from "next/cache";
import { getEvents, getEvent, createEvent, deleteEvent, updateEvent, registerForEvent, unregisterFromEvent, getUserEvents, getPublicEvents } from "@/services/eventService";
import { requireAuth, getCurrentUser } from "@/lib/authMiddleware";

export async function fetchEvents() {
  try {
    // Any authenticated user can fetch events
    await requireAuth();
    
    const events = await getEvents();
    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchEvent(eventId) {
  try {
    // Any authenticated user can fetch an event
    await requireAuth();
    
    const event = await getEvent(eventId);
    return { success: true, data: event };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, error: error.message };
  }
}

export async function addEvent(eventData) {
  try {
    // Any authenticated user can create an event
    const currentUser = await requireAuth();
    
    const eventWithCreator = { ...eventData, createdBy: currentUser._id };
    const event = await createEvent(eventWithCreator);
    
    // Revalidate club page to show new event
    revalidatePath(`/dashboard/clubs/${eventData.clubId}`);
    
    return { success: true, data: event };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }
}

export async function removeEvent(eventId) {
  try {
    const currentUser = await requireAuth();
    const event = await getEvent(eventId);
    
    // Only event creator, CollegeAdmin, or SystemAdmin can delete
    const isAdmin = currentUser.role === "CollegeAdmin" || currentUser.role === "SystemAdmin";
    if (Number(event.createdBy) !== Number(currentUser._id) && !isAdmin) {
      throw new Error("Forbidden: Only event creator or admin can delete this event");
    }
    
    const result = await deleteEvent(eventId);
    
    // Revalidate club page to reflect deleted event
    revalidatePath(`/dashboard/clubs/${event.clubId}`);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: error.message };
  }
}


export async function modifyEvent(eventId, clubId, eventData) {
  try {
    const currentUser = await requireAuth();
    const event = await getEvent(eventId);
    
    // Only event creator, CollegeAdmin, or SystemAdmin can update
    const isAdmin = currentUser.role === "CollegeAdmin" || currentUser.role === "SystemAdmin";
    if (Number(event.createdBy) !== Number(currentUser._id) && !isAdmin) {
      throw new Error("Forbidden: Only event creator or admin can update this event");
    }
    
    const result = await updateEvent(eventId, eventData);
    
    // Revalidate club page to reflect updated event
    revalidatePath(`/dashboard/clubs/${clubId}`);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }
}


export async function registerForEventAction(eventId, userId) {
  try {
    const currentUser = await requireAuth();
    
    // User can only register with their own ID
    if (Number(currentUser._id) !== Number(userId)) {
      throw new Error("Forbidden: You can only register with your own account");
    }
    
    const result = await registerForEvent(eventId, userId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error registering for event:", error);
    return { success: false, error: error.message };
  }
}

export async function unregisterFromEventAction(eventId) {
  try {
    const currentUser = await requireAuth();
    
    const result = await unregisterFromEvent(eventId, currentUser._id);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error unregistering from event:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchUserEvents(userId) {
  try {
    const currentUser = await requireAuth();
    
    // Users can only fetch their own events unless they're admin
    if (Number(currentUser._id) !== Number(userId) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: You can only access your own events");
    }
    
    const events = await getUserEvents(userId);
    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching user events:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchPublicEvents() {
  try {
    // Any authenticated user can fetch public events
    await requireAuth();
    
    const events = await getPublicEvents();
    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching public events:", error);
    return { success: false, error: error.message };
  }
}
