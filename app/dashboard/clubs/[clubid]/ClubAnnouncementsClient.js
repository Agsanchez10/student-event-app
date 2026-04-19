"use client";

import { useState, useEffect } from "react";
import { addAnnouncement, removeAnnouncement, modifyAnnouncement } from "@/app/actions/announcementActions";

export default function ClubAnnouncementsClient({
    club,
    currentUserId,
    userRole,
    isAdmin,
    announcements,
    clubEvents,
    ownerNameCache,
    setSelectedEvent,
    handleOpenFlagForm,
    formatDate,
}) {
    const canModerate = isAdmin || userRole === "CollegeAdmin";
    const [clubAnnouncements, setClubAnnouncements] = useState(announcements || []);
    const [isDeleting, setIsDeleting] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [announcementFormData, setAnnouncementFormData] = useState({
        title: "",
        description: "",
        eventId: "",
    });
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
    });

    // Sync local state with prop when announcements change
    useEffect(() => {
        setClubAnnouncements(announcements || []);
    }, [announcements]);

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementFormData.title.trim() || !announcementFormData.description.trim()) {
            alert("Please fill in all fields");
            return;
        }

        setIsPosting(true);
        try {
            const result = await addAnnouncement(club._id, {
                title: announcementFormData.title,
                description: announcementFormData.description,
                ownerId: currentUserId,
                clubID: club._id,
                eventId: announcementFormData.eventId || null,
            });

            if (result.success) {
                const newAnnouncement = result.data;
                setClubAnnouncements([newAnnouncement, ...clubAnnouncements]);
                setAnnouncementFormData({ title: "", description: "", eventId: "" });
                setShowAnnouncementForm(false);
                alert("Announcement posted successfully!");
            } else {
                alert("Failed to post announcement");
            }
        } catch (error) {
            console.error("Error posting announcement:", error);
            alert("Error posting announcement");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        setIsDeleting(announcementId);
        try {
            const result = await removeAnnouncement(announcementId, club._id);

            if (result.success) {
                setClubAnnouncements(clubAnnouncements.filter((a) => String(a._id) !== String(announcementId)));
                alert("Announcement deleted successfully!");
            } else {
                alert("Failed to delete announcement");
            }
        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert("Error deleting announcement");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleOpenEditForm = (announcement) => {
        setEditingAnnouncementId(announcement._id);
        setEditFormData({
            title: announcement.title,
            description: announcement.description,
        });
        setIsEditing(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (!editFormData.title.trim() || !editFormData.description.trim()) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const result = await modifyAnnouncement(editingAnnouncementId, club._id, editFormData);

            if (result.success) {
                const updatedAnnouncement = result.data;
                setClubAnnouncements(
                    clubAnnouncements.map((a) =>
                        String(a._id) === String(editingAnnouncementId) ? updatedAnnouncement : a
                    )
                );
                setIsEditing(false);
                setEditingAnnouncementId(null);
                setEditFormData({ title: "", description: "" });
                alert("Announcement updated successfully!");
            } else {
                alert("Failed to update announcement");
            }
        } catch (error) {
            console.error("Error updating announcement:", error);
            alert("Error updating announcement");
        }
    };

    const handleEditAnnouncement = async (announcementId, updatedData) => {
        try {
            const result = await modifyAnnouncement(announcementId, club._id, updatedData);

            if (result.success) {
                const updatedAnnouncement = result.data;
                setClubAnnouncements(
                    clubAnnouncements.map((a) =>
                        String(a._id) === String(announcementId) ? updatedAnnouncement : a
                    )
                );
                alert("Announcement updated successfully!");
            } else {
                alert("Failed to update announcement");
            }
        } catch (error) {
            console.error("Error updating announcement:", error);
            alert("Error updating announcement");
        }
    };

    return (
        <div className="space-y-6">
            {/* Edit Announcement Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-lg">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditingAnnouncementId(null);
                            }}
                            className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                        >
                            ✕
                        </button>
                        <h3 className="mb-6 text-xl font-semibold text-slate-950">Edit Announcement</h3>
                        <form onSubmit={handleSubmitEdit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Announcement Title"
                                value={editFormData.title}
                                onChange={(e) =>
                                    setEditFormData({
                                        ...editFormData,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                            />
                            <textarea
                                placeholder="Announcement Description"
                                value={editFormData.description}
                                onChange={(e) =>
                                    setEditFormData({
                                        ...editFormData,
                                        description: e.target.value,
                                    })
                                }
                                rows="4"
                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                            />
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
                                        setEditingAnnouncementId(null);
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
                        onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                        className="rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                    >
                        {showAnnouncementForm ? "Cancel" : "Post Announcement"}
                    </button>

                    {showAnnouncementForm && (
                        <form onSubmit={handlePostAnnouncement} className="mt-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Announcement Title"
                                value={announcementFormData.title}
                                onChange={(e) =>
                                    setAnnouncementFormData({
                                        ...announcementFormData,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                            />
                            <textarea
                                placeholder="Announcement Description"
                                value={announcementFormData.description}
                                onChange={(e) =>
                                    setAnnouncementFormData({
                                        ...announcementFormData,
                                        description: e.target.value,
                                    })
                                }
                                rows="4"
                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                            />
                            <select
                                value={announcementFormData.eventId}
                                onChange={(e) =>
                                    setAnnouncementFormData({
                                        ...announcementFormData,
                                        eventId: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                            >
                                <option value="">Select an event (optional)</option>
                                {clubEvents.map((event) => (
                                    <option key={event._id} value={event._id}>
                                        {event.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={isPosting}
                                className="rounded-full bg-[#e05c5c] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                            >
                                {isPosting ? "Posting..." : "Post"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {clubAnnouncements.length > 0 ? (
                <div className="space-y-4">
                    {clubAnnouncements.map((announcement) => {
                        const relatedEvent = announcement.eventId ? clubEvents.find(e => String(e._id) === String(announcement.eventId)) : null;
                        return (
                        <div
                            key={announcement._id}
                            className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-950">
                                        {announcement.title}
                                    </h3>
                                    <p className="mt-2 text-slate-700">
                                        {announcement.description}
                                    </p>
                                    {relatedEvent && (
                                        <button
                                            onClick={() => setSelectedEvent(relatedEvent)}
                                            className="mt-3 w-full rounded-lg border border-[#e05c5c]/30 bg-[#e05c5c]/5 p-3 text-left transition hover:bg-[#e05c5c]/10 hover:border-[#e05c5c]/50 cursor-pointer"
                                        >
                                            <p className="text-sm font-semibold text-[#a33b3b]">📅 Related Event</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-950">{relatedEvent.name}</p>
                                            <p className="mt-1 text-xs text-slate-600">
                                                {formatDate(relatedEvent.date)}
                                            </p>
                                            {relatedEvent.location && (
                                                <p className="mt-1 text-xs text-slate-600">
                                                    📍 {relatedEvent.location}
                                                </p>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="text-right whitespace-nowrap">
                                        <p className="text-xs font-semibold text-slate-600">
                                            {ownerNameCache[announcement.ownerId] || "Unknown"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {formatDate(announcement.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <button
                                            onClick={() => handleOpenFlagForm(announcement, "announcement")}
                                            className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-yellow-600"
                                            title="Report this announcement"
                                        >
                                            🚩 Flag
                                        </button>
                                        {canModerate && (
                                            <>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleOpenEditForm(announcement)}
                                                        className="rounded-full bg-[#c8a882] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#a68963]"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                                                    disabled={isDeleting === announcement._id}
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
                <p className="text-slate-700">No announcements yet.</p>
            )}
        </div>
    );
}
