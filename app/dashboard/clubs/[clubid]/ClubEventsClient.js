"use client";

import { useState, useEffect } from "react";
import { addEvent, removeEvent, modifyEvent, registerForEventAction, unregisterFromEventAction } from "@/app/actions/eventActions";

export default function ClubEventsClient({
    club,
    currentUserId,
    userRole,
    isAdmin,
    isMember,
    events,
    handleOpenFlagForm,
    setSelectedEvent,
    formatDate,
}) {
    const canModerate = isAdmin || userRole === "CollegeAdmin";
    const [clubEvents, setClubEvents] = useState(events || []);
    const [isDeleting, setIsDeleting] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("soonest");
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [eventFormData, setEventFormData] = useState({
        name: "",
        description: "",
        date: "",
        location: "",
        category: "other",
        isFree: true,
        price: null,
    });
    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        date: "",
        location: "",
        category: "other",
        isFree: true,
        price: null,
    });

    // Initialize clubEvents from events prop on mount
    useEffect(() => {
        setClubEvents(events || []);
    }, []);  // Only on mount, don't update when events prop changes

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (
            !eventFormData.name.trim() ||
            !eventFormData.description.trim() ||
            !eventFormData.date
        ) {
            alert("Please fill in all required fields");
            return;
        }

        if (!eventFormData.isFree && (!eventFormData.price || eventFormData.price <= 0)) {
            alert("Please enter a valid price for paid events");
            return;
        }

        const eventDate = new Date(eventFormData.date);
        if (eventDate < new Date()) {
            alert("Event date must be in the future");
            return;
        }

        setIsPosting(true);
        try {
            console.log("Creating event with data:", {
                isFree: eventFormData.isFree,
                price: eventFormData.price,
                name: eventFormData.name,
            });
            const result = await addEvent({
                name: eventFormData.name,
                description: eventFormData.description,
                date: eventDate.toISOString(),
                location: eventFormData.location || "TBD",
                category: eventFormData.category,
                isFree: eventFormData.isFree,
                price: eventFormData.isFree ? null : eventFormData.price,
                clubId: club._id,
                ownerId: currentUserId,
                visibility: "private",
            });

            console.log("Event creation result:", result);
            if (result.success) {
                const newEvent = result.data;
     
                setClubEvents([newEvent, ...clubEvents]);
                setEventFormData({
                    name: "",
                    description: "",
                    date: "",
                    location: "",
                    category: "other",
                    isFree: true,
                    price: null,
                });
                setShowEventForm(false);
                alert("Event created successfully!");
            } else {
                alert("Failed to create event");
            }
        } catch (error) {            
            alert("Error creating event");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        setIsDeleting(eventId);
        try {
            const result = await removeEvent(eventId);

            if (result.success) {
                setClubEvents(clubEvents.filter((e) => String(e._id) !== String(eventId)));
                alert("Event deleted successfully!");
            } else {
                alert("Failed to delete event");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error deleting event");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleRegisterEvent = async (eventId) => {
        try {
            const result = await registerForEventAction(eventId, currentUserId);

            if (result.success) {
                alert("Successfully registered for the event!");
                window.location.reload();
            } else {
                alert("Failed to register for the event");
            }
        } catch (error) {
            console.error("Error registering for event:", error);
            alert("Error registering for event");
        }
    };

    const handleUnregisterEvent = async (eventId) => {
        if (!confirm("Are you sure you want to unregister from this event?")) return;

        try {
            const result = await unregisterFromEventAction(eventId);

            if (result.success) {
                alert("Successfully unregistered from the event!");
                window.location.reload();
            } else {
                alert("Failed to unregister from the event");
            }
        } catch (error) {
            console.error("Error unregistering from event:", error);
            alert("Error unregistering from event");
        }
    };

    const isUserRegisteredForEvent = (event) => {
        if (!currentUserId || !event.registrationList) return false;
        return event.registrationList.some(id => String(id) === String(currentUserId));
    };

    const isEventInFuture = (eventDate) => {
        return new Date(eventDate) > new Date();
    };

    const getFilteredAndSortedEvents = () => {
        const filtered = clubEvents
            // Filter: include only current/future events unless showPastEvents is true
            .filter(event => {
                if (showPastEvents) return true; // Show all events
                return isEventInFuture(event.date); // Show only future events
            })
            // Filter: search by name or description
            .filter(event => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    event.name.toLowerCase().includes(searchLower) ||
                    event.description.toLowerCase().includes(searchLower)
                );
            })
            // Sort: by date (soonest first by default)
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return sortOrder === "soonest" ? dateA - dateB : dateB - dateA;
            });
        
        console.log("Filtered events:", filtered.map(e => ({name: e.name, isFree: e.isFree, price: e.price})));
        return filtered;
    };

    const handleOpenEditForm = (event) => {
        setEditingEventId(event._id);
        setEditFormData({
            name: event.name,
            description: event.description,
            date: new Date(event.date).toISOString().slice(0, 16),
            location: event.location,
            category: event.category || "other",
            isFree: event.isFree !== undefined ? event.isFree : true,
            price: event.price || null,
        });
        setIsEditing(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (
            !editFormData.name.trim() ||
            !editFormData.description.trim() ||
            !editFormData.date
        ) {
            alert("Please fill in all required fields");
            return;
        }

        if (!editFormData.isFree && (!editFormData.price || editFormData.price <= 0)) {
            alert("Please enter a valid price for paid events");
            return;
        }

        const eventDate = new Date(editFormData.date);
        if (eventDate < new Date()) {
            alert("Event date must be in the future");
            return;
        }

        try {
            const result = await modifyEvent(editingEventId, club._id, {
                name: editFormData.name,
                description: editFormData.description,
                date: new Date(editFormData.date).toISOString(),
                location: editFormData.location || "TBD",
                category: editFormData.category,
                isFree: editFormData.isFree,
                price: editFormData.isFree ? null : editFormData.price,
            });

            if (result.success) {
                const updatedEvent = result.data;
                setClubEvents(
                    clubEvents.map((e) =>
                        String(e._id) === String(editingEventId) ? updatedEvent : e
                    )
                );
                setIsEditing(false);
                setEditingEventId(null);
                setEditFormData({ name: "", description: "", date: "", location: "", category: "other", isFree: true, price: null });
                alert("Event updated successfully!");
            } else {
                alert("Failed to update event");
            }
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Error updating event");
        }
    };

    return (
        <div className="space-y-6">
            {/* Edit Event Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-lg">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditingEventId(null);
                            }}
                            className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                        >
                            ✕
                        </button>
                        <h3 className="mb-6 text-xl font-semibold text-slate-950">Edit Event</h3>
                        <form onSubmit={handleSubmitEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter event name"
                                    value={editFormData.name}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                                <textarea
                                    placeholder="Enter event description"
                                    value={editFormData.description}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows="3"
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    value={editFormData.date}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            date: e.target.value,
                                        })
                                    }
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter event location"
                                    value={editFormData.location}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            location: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    value={editFormData.category}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            category: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                                >
                                    <option value="music">Music</option>
                                    <option value="tech">Tech</option>
                                    <option value="sports">Sports</option>
                                    <option value="social">Social</option>
                                    <option value="academic">Academic</option>
                                    <option value="arts">Arts</option>
                                    <option value="wellness">Wellness</option>
                                    <option value="gaming">Gaming</option>
                                    <option value="networking">Networking</option>
                                    <option value="professional">Professional</option>
                                    <option value="community-service">Community Service</option>
                                    <option value="fundraising">Fundraising</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditFormData({
                                                ...editFormData,
                                                isFree: true,
                                                price: null,
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            editFormData.isFree
                                                ? "bg-green-100 text-green-700"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditFormData({
                                            ...editFormData,
                                            isFree: false,
                                        })}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            !editFormData.isFree
                                                ? "bg-amber-100 text-amber-700"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>
                            {!editFormData.isFree && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter price"
                                        value={editFormData.price || ""}
                                        onChange={(e) =>
                                            setEditFormData({
                                                ...editFormData,
                                                price: parseFloat(e.target.value) || null,
                                            })
                                        }
                                        min="0.01"
                                        step="0.01"
                                        required
                                        className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                    />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-full bg-[#e05c5c] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingEventId(null);
                                    }}
                                    className="flex-1 rounded-full border border-[#d4b18b] bg-[#fff5e4] px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#f8e7ce]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAdmin && (
                <div className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-md shadow-[#b9955d]/10">
                    <button
                        onClick={() => setShowEventForm(!showEventForm)}
                        className="rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                    >
                        {showEventForm ? "Cancel" : "Create Event"}
                    </button>

                    {showEventForm && (
                        <form onSubmit={handleCreateEvent} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter event name"
                                    value={eventFormData.name}
                                    onChange={(e) =>
                                        setEventFormData({
                                            ...eventFormData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                                <textarea
                                    placeholder="Enter event description"
                                    value={eventFormData.description}
                                    onChange={(e) =>
                                        setEventFormData({
                                            ...eventFormData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows="3"
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    value={eventFormData.date}
                                    onChange={(e) =>
                                        setEventFormData({
                                            ...eventFormData,
                                            date: e.target.value,
                                        })
                                    }
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter event location"
                                    value={eventFormData.location}
                                    onChange={(e) =>
                                        setEventFormData({
                                            ...eventFormData,
                                            location: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    value={eventFormData.category}
                                    onChange={(e) =>
                                        setEventFormData({
                                            ...eventFormData,
                                            category: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                                >
                                    <option value="music">Music</option>
                                    <option value="tech">Tech</option>
                                    <option value="sports">Sports</option>
                                    <option value="social">Social</option>
                                    <option value="academic">Academic</option>
                                    <option value="arts">Arts</option>
                                    <option value="wellness">Wellness</option>
                                    <option value="gaming">Gaming</option>
                                    <option value="networking">Networking</option>
                                    <option value="professional">Professional</option>
                                    <option value="community-service">Community Service</option>
                                    <option value="fundraising">Fundraising</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEventFormData({
                                                ...eventFormData,
                                                isFree: true,
                                                price: null,
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            eventFormData.isFree
                                                ? "bg-green-100 text-green-700"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEventFormData({
                                            ...eventFormData,
                                            isFree: false,
                                        })}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            !eventFormData.isFree
                                                ? "bg-amber-100 text-amber-700"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>
                            {!eventFormData.isFree && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter price"
                                        value={eventFormData.price || ""}
                                        onChange={(e) =>
                                            setEventFormData({
                                                ...eventFormData,
                                                price: parseFloat(e.target.value) || null,
                                            })
                                        }
                                        min="0.01"
                                        step="0.01"
                                        required
                                        className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                    />
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isPosting}
                                className="rounded-full bg-[#e05c5c] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                            >
                                {isPosting ? "Creating..." : "Create Event"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {clubEvents.length > 0 ? (
                <div className="space-y-4">
                    {/* Search and Sort Controls */}
                    <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10 space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Search events by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]/50"
                            />
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-semibold text-slate-700">Sort:</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-2 text-sm text-slate-900"
                                >
                                    <option value="soonest">Soonest First</option>
                                    <option value="latest">Latest First</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setShowPastEvents(!showPastEvents)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    showPastEvents
                                        ? "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"
                                        : "border border-[#d4b18b] bg-[#fff5e4] text-slate-900 hover:bg-[#f8e7ce]"
                                }`}
                            >
                                {showPastEvents ? "Showing Past Events" : "Show Past Events"}
                            </button>
                        </div>
                    </div>

                    {/* Events List */}
                    {getFilteredAndSortedEvents().length > 0 ? (
                        <div className="space-y-4">
                            {getFilteredAndSortedEvents().map((event) => {
                                const isPastEvent = !isEventInFuture(event.date);
                                console.log(`Event: ${event.name}, isFree: ${event.isFree}, price: ${event.price}, type: ${typeof event.isFree}`);
                                return (
                        <div
                            key={event._id}
                            className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] shadow-md shadow-[#b9955d]/10 overflow-hidden"
                        >
                            {isPastEvent && (
                                <div className="w-full bg-[#e05c5c] px-6 py-2 text-center font-semibold text-white">
                                    Past Event
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-950">
                                            {event.name}
                                        </h3>
                                        <p className="mt-2 text-slate-700">
                                        {event.description}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {event.category && (
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                {event.category.charAt(0).toUpperCase() + event.category.slice(1).replace("-", " ")}
                                            </span>
                                        )}
                                        {(() => {
                                            const priceVal = event.price;
                                            // If price exists and is > 0, it's paid. Otherwise it's free
                                            const isPaid = priceVal && parseFloat(priceVal) > 0;
                                            const displayText = isPaid ? `Paid - $${priceVal}` : "Free";
                                            console.log(`EVENT ${event.name}: price=${priceVal}, isPaid=${isPaid}, display=${displayText}`);
                                            return (
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium border-2 ${
                                                    isPaid ? "bg-red-300 text-red-900 border-red-900" : "bg-green-100 text-green-700 border-green-700"
                                                }`}>
                                                    {displayText}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                                        <p><strong>Date:</strong> {formatDate(event.date)}</p>
                                        <p><strong>Location:</strong> {event.location || "TBD"}</p>
                                        <p><strong>Registrations:</strong> {event.registrationList?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {/* Details Button */}
                                    <button
                                        onClick={() => setSelectedEvent(event)}
                                        className="rounded-full bg-[#d4975a] px-3 py-1 text-center text-xs font-semibold text-white transition hover:bg-[#b8805f]"
                                    >
                                        Details
                                    </button>

                                    {/* Flag Button */}
                                    <button
                                        onClick={() => handleOpenFlagForm(event, "event")}
                                        className="rounded-full bg-yellow-500 px-3 py-1 text-center text-xs font-semibold text-white transition hover:bg-yellow-600"
                                        title="Report this event"
                                    >
                                        🚩 Flag
                                    </button>

                                    {/* Register/Leave Button for Students */}
                                    {!isAdmin && (
                                        isMember ? (
                                            <button
                                                onClick={() => {
                                                    if (isUserRegisteredForEvent(event)) {
                                                        handleUnregisterEvent(event._id);
                                                    } else {
                                                        handleRegisterEvent(event._id);
                                                    }
                                                }}
                                                className={`rounded-full px-3 py-1 text-center text-xs font-semibold text-white transition ${
                                                    isUserRegisteredForEvent(event)
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-[#8fbc8f] hover:bg-[#7ba77b]"
                                                }`}
                                            >
                                                {isUserRegisteredForEvent(event) ? "Leave" : "Register"}
                                            </button>
                                        ) : null
                                    )}

                                    {/* Edit/Delete Buttons for Admin / CollegeAdmin */}
                                    {canModerate && (
                                        <>
                                            {isAdmin && isEventInFuture(event.date) && (
                                                <button
                                                    onClick={() => handleOpenEditForm(event)}
                                                    className="rounded-full bg-[#c8a882] px-3 py-1 text-center text-xs font-semibold text-white transition hover:bg-[#a68963]"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteEvent(event._id)}
                                                disabled={isDeleting === event._id}
                                                className="rounded-full bg-[#e05c5c] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            </div>
                        </div>
                            );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-[1.8rem] border border-dashed border-[#d4b18b] bg-[#fff5e4] p-12 text-center text-slate-700">
                            <p>No upcoming events match your search.</p>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-slate-700">No events yet.</p>
            )}
        </div>
    );
}
